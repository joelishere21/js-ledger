var config = require('../config');
var Ledger = require('ledger-cli').Ledger;

module.exports = function () {
    // Need to create local config.js file with javascript object containing "workingFolder" string configuration variable.
    // This will be where it looks for 'ledger.dat'    
    process.chdir(config.workingFolder);
    console.log(process.cwd());

    var ledger = new Ledger({ file: 'ledger.dat' });

    return ledger;
};