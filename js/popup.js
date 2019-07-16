const config = {
  IMAGE_MAX_HEIGHT: 100
};

const data = {
  listeners: [],
  cells: []
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
  let processed = 0;

  imageUrls.forEach(url => {
    if (url == null || url === '') return;

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
      img.width = config.IMAGE_MAX_HEIGHT / img.naturalHeight * img.naturalWidth;
      img.height = config.IMAGE_MAX_HEIGHT;
      img.onload = null;

      if ((img.naturalWidth < config.IMAGE_MAX_HEIGHT ||
          img.naturalHeight < config.IMAGE_MAX_HEIGHT) &&
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
  cell.selected = !cell.selected;
  cell.className = cell.selected ? 'cell selected' : 'cell';
};

const handleButtonDownloadZip = function () {
  const zip = new JSZip();

  data.cells.filter(cell => cell.selected).forEach((cell, index) => {
    const regex = /^data:image\/(svg\+xml|jpeg|gif|png);base64,(.*)$/i;
    const matches = cell.url.match(regex);
    if (matches.length === 3) {
      const type = matches[1];
      const filename = generateFilename(index, type);
      console.log('filename', filename);
      const content = b64toBlob(matches[2], `image/${type}`);
      console.log('content', content);
      zip.file(filename, content);
    }
  });

  zip.generateAsync({ type: 'blob' }).then(function (blob) {
    const filename = 'images.zip';
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename });
    // saveAs(blob, filename);
  });
};

window.addEventListener('DOMContentLoaded', async () => {
  // Bind listeners to navigation
  addListener('download-zip', 'click', handleButtonDownloadZip);
  addListener('select-all', 'click', handleButtonSelectAll);
  addListener('deselect-all', 'click', handleButtonDeselectAll);

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