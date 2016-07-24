var WebSocketServer = require('websocket').server;
var http = require('http');
var _ = require('lodash');

var server = http.createServer(function (request, response) {});

server.listen(8081, function () {});

var wsServer = new WebSocketServer({
    httpServer: server
});

var clients = {};
var queues = {};

wsServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);

    console.log('JOIN ', connection.remoteAddresses[0]);
    clients[connection.remoteAddress] = connection;
    queues[connection.remoteAddress] = [];

    dispatchPendingMessages(connection);

    connection.on('message', function (message) {
        forward(connection, message);
    });

    connection.on('close', function () {
        console.log('LEAVE ', connection.remoteAddress);
        if (clients[connection.remoteAddress] == connection)
            delete clients[connection.remoteAddress];
    });
});

function forward(from, msg) {
    var sent = false;
    _.each(clients, function(client) {
        if (client.remoteAddress != from.remoteAddress) {
            if (msg.type == 'utf8') {
                console.log('[FORWARD from ' + from.remoteAddress + ' to ' + client.remoteAddress + ']:', msg.utf8Data);
            }
            send(client, msg);
            sent = true;
        }
    });
    if (!sent) {
        if (msg.type == 'utf8') {
            console.log('[SAVE from ' + from.remoteAddress + ']:', msg.utf8Data);
        }
        queues[from.remoteAddress].push(msg);
    }
}

function send(client, msg) {
    if (msg.type == 'utf8') {
        client.sendUTF(msg.utf8Data);
    } else {
        client.sendBytes(msg.binaryData);
    }
}

function dispatchPendingMessages(to) {
    _.each(clients, function(client) {
        if (client.remoteAddress != to.remoteAddress) {
            _.each(queues[client.remoteAddress], function(msg) {
                if (msg.type == 'utf8') {
                    console.log('[FORWARD(QUEUE) from ' + client.remoteAddress + ' to ' + to.remoteAddress + ']:', msg.utf8Data);
                }
                send(to, msg);
            });
        }
    });
}