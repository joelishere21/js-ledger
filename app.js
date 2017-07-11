var app = require('./server/setup');

//console.log(__dirname);

app.get('/api/accounts', function (req, res) {
	var results = [];
	req.ledger.accounts().on('data', function(account) {
		results.push(account);
  })
  .once('end', function () {
	  res.json(results);
  });
});
app.get('/api/assets', function (req, res) {
	var results = [];
	ledger.accounts().on('data', function(account) {
		if (account.indexOf('Assets') == 0)
			results.push(account);
  })
  .once('end', function () {
	  res.json(results);
  });
});
app.get('/api/expense', function (req, res) {
	var results = [];
	ledger.accounts().on('data', function(account) {
		if (account.indexOf('Expense') == 0)
			results.push(account);
  })
  .once('end', function () {
	  res.json(results);
  });
});
app.get('/api/liabilities', function (req, res) {
	var results = [];
	ledger.accounts().on('data', function(account) {
		if (account.indexOf('Liabilities') == 0)
			results.push(account);
  })
  .once('end', function () {
	  res.json(results);
  });
});
app.get('/api/assetsandliabilities', function (req, res) {
	var results = [];
	ledger.accounts().on('data', function(account) {
		if (account.indexOf('Assets') == 0 || account.indexOf('Liabilities') == 0)
			results.push(account);
  })
  .once('end', function () {
	  res.json(results);
  });
});
app.get('/api/balance', function (req, res) {
	var results = [];
	ledger.balance().on('data', function(entry) {
    	// JSON object for each entry 
		results.push(entry);
	})
	.once('end', function () {
		res.json(results);
	});
});
app.get('/api/account/balance', function (req, res) {
	var results = [];
	ledger.balance().on('data', function(entry) {
    	// JSON object for each entry 
		if (entry.account.fullname == 'Assets') entry.account.fullname = 'Total Assets';
		if (entry.account.fullname == 'Liabilities') entry.account.fullname = 'Total Liabilities';
		if (entry.account.fullname.indexOf('Assets') == 0 || entry.account.fullname.indexOf('Liabilities') == 0 || entry.account.fullname.indexOf('Total') == 0)
			results.push(entry);
	})
	.once('end', function () {
		res.json(results);
	});
});
app.get('/api/account/currentbalance', function (req, res) {
	var results = [];
	ledger.currentbalance().on('data', function(entry) {
    	// JSON object for each entry 
		if (entry.account.fullname == 'Assets') entry.account.fullname = 'Total Assets';
		if (entry.account.fullname == 'Liabilities') entry.account.fullname = 'Total Liabilities';
		if (entry.account.fullname.indexOf('Assets') == 0 || entry.account.fullname.indexOf('Liabilities') == 0 || entry.account.fullname.indexOf('Total') == 0)
			results.push(entry);
	})
	.once('end', function () {
		res.json(results);
	});
});
app.get('/api/fund/balance', function (req, res) {
	var results = [];
	ledger.balance().on('data', function(entry) {
    	// JSON object for each entry 
		if (entry.account.fullname.indexOf('Assets:Funds') == 0)
			results.push(entry);
	})
	.once('end', function () {
		res.json(results);
	});
});
app.get('/api/category/balance', function (req, res) {
	var results = [];
	ledger.balance().on('data', function(entry) {
    	// JSON object for each entry 
		if (entry.account.fullname.indexOf('Expense') == 0)
			results.push(entry);
	})
	.once('end', function () {
		res.json(results);
	});
});
app.get('/api/register', function (req, res) {
	var results = [];
	ledger.register().on('data', function(entry) {
    	// JSON object for each entry 
		results.push(entry);
	})
	.once('end', function () {
		res.json(results);
	});
});
app.get('/api/view', function (req, res) {
	var fs = require('fs');
	var inStream = fs.createReadStream('ledger.dat', 'utf8');
	inStream.pipe(res);
	//ledger.print().pipe(res);
});
app.post('/api/save', function (req, res) {
	
	var Stream = require('stream');
	var fs = require('fs');

	var chunks = [];

	var stream = req;

	stream.on("data", function (chunk) {
		chunks.push(chunk);
	});

	stream.on("end", function () {
		
		var data = chunks.join("");
		var s = new Stream();

		s.pipe = function(dest) {
			dest.write(data);
			return dest;
		};

		var out = fs.createWriteStream('ledger.dat', 'utf8');
		s.pipe(out);
		res.status(200).send('success');
	});
});
app.post('/api/transaction', function (req, res) {

	var Stream = require('stream');
	var fs = require('fs');

	var chunks = [];

	//var stream = ledger.print();
	var stream = fs.createReadStream('ledger.dat', 'utf8');

	stream.on("data", function (chunk) {
		chunks.push(chunk);
	});

	stream.on("end", function () {
		
		var data = chunks.join("");
		var newData = "";
		var transaction = req.body;

		newData = transaction.Date +
				(transaction.Cleared ? ' * ' : ' ') +
				transaction.Payee + '\n';
		
		for (var i = 0; i < transaction.Expenses.length; i++) {
			var spacing = 4 + transaction.Expenses[i].Category.length + 1 + transaction.Expenses[i].Amount.length;
			newData += '    ' + transaction.Expenses[i].Category;
			for (var ii = 0; ii < 52 - spacing; ii++) {
				newData += ' ';
			}
			newData += '$' + transaction.Expenses[i].Amount + '\n';
		}

		newData += '    ' + transaction.Account;

		var s = new Stream();

		s.pipe = function(dest) {
			dest.write(data + '\n\n' + newData);
			return dest;
		};

		var out = fs.createWriteStream('ledger.dat', 'utf8');
		s.pipe(out);
		
		res.status(200).send('success');
	});

});

// Always send index.html because this is a SPA. This helps with Angular Routing.
app.use(function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Express app listen on 8080.
app.listen(8080, function () {
	console.log('JS Ledger app listening on port 8080.');
});