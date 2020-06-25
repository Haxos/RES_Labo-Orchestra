const { Musician } = require("./utilities/musician");

import Musician from './utilities/musician';
import instruments from './utilities/instruments';

if (process.argv.length < 3) {
    console.log("Please provide a musician type as argument");
    process.exit(1);
}

if (!instruments.has(process.argv[2])) {
    let message = "The musician type " + process.argv[2] + " does not exist.\n";
    message += "Valid types are: " + instruments.keys().join(', ');
    console.log(message);
    process.exit(1);
}

let musician = new Musician(process.argv[2]);

setInterval(function() {
    musician.play();
}, 1000);
