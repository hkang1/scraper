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

async function downloadAsZip (info) {
  const zip = new JSZip();
  let addCount = 0;

  for (const [ index, data ] of info.entries()) {
    const url = data.url;
    const folder = data.selected ? 'positive' : 'negative';
    const regexBase64 = /^data:image\/(gif|jpe?g|png|svg\+xml);base64,(.*)$/i;
    const regexHttp = /^https?/i;
    const matchesBase64 = url.match(regexBase64);
    const matchesHttp = url.match(regexHttp);

    if (matchesBase64 && matchesBase64.length === 3) {
      const type = matchesBase64[1];
      const data = matchesBase64[2];
      const filename = generateFilename(index, type);
      const content = b64toBlob(data, `image/${type}`);
      zip.folder(folder).file(filename, content);
      addCount++;
    } else if (matchesHttp && matchesHttp.length === 1) {
      const response = await fetch(url);
      const content = await response.blob();
      const parts = content.type.split('/');

      if (parts.length !== 2) continue;

      const filename = generateFilename(index, parts[1]);
      zip.folder(folder).file(filename, content);
      addCount++;
    }
  }

  if (addCount === 0) return true;

  zip.generateAsync({ type: 'blob' }).then(function (blob) {
    const filename = 'images.zip';
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename });
  });

  return true;
}