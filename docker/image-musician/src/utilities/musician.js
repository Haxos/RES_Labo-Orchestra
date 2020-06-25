import instruments from './instruments';

export class Musician
{
    #socket;
    #type;

    constructor(type)
    {
        let dgram = require('dgram');
        this.#type = type;
        this.#socket = dgram.createSocket('udp4');

        this.#socket.bind(0, '', function() {
            this.#socket.setBroadcast(true);
        });
    }

    play()
    {
        let message = new Buffer(instruments.get(this.#type));

        this.#socket.send(message, 0, message.length, 4411, '255.255.255.255');
    }
}
