const { Auditor } = require("./utilities/auditor");

import Auditor from './utilities/auditor';

const PORT = 2205;
let auditor = new Auditor();
auditor.listen(PORT);
