const STORAGE_KEY_FORMAT = '%s-%05d';
const STORAGE_KEY_SIZE_LIMIT = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;

function encodeKey (key) {
  return key.replace(/('|"|\\)/, "\$1");
}

function setStorageKey (store) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(store, _ => {
      const error = chrome.runtime.lastError;
      if (error) reject(error);
      else resolve();
    });
  });
}

function getStorageKey (keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
      const error = chrome.runtime.lastError;
      if (error) reject(error);
      else if (Array.isArray(keys)) resolve(result);
      else resolve(result[keys]);
    });
  });
}

async function setKey (key, value) {
  if (value == null) return;
  
  const state = {
    data: JSON.stringify(value),
    store: {},
    index: 0
  };

  if (state.data.length > STORAGE_KEY_SIZE_LIMIT) {
    while (state.data.length > 0) {
      const storeKey = sprintf(STORAGE_KEY_FORMAT, key, state.index);
      const storeValueSize = STORAGE_KEY_SIZE_LIMIT - storeKey.length - 2;
      state.store[storeKey] = state.data.substring(0, storeValueSize);
      state.data = state.data.substring(storeValueSize);
      state.index++;
    }
  } else {
    state.store = { [key]: state.data };
  }

  return await setStorageKey(state.store);
}

async function getKey (key) {
  const value = await getStorageKey(key);
  if (value !== undefined) return /^{.*}$/.test(value) ? JSON.parse(value) : value;

  const state = {
    value: '',
    cycle: true,
    index: 0
  };

  while (state.cycle) {
    const storeKey = sprintf(STORAGE_KEY_FORMAT, key, state.index);
    const storeValue = await getStorageKey(storeKey);
    if (storeValue === undefined) state.cycle = false;
    else {
      state.value += storeValue;
      state.index++;
    }
  }

  return state.index === 0 ? null : JSON.parse(state.value);
}
