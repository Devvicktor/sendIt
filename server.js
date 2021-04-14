const web_socket = require("websocket").server;
const http = require("http");
const fs = require ('fs');
const port=process.env.PORT || 5000;
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
const server = http.createServer((request, response) => {
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

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
const webSocket = new web_socket({
    httpServer: server,
});
let users = [];
webSocket.on("request", (req) => {
    const connection = req.accept();
    connection.on("message", (message) => {
        const data = JSON.parse(message.utf8Data);
        const user = findUser(data.username);
        switch (data.type) {
            case "store_user":
                if (user != null) {
                    return;
                }
                const newUser = {
                    connection: connection,
                    username: data.username,
                };
                users.push(newUser);
                console.log(newUser.username);
                break;
            case "store_offer":
                if (user == null)
                return
                user.offer = data.offer;
                break;
            case "store_candidate":
                if (user == null) {
                    return;
                }
                if (user.candidates == null)
                user.candidates = [];


                user.candidates.push(data.candidate);
                break;
            case "send_answer":
                if (user == null) {
                    return;
                }
                sendData({
                        type: "answer",
                        answer: data.answer,
                    },
                    user.connection
                );
                break;
            case "send_candidate":
                if (user == null) {
                    return;
                }
                sendData({
                        type: "candidate",
                        candidate: data.candidate,
                    },
                    user.connection
                );
                break;
            case "join_call":
                if (user == null) {
                    return;
                }
                sendData({
                    type: "offer",
                    offer: user.offer,
                },connection);
                user.candidates.forEach((candidate) => {
                    sendData({
                            type: "candidate",
                            candidate: candidate,
                        },
                        connection
                    );
                });
                break;
        }
    });
    connection.on("close", (reason, description) => {
        users.forEach((user) => {
            if (user.connection == connection) {
                users.splice(users.indexOf(user), 1);
                return;
            }
        });
    });
});
 function sendData(data,connection){
   connection.send(JSON.stringify(data))
 }
function findUser(username) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == username) return users[i];
    }
}