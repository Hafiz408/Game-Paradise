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

function checkResult(){
  var row=[-1,-1,-1];
  var col=[-1,-1,-1];
  var diag=[-1,-1];

    row[0]=position['1']+position['2']+position['3'];
    row[1]=position['4']+position['5']+position['6'];
    row[2]=position['7']+position['8']+position['9'];

    col[0]=position['1']+position['4']+position['7'];
    col[1]=position['2']+position['5']+position['6'];
    col[2]=position['3']+position['6']+position['9'];

    diag[0]=position['1']+position['5']+position['9'];
    diag[1]=position['3']+position['5']+position['7'];

    var val=Object.values(position);
    console.log(val)
    var r=val.includes(-10);

    if(row[0]==0 || row[1]==0 || row[2]==0 || col[0]==0 || col[1]==0 || col[2]==0 || diag[0]==0 || diag[1]==0){
      return "2"
    }
    if(row[0]==3 || row[1]==3 || row[2]==3 || col[0]==3 || col[1]==3 || col[2]==3 || diag[0]==3 || diag[1]==3){
      return "1"
    }if(!r){
      return "draw"
    }else{
      return false;
    }
}

var players;
var games=Array(3);
for (let i = 0; i < 3; i++) {
  games[i] = {players: 0 , pid: [0 , 0]};
}

var room;

io.on('connection', function(socket) {
  var playerId =  Math.floor((Math.random() * 100) + 1);
  console.log(playerId + ' connected');

  socket.on('joined',function(roomId){
    room=roomId;
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
        socket.emit('full', room)
        return;
    }

    console.log(games[roomId]);
    players = games[roomId].players

    socket.on('start', function(){
      if(players==2)
      {
        socket.broadcast.emit('syn');
        socket.emit('game',roomId);
        socket.broadcast.emit('game',roomId);
      }
      else{
        socket.emit('wait',1);
      }
    });

    position={'1':-10,'2':-10,'3':-10,'4':-10,'5':-10,'6':-10,'7':-10,'8':-10,'9':-10}

    socket.on('move',function(data){
      console.log(data);
      if(data.playerType=="1"){
        position[data.id]=1
      }else{
        position[data.id]=0
      }
      var winner=checkResult();
      if(winner){
        socket.broadcast.emit('change',data)
        socket.emit('result',{room:2,winner:winner});
        socket.broadcast.emit('result',{room:2,winner:winner});
      }else{
        socket.broadcast.emit('change',data)
      }
      // console.log(position);
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

    socket.on('newGame',function(data){
      if(data==2){
        for(var key in position){
          position[key]=-10;
        }
      }else{
        choice1="";
        choice2="";
      }
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
