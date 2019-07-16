async function setKey (key, value) {
  return new Promise((resolve, reject) => {
    const store = {};
    let data = JSON.stringify(value);
    let i = 0;

    while (data.length > 0) {
      const keyStr = sprintf('%s-%05', i++);
      const length = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - keyStr.length - 2;
      store[keyStr] = data.substring(0, length);;
      data = data.substring(length);
    }
    let resolved = false;
    chrome.storage.sync.set(store, () => {
      resolve();
      resolved = true;
    });
    setTimeout(() => {
      if (!resolved) reject();
    }, 500);
  });
}

async function getKey (key) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key]);
      resolved = true;
    });
    setTimeout(() => {
      if (!resolved) reject();
    }, 500);
  });
}