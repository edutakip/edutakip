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

// ── Global auth.me() cache ─────────────────────────────────────
// Every page/component calls base44.auth.me() on mount, causing
// 8+ redundant API calls per page load → rate limit exceeded.
let _cachedUser = null;
let _cachedUserTime = 0;
const _USER_CACHE_TTL = 60000;

const _originalMe = _base44.auth.me.bind(_base44.auth);
_base44.auth.me = async function () {
  const now = Date.now();
  if (_cachedUser && now - _cachedUserTime < _USER_CACHE_TTL) {
    return _cachedUser;
  }
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

// ── Entity filter/list cache + dedup + retry via Proxy ─────────
// Wraps base44.entities so every filter/list call is cached for 30s
// and deduplicated (concurrent identical calls share one request).
// Write operations invalidate the cache for that entity.
const _filterCache = new Map();
const _FILTER_CACHE_TTL = 30000;

function _retry(fn, retries = 4) {
  return (async () => {
    for (let i = 0; i <= retries; i++) {
      try { return await fn(); }
      catch (e) {
        if (i === retries) throw e;
        const delay = 1000 * Math.pow(2, i); // 1s, 2s, 4s, 8s
        await new Promise(r => setTimeout(r, delay));
      }
    }
  })();
}

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

        if (CACHE_METHODS.has(methodName)) {
          return function (...args) {
            const key = `${entityName}:${methodName}:${JSON.stringify(args)}`;
            const now = Date.now();
            const cached = _filterCache.get(key);
            if (cached && now - cached.time < _FILTER_CACHE_TTL) return Promise.resolve(cached.data);
            if (cached && cached.promise) return cached.promise;
            const promise = _retry(() => method.apply(entTarget, args)).then(data => {
              _filterCache.set(key, { data, time: Date.now() });
              return data;
            }).catch(e => { _filterCache.delete(key); throw e; });
            _filterCache.set(key, { promise, time: now });
            return promise;
          };
        }

        if (WRITE_METHODS.has(methodName)) {
          return function (...args) {
            _invalidateEntity(entityName);
            return method.apply(entTarget, args);
          };
        }

        return method.bind(entTarget);
      }
    });
  }
});

const base44 = new Proxy(_base44, {
  get(target, prop) {
    if (prop === 'entities') return _entitiesProxy;
    return target[prop];
  }
});

export { base44 };