const http = require ('http');
const fs = require ('fs');

const port = process.env.PORT || 3000;

fs.readFile ('./index.html', function (err, data) {
  if (err) {
    throw err;
  }
  htmlFile = data;
});

fs.readFile ('./main.css', function (err, data) {
  if (err) {
    throw err;
  }
  cssFile = data;
});
fs.readFile ('./main.js', function (err, data) {
  if (err) {
    throw err;
  }
  mainJS = data;
});
fs.readFile ('./receiver.js', function (err, data) {
  if (err) {
    throw err;
  }
  receiverJS = data;
});
fs.readFile ('./sender.js', function (err, data) {
  if (err) {
    throw err;
  }
  senderJS = data;
});
fs.readFile ('./server.js', function (err, data) {
  if (err) {
    throw err;
  }
  serverJS = data;
});
const server = http.createServer (function (request, response) {
  switch (request.url) {
    case '/main.css':
      response.writeHead (200, {'Content-Type': 'text/css'});
      response.write (cssFile);
      break;
    case '/main.js':
      response.writeHead (200, {'Content-Type': 'text/javascript'});
      response.write (mainJS);
      break;
    case '/receiver.js':
      response.writeHead (200, {'Content-Type': 'text/javascript'});
      response.write (receiverJS);
      break;
    case '/sender.js':
      response.writeHead (200, {'Content-Type': 'text/javascript'});
      response.write (senderJS);
      break;
    case '/server.js':
      response.writeHead (200, {'Content-Type': 'text/javascript'});
      response.write (serverJS);
      break;

    default:
      response.writeHead (200, {'Content-Type': 'text/html'});
      response.write (htmlFile);
  }
  response.end ();
});

server.listen (port, () => {
  console.log (`Listening at port ${port}`);
});
