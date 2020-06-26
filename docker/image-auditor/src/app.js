import { Auditor } from './utilities/auditor.js';

const PORT = 2205;
let auditor = new Auditor();
auditor.listen(PORT);
