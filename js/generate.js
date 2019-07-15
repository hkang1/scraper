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
