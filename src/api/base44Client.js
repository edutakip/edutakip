import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const _base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// ── Global auth.me() cache (60s) ──────────────────────────────
let _cachedUser = null;
let _cachedUserTime = 0;
const _USER_CACHE_TTL = 60000;

const _originalMe = _base44.auth.me.bind(_base44.auth);
_base44.auth.me = async function () {
  const now = Date.now();
  if (_cachedUser && now - _cachedUserTime < _USER_CACHE_TTL) return _cachedUser;
  try {
    const user = await _originalMe();
    _cachedUser = user;
    _cachedUserTime = now;
    return user;
  } catch (e) {
    _cachedUser = null;
    _cachedUserTime = 0;
    throw e;
  }
};

// ── Global request queue (spaces out requests to avoid rate limits) ───
const _MIN_GAP = 180;          // ms between consecutive requests
const _MAX_CONCURRENT = 4;     // max parallel in-flight requests
let _inFlight = 0;
let _lastReqTime = 0;
let _queueTail = Promise.resolve();

function _throttled(fn) {
  const run = async () => {
    // Wait for a concurrency slot
    while (_inFlight >= _MAX_CONCURRENT) {
      await new Promise(r => setTimeout(r, 20));
    }
    // Enforce minimum gap since last request started
    const elapsed = Date.now() - _lastReqTime;
    if (elapsed < _MIN_GAP) {
      await new Promise(r => setTimeout(r, _MIN_GAP - elapsed));
    }
    _inFlight++;
    _lastReqTime = Date.now();
    try {
      return await fn();
    } finally {
      _inFlight--;
    }
  };
  // Serialize queue chaining so gap is preserved across burst calls
  const task = _queueTail.then(run, run);
  // Keep the chain moving even if this task rejects
  _queueTail = task.catch(() => {});
  return task;
}

// ── Retry with exponential backoff (rate-limit safety net) ───
function _isRateLimit(e) {
  const msg = (e?.message || String(e || '')).toLowerCase();
  return msg.includes('rate limit') || msg.includes('rate_limit') || msg.includes('429');
}

async function _retry(fn, retries = 5) {
  for (let i = 0; i <= retries; i++) {
    try { return await _throttled(fn); }
    catch (e) {
      if (i === retries) throw e;
      const isRL = _isRateLimit(e);
      const base = isRL ? 1500 : 400;
      const delay = isRL ? base * Math.pow(1.8, i) : base * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ── Entity filter/list cache (30s) + dedup ────────────────────
const _filterCache = new Map();
const _FILTER_CACHE_TTL = 30000;

function _invalidateEntity(entityName) {
  for (const key of _filterCache.keys()) {
    if (key.startsWith(`${entityName}:`)) _filterCache.delete(key);
  }
}

const WRITE_METHODS = new Set(['create', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'updateMany', 'deleteMany']);
const CACHE_METHODS = new Set(['filter', 'list']);

const _entitiesProxy = new Proxy(_base44.entities, {
  get(target, entityName) {
    const entity = target[entityName];
    if (!entity || typeof entity !== 'object') return entity;

    return new Proxy(entity, {
      get(entTarget, methodName) {
        const method = entTarget[methodName];
        if (typeof method !== 'function') return method;

        // Cached read methods (filter, list) — run in parallel, dedup identical calls
        if (CACHE_METHODS.has(methodName)) {
          return function (...args) {
            const key = `${entityName}:${methodName}:${JSON.stringify(args)}`;
            const now = Date.now();
            const cached = _filterCache.get(key);
            // Return cached data only if we actually have resolved data
            if (cached && cached.data && now - cached.time < _FILTER_CACHE_TTL) {
              return Promise.resolve(cached.data);
            }
            // Dedup: if a request for this key is already in-flight, reuse it
            if (cached && cached.promise) return cached.promise;
            const promise = _retry(() => method.apply(entTarget, args)).then(data => {
              const safe = Array.isArray(data) ? data : [];
              _filterCache.set(key, { data: safe, time: Date.now() });
              return safe;
            }).catch(e => { _filterCache.delete(key); throw e; });
            _filterCache.set(key, { promise, time: now });
            return promise;
          };
        }

        // Write methods — invalidate cache
        if (WRITE_METHODS.has(methodName)) {
          return function (...args) {
            _invalidateEntity(entityName);
            return _retry(() => method.apply(entTarget, args));
          };
        }

        // Other methods (get, schema, subscribe)
        return function (...args) {
          return _retry(() => method.apply(entTarget, args));
        };
      }
    });
  }
});

// ── Wrap base44 so .entities returns the proxy ────────────────
const base44 = new Proxy(_base44, {
  get(target, prop) {
    if (prop === 'entities') return _entitiesProxy;
    return target[prop];
  },
});

export { base44 };