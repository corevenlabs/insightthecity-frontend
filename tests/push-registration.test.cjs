const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

const TOKEN = 'ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]';

function setup() {
  const store = new Map();
  const state = { permission: 'granted', online: true, calls: [], store };
  const notifications = {
    IosAuthorizationStatus: { NOT_DETERMINED: 0, DENIED: 1 },
    getPermissionsAsync: async () => ({ granted: state.permission === 'granted', ios: { status: state.permission === 'granted' ? 2 : state.permission === 'denied' ? 1 : 0 } }),
    getExpoPushTokenAsync: async () => ({ data: TOKEN }),
  };
  const dependencies = {
    '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async (k) => store.get(k) ?? null, setItem: async (k, v) => { store.set(k, v); }, removeItem: async (k) => { store.delete(k); } } },
    expo: { requireOptionalNativeModule: () => ({}) },
    'expo-constants': { __esModule: true, default: { expoConfig: { extra: { eas: { projectId: 'p' } } } } },
    'expo-notifications': notifications,
    'react-native': { Platform: { OS: 'ios' }, Linking: { openSettings: async () => {} } },
    '../constants/api': { API_URL: 'https://api.example.test' },
  };
  const fetch = async (url, options) => {
    await new Promise((resolve) => setImmediate(resolve));
    if (!state.online) throw new Error('offline');
    state.calls.push([options.method, new URL(url).pathname, JSON.parse(options.body), options.headers.Authorization]);
    return { ok: true };
  };
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('src/lib/pushNotifications.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  new Function('module', 'exports', 'require', 'fetch', source)(module, module.exports, (name) => { if (name in dependencies) return dependencies[name]; throw Error('Unexpected dependency ' + name); }, fetch);
  return { push: module.exports, state };
}
const RELEASE = ['POST', '/api/users/push-token/release', { token: TOKEN }, undefined];
const REGISTER = (session) => ['PUT', '/api/users/me/push-token', { token: TOKEN, platform: 'ios' }, `Bearer ${session}`];

test('signing out unlinks the device without needing the session', async () => {
  const { push, state } = setup();
  assert.equal(await push.syncPushToken('session-a', 'es'), true);
  await push.unregisterPushToken();
  assert.deepEqual(state.calls, [REGISTER('session-a'), RELEASE]);
  assert.equal(state.store.size, 0);
  await push.unregisterPushToken();
  assert.equal(state.calls.length, 2);
});

test('an unlink that failed offline is retried until the server confirms', async () => {
  const { push, state } = setup();
  await push.syncPushToken('session-a', 'es');
  state.online = false;
  await push.unregisterPushToken();
  await push.refreshPushRegistration(null, 'es');
  assert.equal(state.store.get('itc_push_token_release'), TOKEN);
  state.online = true;
  await push.refreshPushRegistration(null, 'es');
  assert.deepEqual(state.calls.at(-1), RELEASE);
  assert.equal(state.store.size, 0);
});

test('a pending unlink never undoes the next account on the same device', async () => {
  const { push, state } = setup();
  await push.syncPushToken('session-a', 'es');
  await Promise.all([push.unregisterPushToken(), push.syncPushToken('session-b', 'es')]);
  assert.deepEqual(state.calls.map((call) => call[0]), ['PUT', 'POST', 'PUT']);
  state.online = false;
  await push.unregisterPushToken();
  state.online = true;
  await push.syncPushToken('session-c', 'es');
  const total = state.calls.length;
  await push.refreshPushRegistration('session-c', 'es');
  assert.equal(state.calls.length, total);
  assert.equal(state.store.has('itc_push_token_release'), false);
});

test('turning notifications off in the phone unlinks the device, and on again links it', async () => {
  const { push, state } = setup();
  await push.syncPushToken('session-a', 'es');
  await push.refreshPushRegistration('session-a', 'es');
  assert.equal(state.calls.length, 1);
  state.permission = 'denied';
  await push.refreshPushRegistration('session-a', 'es');
  assert.deepEqual(state.calls.at(-1), RELEASE);
  await push.refreshPushRegistration('session-a', 'es');
  assert.equal(state.calls.length, 2);
  state.permission = 'granted';
  await push.refreshPushRegistration('session-a', 'es');
  assert.deepEqual(state.calls.at(-1), REGISTER('session-a'));
});

test('opt-ins report the version of the text the person saw', async () => {
  const { push, state } = setup();
  await push.setSavedReminders('s', true);
  await push.setPromotionNotices('s', false);
  await push.setAccountNotices('s', false);
  assert.deepEqual(state.calls.map((call) => call[2]), [{ saved: true, textVersion: 'push-2026-11' }, { promotions: false, textVersion: 'push-2026-11' }, { account: false }]);
});
