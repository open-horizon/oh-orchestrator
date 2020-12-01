const formatToJson = (http) => {
  const httpLines = http.split('\r\n');
  const method = httpLines[0].split(' ')[0];
  const endpoint = httpLines[0].split(' ')[1];
  const host = httpLines[1].split(' ')[1];

  const headers = {};
  httpLines.forEach((line, index) => {
    if (index > 0 && index < httpLines.length - 1 && line !== '') {
      // eslint-disable-next-line prefer-destructuring
      headers[line.split(': ')[0]] = line.split(': ')[1];
    }
  });

  const body = httpLines[httpLines.length - 1];

  const formattedRequest = {
    method,
    host,
    endpoint,
    headers,
    body,
  };

  return formattedRequest;
};

const capitalize = (text) => {
  const pieces = text.split('-');
  const capitalized = pieces.map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1));
  return capitalized.join('-');
};

const formatToHttp = (status, headers = {}) => {
  let isChunked = false;
  if (headers['transfer-encoding']) isChunked = true;

  const httpObj = [`HTTP/1.1 ${status.code} ${status.message}`];

  Object.entries(headers).forEach(([key, value]) => {
    const capitalizedKey = capitalize(key);
    httpObj.push(`${capitalizedKey}: ${value}`);
  });

  const httpHeaders = `${httpObj.join('\r\n')}\r\n\r\n`;

  return {
    httpHeaders,
    isChunked,
  };
};

module.exports = {
  formatToJson,
  formatToHttp,
};
