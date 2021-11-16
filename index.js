var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
  response.sendFile(__dirname+'/index.html');
});

app.get('/rock-paper-scissors', function(request, response) {
    response.sendFile(__dirname+'/rock-paper-scissors.html');
});

app.get('/tic-tac-toe', function(request, response) {
    response.sendFile(__dirname+'/tic-tac-toe.html');
});

app.get('/hangman', function(request, response) {
    response.sendFile(__dirname+'/hangman.html');
});

var choice1 = "",choice2 = "";

function getWinner(p, c) {
  if (p === c) {
      return "draw";
  } else if (p === "rock") {
      if (c === "paper") {
          return "2";
      } else {
          return "1";
      }
  } else if (p === "paper") {
      if (c === "scissor") {
          return "2";
      } else {
          return "1";
      }
  } else if (p === "scissor") {
      if (c === "rock") {
          return "2";
      } else {
          return "1";
      }
  }
}

function result(roomID,socket) {
  var winner = getWinner(choice1, choice2);
  socket.emit('result', {
      winner: winner,
      choice1: choice1,
      choice2: choice2
  });
  
}


var players;
var games=Array(3);
for (let i = 0; i < 3; i++) {
  games[i] = {players: 0 , pid: [0 , 0]};
}

io.on('connection', function(socket) {
  var playerId =  Math.floor((Math.random() * 100) + 1);
  console.log(playerId + ' connected');

  socket.on('joined',function(roomId){
    if (games[roomId].players < 2) {
      if(playerId == games[roomId].pid[0] || playerId == games[roomId].pid[1]){
        console.log("Same player twice in room");
      }else{
        var count = ++games[roomId].players;
        games[roomId].pid[games[roomId].players - 1] = playerId;
        if(count==1){
          socket.emit('player1');
        }else{
          socket.emit('player2');
        }
      }      
    }
    else{
        socket.emit('full', roomId)
        return;
    }

    console.log(games[roomId]);
    players = games[roomId].players

    socket.on('start', function(choice){
      if(players==2)
      {
        socket.emit('game');
      }
      else{
        socket.emit('wait',1);
      }
    });

    socket.on('choice1',function(data){
      choice1=data;
      console.log(choice1,choice2);
      if (choice2 != ""){
        result(roomId,socket);
      }else{
        socket.emit('wait',2);
      }
    });
      
    socket.on('choice2', function(data) {
      choice2 = data;
      console.log(choice1, choice2);
      if (choice1 != "") {
          result(roomId,socket);
      }else{
        socket.emit('wait',2);
      }
    });

    socket.on('newGame',function(){
      choice1="";
      choice2="";
    });

  });

  socket.on('disconnect', function () {
    for (let i = 0; i < 3; i++) {
        if (games[i].pid[0] == playerId || games[i].pid[1] == playerId)
            games[i].players--;
    }
    console.log(playerId + ' disconnected');
  }); 

});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});
