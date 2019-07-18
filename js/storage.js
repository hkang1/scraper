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

function removeStorageKey (keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(keys, (result) => {
      const error = chrome.runtime.lastError;
      if (error) reject(error);
      else resolve();
    });
  });
}

function clearStorageKey () {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.clear(_ => {
      const error = chrome.runtime.lastError;
      if (error) reject(error);
      else resolve();
    });
  });
}
