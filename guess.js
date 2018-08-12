var app = require('./config/config')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const server = http.listen(app.get('portNumber'), function () {
  var now = new Date();
  console.log('Guessing Game is up and listening!');
  console.log('== ' + now);

});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});
