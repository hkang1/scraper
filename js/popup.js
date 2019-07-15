const config = {
  IMAGE_MIN_SIZE: 150,
  IMAGE_MAX_HEIGHT: 150
};

const data = {
  listeners: [],
  images: []
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

const handleContentImageUrls = urls => {
  const gallery = document.getElementById('gallery');
  (urls || []).forEach(url => {
    if (url == null || url === '') return;

    const img = document.createElement('img');

    img.onload = () => {
      const id = generateId();
      const image = { id, selected: true };

      img.id = id;
      img.width = config.IMAGE_MAX_HEIGHT / img.naturalHeight * img.naturalWidth;
      img.height = config.IMAGE_MAX_HEIGHT;
      img.className = 'selected';
      img.onload = null;

      addListener(img.id, 'click', handleImageToggle, image);

      if ((img.naturalWidth < config.IMAGE_MIN_SIZE ||
          img.naturalHeight < config.IMAGE_MIN_SIZE) &&
          img.parentNode) {
        img.parentNode.removeChild(img);
      } else {
        data.images.push(image);
      }
    };

    gallery.appendChild(img);
    img.src = url;
  });
};

const handleButtonSelectAll = function () {
  data.images.forEach(image => {
    const img = document.getElementById(image.id);
    img.className = 'selected';
    image.selected = true;
  });
};

const handleButtonDeselectAll = function () {
  data.images.forEach(image => {
    const img = document.getElementById(image.id);
    img.className = '';
    image.selected = false;
  });
};

const handleImageToggle = function () {
  const image = this;
  const img = document.getElementById(image.id);
  image.selected = !image.selected;
  img.className = image.selected ? 'selected' : '';
};

window.addEventListener('DOMContentLoaded', () => {
  // Bind listeners to navigation
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