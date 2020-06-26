import { Auditor } from './utilities/auditor.js';

const PORT = 2205;
const FORGET_TIMEOUT = 5000;

let auditor = new Auditor(FORGET_TIMEOUT);
auditor.listen(PORT);
