import * as dgram from 'dgram';
import * as net from 'net';
import moment from 'moment';
import { sounds } from './sounds.js';

export class Auditor {
    #tcpServer;
    #socket;
    #udpPort = 4411;
    #forgetTimeout;
    #activeMusicians = new Map();

    constructor(forgetTimeout) {
        this.#tcpServer = net.createServer();
        this.#forgetTimeout = forgetTimeout;
        
        this.#socket = dgram.createSocket('udp4');
        this.#socket.bind(this.#udpPort);
        this.#socket.on('message', (msg, rinfo) => {
            this.handleSound(msg, rinfo);
        });
    }

    listen(port) {
        this.#tcpServer.listen(port);
        this.#tcpServer.on('connection', (socket) => {
            this.handleTcpConnection(socket);
        });
    }

    handleSound(msg, rinfo) {
        let now = moment();
        let decodedMessage = {};
        let musician;
        let sound;
        let instrument;

        try {
            decodedMessage = JSON.parse(msg);
            musician = decodedMessage.musician;
            sound = decodedMessage.sound;
            instrument = sounds.get(decodedMessage.sound);
        }
        catch (e) {
            console.log('Headed some noise that doesn\'t look like music: ' + msg);
            return;
        }

        if (!instrument) {
            console.log('Don\'t know any instrument making that sound: ' + sound);
            return;
        }

        if (!musician) {
            console.log('Heared a sound without a musician uuid: ' + sound);
            return;
        }

        console.log('Heared ' + musician + ' playing ' + instrument);

        // Add the musician to the list if is not already here
        if (!this.#activeMusicians.has(musician)) {
            this.#activeMusicians.set(musician, {
                instrument: instrument,
                activeSince: now,
            });
        }

        // Update the last active time
        this.#activeMusicians.get(musician).activeAt = now;

        // Schedule musician deletion if it doesn't play for a moment
        setTimeout(() => {
            this.forgetMusicianIfInactive(musician);
        }, this.#forgetTimeout);
    }

    handleTcpConnection(socket) {
        // Prepare the data
        let activeMusicians = [];
        this.#activeMusicians.forEach((musician, uuid) => {
            activeMusicians.push({
                uuid: uuid,
                instrument: musician.instrument,
                activeSince: musician.activeSince.format(),
            });
        });

        // Send the list of active musicians to the client
        socket.write(JSON.stringify(activeMusicians));

        // Closes the TCP socket because nothing more will be exchanged
        socket.end();
    }

    forgetMusicianIfInactive(uuid) {
        // Should never happen here but just in case
        if (!this.#activeMusicians.has(uuid)) {
            return;
        }

        let musician = this.#activeMusicians.get(uuid);
        let deleteIfBelow = moment().subtract(this.#forgetTimeout, 'ms');

        if (musician.activeAt <= deleteIfBelow) {
            console.log('Didn\'t heared ' + uuid + ' recently, forgetting');
            this.#activeMusicians.delete(uuid);
        }
    }
}
