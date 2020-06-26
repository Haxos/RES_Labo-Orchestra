import * as dgram from 'dgram';
import * as net from 'net';

export class Auditor {
    #tcpServer;
    #socket;

    constructor() {
        this.#tcpServer = net.createServer();
        this.#socket = dgram.createSocket('udp4');

        let socket = this.#socket;
        this.#socket.bind(0, '', function () {
            socket.setBroadcast(true);
        });
    }

    listen(port) {
        this.#tcpServer.listen(port);
    }
}
