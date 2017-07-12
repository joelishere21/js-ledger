module.exports = function (app) {

    app.get('/api/accounts', function (req, res) {
        var results = [];
        req.ledger.accounts().on('data', function(account) {
            results.push(account);
        })
        .once('end', function () {
            res.json(results);
        });
    });

    

};