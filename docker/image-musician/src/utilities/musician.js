import * as dgram from 'dgram';
import { v4 as uuid } from 'uuid';
import { instruments } from './instruments.js';

export class Musician {
    #socket;
    #type;
    #uuid;
    #networkPort = 4411;
    #networkAddress = '255.255.255.255';

    constructor(type) {
        this.#type = type;
        this.#socket = dgram.createSocket('udp4');
        this.#uuid = uuid();

        let socket = this.#socket;
        this.#socket.bind(0, '', function () {
            socket.setBroadcast(true);
        });
    }

    play() {
        let uuid = this.#uuid;
        
        // Build the payload
        let message = Buffer.from(JSON.stringify({
            musician: uuid,
            sound: instruments.get(this.#type)
        }));

        this.#socket.send(
            message,
            0,
            message.length,
            this.#networkPort,
            this.#networkAddress,
            () => {
                console.log('Musician ' + uuid + ' makes this sweet sound: ' + message);
            }
        );
    }
}
