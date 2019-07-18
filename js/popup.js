const config = {
  IMAGE_HEIGHT_CUTOFF: 100,
  IMAGE_MAX_HEIGHT: 100
};

const state = {
  cells: [],
  imageSize: config.IMAGE_HEIGHT_CUTOFF
};

const listeners = [];

const addListener = (id, type, handler, binding) => {
  const element = document.getElementById(id);
  element.addEventListener(type, binding ? handler.bind(binding) : handler);
  listeners.push({ id, type, handler });
};

const removeAllListeners = () => {
  while (listeners.length !== 0) {
    const { id, type, handler } = listeners.pop();
    document.getElementById(id).removeEventListener(type, handler);
  }
};

const showEmpty = () => {
  const nav = document.getElementById('nav');
  const empty = document.getElementById('empty');
  nav.style.display = 'none';
  empty.style.display = 'flex';
};

const toggleCell = async (info, selected) => {
  const cell = document.getElementById(info.id);
  cell.className = selected ? 'cell selected' : 'cell';
  info.selected = selected;
  if (selected) await removeStorageKey(info.id);
  else await setStorageKey({ [info.id]: 'N' });
};

const handleContentResponse = async function (response = {}) {
  const imageUrls = response.urls || [];
  const prefix = document.getElementById('prefix');
  const gallery = document.getElementById('gallery');
  const height = document.getElementById('image-size').value;
  let processed = 0;

  if (response.prefix) prefix.value = `${response.prefix}-`;

  for (const url of imageUrls) {
    if (url == null || url === '') continue;

    const cell = document.createElement('div');
    const icon = document.createElement('div');
    const img = document.createElement('img');
    const id = md5(url);
    const selected = await getStorageKey(id) !== 'N';
    const info = { id, url, selected };
 
    icon.className = 'icon-checkmark';

    cell.id = id;
    cell.className = selected ? 'cell selected' : 'cell';
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
        state.cells.push(info);
      }

      processed++;

      if (imageUrls.length === processed && state.cells.length === 0) showEmpty();
    };

    gallery.appendChild(cell);
    img.src = url;

    addListener(id, 'click', handleImageToggle, info);
  }
};

const handleButtonSelectAll = function () {
  state.cells.forEach(info => toggleCell(info, true));
};

const handleButtonDeselectAll = function () {
  state.cells.forEach(info => toggleCell(info, false));
};

const handleImageToggle = function () {
  const info = this;
  toggleCell(info, !info.selected);
};

const handleButtonDownloadZip = function () {
  downloadAsZip(state.cells).then(async result => {
    await clearStorageKey();
    await setStorageKey({ 'imageSize': state.imageSize });
  });
};

const handleSelectChangeImageSize = async function (e) {
  state.imageSize = parseInt(e.target.value);

  state.cells.forEach(info => {
    const cell = document.getElementById(info.id);
    const img = cell.querySelector('img');
    img.width = state.imageSize / img.naturalHeight * img.naturalWidth;
    img.height = state.imageSize;
  });

  await setStorageKey({ imageSize: state.imageSize });
};

window.addEventListener('DOMContentLoaded', async () => {
  // Load previous state
  state.imageSize = await getStorageKey('imageSize') || config.IMAGE_HEIGHT_CUTOFF;

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
    chrome.tabs.sendMessage(tabs[0].id, message, handleContentResponse);
  });
});

window.addEventListener('unload', () => {
  removeAllListeners();
});