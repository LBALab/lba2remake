var WebSocketServer = require('websocket').server;
var http = require('http');
var _ = require('lodash');

var server = http.createServer(function (request, response) {});

server.listen(8081, function () {});

// create the server
var wsServer = new WebSocketServer({
    httpServer: server
});

var clients = {};

function forward(from, msg) {
    _.each(clients, function(client) {
        if (client.remoteAddresses[0] != from.remoteAddresses[0]) {
            client.send(JSON.stringify(msg));
        }
    });
}

// WebSocket server
wsServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);

    console.log('JOIN ', connection.remoteAddresses[0]);
    clients[connection.remoteAddresses[0]] = connection;

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            const msg = JSON.parse(message.utf8Data);
            forward(connection, msg);
        }
    });

    connection.on('close', function () {
        console.log('LEAVE ', connection.remoteAddresses[0]);
        delete clients[connection.remoteAddresses[0]];
    });
});
