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
		var tmp = JSON.stringify(res);

		tmp = replaceAll('%', '', tmp);

		fs.writeFile(__dirname + '/public/tmp/ps.json', tmp);
	});
}, 2000);


function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post("/", function(req, res) {
	addon.sendSignal(parseInt(req.body.pid), parseInt(req.body.signal));
});

app.listen(process.env.PORT || 8888);