function generateHex (size) {
  return Array.apply(null, Array(size || 8))
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

function generateNumber (size) {
  const number = Array.apply(null, Array(size || 10))
    .map((n, i) => Math.floor(i === 0 ? Math.random() * 9 + 1 : Math.random() * 10).toString(10))
    .join('');
  return parseInt(number);
}

function generateId (options) {
  options = options || {};

  const type = options.type || 'hex';
  const size = options.size || 8;

  if (type === 'number') return generateNumber(size);

  return generateHex(size);
}

function generateFilename (index, suffix) {
  let ext = suffix;
  if (suffix === 'svg+xml') ext = 'svg';
  else if (suffix === 'jpeg') ext = 'jpg';
  return sprintf('image-%03d.%s', index, ext);
}

function b64toBlob (b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}