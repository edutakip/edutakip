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

// ── Global API call queue ─────────────────────────────────────
// Serializes ALL entity API calls with a small gap so they never
// burst and trigger rate-limit, regardless of how many pages fire
// calls simultaneously.
let _apiQueue = Promise.resolve();
const _API_GAP_MS = 300;

function _queueCall(fn) {
  const result = _apiQueue.then(async () => {
    const data = await fn();
    await new Promise(r => setTimeout(r, _API_GAP_MS));
    return data;
  });
  // Keep chain alive even if one call fails
  _apiQueue = result.catch(() => null);
  return result;
}

// ── Retry with exponential backoff ────────────────────────────
async function _retry(fn, retries = 4) {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
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

        // Cached read methods (filter, list)
        if (CACHE_METHODS.has(methodName)) {
          return function (...args) {
            const key = `${entityName}:${methodName}:${JSON.stringify(args)}`;
            const now = Date.now();
            const cached = _filterCache.get(key);
            if (cached && now - cached.time < _FILTER_CACHE_TTL) {
              return Promise.resolve(Array.isArray(cached.data) ? cached.data : []);
            }
            if (cached && cached.promise) return cached.promise;
            const promise = _queueCall(() => _retry(() => method.apply(entTarget, args))).then(data => {
              const safe = Array.isArray(data) ? data : [];
              _filterCache.set(key, { data: safe, time: Date.now() });
              return safe;
            }).catch(e => { _filterCache.delete(key); throw e; });
            _filterCache.set(key, { promise, time: now });
            return promise;
          };
        }

        // Write methods — invalidate cache, queue the call
        if (WRITE_METHODS.has(methodName)) {
          return function (...args) {
            _invalidateEntity(entityName);
            return _queueCall(() => method.apply(entTarget, args));
          };
        }

        // Other methods (get, schema, subscribe) — queue with retry
        return function (...args) {
          return _queueCall(() => _retry(() => method.apply(entTarget, args)));
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