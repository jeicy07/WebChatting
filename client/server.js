var express = require('express');
var app = express();

app.use('/dist', express.static(__dirname + '/dist'));
app.use('/images', express.static(__dirname + '/app/images'));

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.listen('4000', function (){
  console.log('Now is listening the port 4000');
});
