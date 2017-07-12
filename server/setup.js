var express = require('express');
var Ledger = require('ledger-cli').Ledger;

var app = express();

// Load Ledger Configuration
var ledger = require('./ledger-config')();

// Load Express Configuration
require('./express-config')(app, express);

// Make our ledger accessible to our router
app.use(function (req, res, next) {
    req.ledger = ledger;
    next();
});

// Load routes
require("./routes/account-routes")(app);
require("./routes/envelope-routes")(app);
require("./routes/auto-trans-routes")(app);
//console.log(__dirname);

module.exports = app;