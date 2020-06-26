export class Auditor {
    #tcpServer;
    #socket;

    constructor() {
        let net = require('net');
        let dgram = require('dgram');

        this.#tcpServer = net.createServer();
        this.#socket = dgram.createSocket('udp4');

        this.#socket.bind(0, '', function () {
            this.#socket.setBroadcast(true);
        });
    }

    listen(port) {
        this.#tcpServer.listen(port);
    }
}
