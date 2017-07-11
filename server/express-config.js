var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');

module.exports = function(app, express) {
    app.use(logger('dev'));
    // Serve static assets from the app folder. This enables things like javascript
    // and stylesheets to be loaded as expected.
    app.use(express.static(path.join(__dirname, 'public')));

    // Set the view directory, this enables us to use the .render method inside routes
    //app.set('views', __dirname + '/../app/views');

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    app.use(bodyParser.json());
};