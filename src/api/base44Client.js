import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
const base44 = createClient({
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
// Cache the result for 60s so all callers share one request.
let _cachedUser = null;
let _cachedUserTime = 0;
const _USER_CACHE_TTL = 60000;

const _originalMe = base44.auth.me.bind(base44.auth);
base44.auth.me = async function () {
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

// ── Entity filter/list cache + dedup + retry ───────────────────
// Multiple pages/components fetch the same data simultaneously on mount.
// Cache filter/list results for 30s and deduplicate concurrent identical
// calls so 5 components requesting the same data = 1 API call.
const _filterCache = new Map();
const _FILTER_CACHE_TTL = 30000;

const ENTITY_NAMES = [
  'Student', 'Lesson', 'Payment', 'Homework', 'LessonReport',
  'Message', 'GamePool', 'PDFHomework', 'MessageTemplate', 'User',
];

function _retry(fn, retries = 3) {
  return (async () => {
    for (let i = 0; i <= retries; i++) {
      try { return await fn(); }
      catch (e) {
        if (i === retries) throw e;
        await new Promise(r => setTimeout(r, 1500 * (i + 1)));
      }
    }
  })();
}

function _invalidateEntity(entityName) {
  for (const key of _filterCache.keys()) {
    if (key.startsWith(`${entityName}:`)) _filterCache.delete(key);
  }
}

for (const name of ENTITY_NAMES) {
  const entity = base44.entities[name];
  if (!entity) continue;

  // Cache filter
  if (typeof entity.filter === 'function') {
    const orig = entity.filter.bind(entity);
    entity.filter = function (query, sort, limit) {
      const key = `${name}:f:${JSON.stringify({ q: query, s: sort, l: limit })}`;
      const now = Date.now();
      const cached = _filterCache.get(key);
      if (cached && now - cached.time < _FILTER_CACHE_TTL) return cached.data;
      if (cached && cached.promise) return cached.promise;
      const promise = _retry(() => orig(query, sort, limit)).then(data => {
        _filterCache.set(key, { data, time: Date.now() });
        return data;
      }).catch(e => { _filterCache.delete(key); throw e; });
      _filterCache.set(key, { promise, time: now });
      return promise;
    };
  }

  // Cache list
  if (typeof entity.list === 'function') {
    const orig = entity.list.bind(entity);
    entity.list = function (sort, limit) {
      const key = `${name}:l:${JSON.stringify({ s: sort, l: limit })}`;
      const now = Date.now();
      const cached = _filterCache.get(key);
      if (cached && now - cached.time < _FILTER_CACHE_TTL) return cached.data;
      if (cached && cached.promise) return cached.promise;
      const promise = _retry(() => orig(sort, limit)).then(data => {
        _filterCache.set(key, { data, time: Date.now() });
        return data;
      }).catch(e => { _filterCache.delete(key); throw e; });
      _filterCache.set(key, { promise, time: now });
      return promise;
    };
  }

  // Invalidate cache on writes
  for (const method of ['create', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'updateMany', 'deleteMany']) {
    if (typeof entity[method] === 'function') {
      const orig = entity[method].bind(entity);
      entity[method] = function (...args) {
        _invalidateEntity(name);
        return orig(...args);
      };
    }
  }
}

export { base44 };