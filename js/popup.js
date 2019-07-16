const config = {
  IMAGE_HEIGHT_CUTOFF: 100,
  IMAGE_MAX_HEIGHT: 100
};

const state = {
  imageSize: config.IMAGE_HEIGHT_CUTOFF,
  urls: {}
};

const data = {
  listeners: [],
  cells: [],
  imageUrls: {}
};

const addListener = (id, type, handler, binding) => {
  const element = document.getElementById(id);
  element.addEventListener(type, binding ? handler.bind(binding) : handler);
  data.listeners.push({ id, type, handler });
};

const removeAllListeners = () => {
  while (data.listeners.length !== 0) {
    const { id, type, handler } = data.listeners.pop();
    document.getElementById(id).removeEventListener(type, handler);
  }
};

const showEmpty = () => {
  const nav = document.getElementById('nav');
  const empty = document.getElementById('empty');
  nav.style.display = 'none';
  empty.style.display = 'flex';
};

const handleContentImageUrls = urls => {
  const imageUrls = urls || [];
  const gallery = document.getElementById('gallery');
  const height = document.getElementById('image-size').value;
  let processed = 0;

  imageUrls.forEach(url => {
    if (url == null || url === '' || state.urls[url]) return;

    const cell = document.createElement('div');
    const icon = document.createElement('div');
    const img = document.createElement('img');
    const id = generateId();
    const info = { id, url, selected: true };

    icon.className = 'icon-checkmark';

    cell.id = id;
    cell.className = 'cell selected';
    cell.appendChild(img);
    cell.appendChild(icon);

    img.onload = () => {
      img.width = height/ img.naturalHeight * img.naturalWidth;
      img.height = height;
      img.onload = null;

      if ((img.naturalWidth < config.IMAGE_HEIGHT_CUTOFF ||
          img.naturalHeight < config.IMAGE_HEIGHT_CUTOFF) &&
          img.parentNode) {
        cell.parentNode.removeChild(cell);
      } else {
        data.cells.push(info);
      }

      processed++;

      if (imageUrls.length === processed && data.cells.length === 0) showEmpty();
    };

    gallery.appendChild(cell);
    img.src = url;

    addListener(id, 'click', handleImageToggle, info);
  });
};

const handleButtonSelectAll = function () {
  data.cells.forEach(info => {
    const cell = document.getElementById(info.id);
    cell.className = 'cell selected';
    cell.selected = true;
  });
};

const handleButtonDeselectAll = function () {
  data.cells.forEach(info => {
    const cell = document.getElementById(info.id);
    cell.className = 'cell';
    cell.selected = false;
  });
};

const handleImageToggle = function () {
  const info = this;
  const cell = document.getElementById(info.id);
  info.selected = !info.selected;
  cell.className = info.selected ? 'cell selected' : 'cell';
};

const handleButtonDownloadZip = function () {
  downloadAsZip(data.cells).then(result => {
    if (!result) return;
    for (const cell of data.cells) {
      state.urls[cell.url] = true;
    }
    setKey('state', state);
  });
};

const handleSelectChangeImageSize = function (e) {
  state.imageSize = parseInt(e.target.value);
  setKey('state', state);

  data.cells.forEach(info => {
    const cell = document.getElementById(info.id);
    const img = cell.querySelector('img');
    img.width = state.imageSize / img.naturalHeight * img.naturalWidth;
    img.height = state.imageSize;
  });
};

window.addEventListener('DOMContentLoaded', async () => {
  // Load previous state
  state = await getKey('state');
  state.imageSize = state.imageSize || config.IMAGE_HEIGHT_CUTOFF;
  state.urls = state.urls || {};

  // Set default UI settings
  document.getElementById('image-size').value = state.imageSize;

  // Bind listeners to navigation
  addListener('download-zip', 'click', handleButtonDownloadZip);
  addListener('select-all', 'click', handleButtonSelectAll);
  addListener('deselect-all', 'click', handleButtonDeselectAll);
  addListener('image-size', 'change', handleSelectChangeImageSize);

  // Fetch the list of image urls on the page
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    const message = { from: 'popup', subject: 'getImageURLs' };
    chrome.tabs.sendMessage(tabs[0].id, message, handleContentImageUrls);
  });
});

window.addEventListener('unload', () => {
  removeAllListeners();
});