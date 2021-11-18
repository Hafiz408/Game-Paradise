var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);
var port = process.env.PORT || 5000;

app.set('port', port);
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


var choice = Array(151);
for (let i = 0; i < 151; i++) {
  choice[i] = {choice1: "" , choice2: ""};
}


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

function result(roomId,socket) {
  var winner = getWinner(choice[roomId].choice1, choice[roomId].choice2);
  socket.emit('result', {
      winner: winner,
      choice1: choice[roomId].choice1,
      choice2: choice[roomId].choice2,
      roomId : roomId,
  });
  
}

var position = Array(151);
for (let i = 0; i < 151; i++) {
  position[i]={'1':-10,'2':-10,'3':-10,'4':-10,'5':-10,'6':-10,'7':-10,'8':-10,'9':-10}
}

// var position={'1':-10,'2':-10,'3':-10,'4':-10,'5':-10,'6':-10,'7':-10,'8':-10,'9':-10}

function checkResult(roomId){
  var row=[-1,-1,-1];
  var col=[-1,-1,-1];
  var diag=[-1,-1];

    row[0]=position[roomId]['1']+position[roomId]['2']+position[roomId]['3'];
    row[1]=position[roomId]['4']+position[roomId]['5']+position[roomId]['6'];
    row[2]=position[roomId]['7']+position[roomId]['8']+position[roomId]['9'];

    col[0]=position[roomId]['1']+position[roomId]['4']+position[roomId]['7'];
    col[1]=position[roomId]['2']+position[roomId]['5']+position[roomId]['6'];
    col[2]=position[roomId]['3']+position[roomId]['6']+position[roomId]['9'];

    diag[0]=position[roomId]['1']+position[roomId]['5']+position[roomId]['9'];
    diag[1]=position[roomId]['3']+position[roomId]['5']+position[roomId]['7'];

    var val=Object.values(position[roomId]);
    // console.log(val)
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

var playersC;
var games=Array(151);
for (let i = 0; i < 151; i++) {
  games[i] = {players: 0 , pid: [0 , 0] , game: ""};
}

function getPlayers(roomId){
  console.log(roomId);
  return games[roomId].players;
}


var room;

io.on('connection', function(socket) {
  var playerId =  Math.floor((Math.random() * 1000) + 1);
  console.log(playerId + ' connected');

  socket.on('joined',function(data){
    roomId=data.roomId;
    if(games[roomId].game==""){
      games[roomId].game = data.game;
    }else{
      playersC=getPlayers(roomId);
      if(playersC==0){
        games[roomId].game = data.game;
      }
    }    
    socket.join(roomId);
    if (games[roomId].players < 2) {
      if(playerId == games[roomId].pid[0] || playerId == games[roomId].pid[1]){
        console.log("Same player twice in room");
      }else{
        var count = ++games[roomId].players;
        games[roomId].pid[games[roomId].players - 1] = playerId;
        if(count==1){
          socket.emit('player1',roomId);
        }else{
          socket.emit('player2',roomId);
        }
      }      
    }
    else{
        socket.emit('full', room)
        return;
    }

    console.log("Room "+roomId);
    console.log(games[roomId]);    

    socket.on('start', function(data){
      playersC = games[data.roomId].players
      if(playersC==2)
      {
        socket.broadcast.emit('syn',roomId);
        // socket.emit('game',roomId);
        // socket.broadcast.emit('game',roomId);
        socket.emit('game',data);
        socket.broadcast.emit('game',data);
      }
      else{
        socket.emit('wait',1);
      }
    });

    socket.on('move',function(data){
      console.log(data);
      if(data.playerType=="1"){
        position[data.roomId][data.id]=1
      }else{
        position[data.roomId][data.id]=0
      }
      var winner=checkResult(data.roomId);
      if(winner){
        console.log("winner");
        socket.broadcast.emit('change',data)
        socket.emit('result',{room:2,winner:winner,roomId:data.roomId});
        socket.broadcast.emit('result',{room:2,winner:winner,roomId:data.roomId});
      }else{
        socket.broadcast.to(data.roomId).emit('change',data)
      }
      console.log("Position "+data.roomId);
      console.log(position[data.roomId]);
    });

    socket.on('choice1',function(data){
      choice[data.roomId].choice1=data.choice;
      // choice1=data.choice;
      console.log(data.roomId);
      console.log(choice[data.roomId]);
      if (choice[data.roomId].choice2 != ""){
        result(data.roomId,socket);
      }else{
        socket.emit('wait',2);
      }
    });
      
    socket.on('choice2', function(data) {
      choice[data.roomId].choice2=data.choice;
      // choice2 = data.choice;
      console.log(data.roomId);
      console.log(choice[data.roomId]);
      if (choice[data.roomId].choice1 != "") {
          result(data.roomId,socket);
      }else{
        socket.emit('wait',2);
      }
    });

    socket.on('newGame',function(data){
      playersC=getPlayers(data.roomId);
      // console.log("New");
      // console.log(players);
      if(playersC==2){
        if(data.game=="2"){
          // for(var key in position){
          //   position[key]=-10;
          // }
          for (let i = 0; i < 151; i++) {
            position[i]={'1':-10,'2':-10,'3':-10,'4':-10,'5':-10,'6':-10,'7':-10,'8':-10,'9':-10}
          }
          socket.to(data.roomId).emit('new',data);
        }else{
          choice1="";
          choice2="";
          choice[data.roomId].choice1="";
          choice[data.roomId].choice2="";
          socket.to(data.roomId).emit('new',data);
        }
      }else{
        // socket.emit('nan');
        // socket.broadcast.emit('nan');
        socket.to(data.roomId).emit('nan');
        socket.broadcast.to(data.roomId).emit('nan');
      }      
    });

  });

  socket.on('disconnect', function () {
    var r;
    for (let i = 0; i < 151; i++) {
        if (games[i].pid[0] == playerId){
          games[i].players--;
          games[i].pid[0]=0;
          r=i;
        }else if(games[i].pid[1] == playerId){
          games[i].players--;
          games[i].pid[1]=0;
          r=i;
        }            
    }

    // socket.leave(r); 
    socket.broadcast.emit('player1',r);  
    
    socket.broadcast.emit('nan',r);
    // socket.broadcast.to(r).emit('nan');
    console.log(playerId + ' disconnected');
    console.log(games[r]);
  }); 

});

server.listen(port, function() {
  console.log('Starting server on port 5000');
});
