var express = require('express');
var Psaux = require('ps-aux');
var fs = require('fs');
var addon = require('./public/addon/build/Release/addon');
var bodyParser = require('body-parser');

var app = express();
var psaux = Psaux();

setInterval(function() {
	psaux.parsed(function(err, res){
		if(err) {
			return console.error(err);
		}

		res = JSON.stringify(res);
		res = replaceAll('%', '', res);

		fs.writeFile(__dirname + '/public/tmp/psaux.json', res, function(err) {
			if(err) console.log(err);
		});
	});
}, 2000);


function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get("/data", function(req, res) {
	fs.readFile('./public/tmp/psaux.json', function(err, data){
		if(err) console.log(err);

		res.json(JSON.parse(data));
	});
});

app.post("/", function(req, res) {
	addon.sendSignal(parseInt(req.body.pid), parseInt(req.body.signal));
});

app.listen(process.env.PORT || 8888);