var socket = io();

var roomId;
var choice="";
var playerType;
var type;
var c=0;

var you = document.getElementById('you');
var oppo = document.getElementById('oppo');
var score = document.getElementById("score");
var userCount = document.getElementById("userCount");
var result = document.getElementById("result");
var btn = document.getElementById("btn1");

socket.emit('joined',1);

var start = function(){
  type=btn.textContent;
  if(type==="Start"){
    socket.emit('start',choice);
  }else{
    console.log("New game");
    result.innerText="";
    btn.innerText="Start";
    you.classList.remove("paper","rock","scissors");
    oppo.classList.remove("paper","rock","scissors");
    choice=""
    socket.emit('newGame');
  }
  
}

var move = function(id){
  choice = id;
  console.log('choice : '+ choice);
  you.classList.remove("paper","rock","scissors");
  if (choice=='paper'){
    you.classList.add("paper");
  }else if (choice=='rock'){
    you.classList.add("rock");
  }
  else{
    you.classList.add("scissor");
  }   
}

socket.on('player1',function(){
  playerType="1";
  console.log("player:"+playerType);
})

socket.on('player2',function(){
  playerType="2";
  console.log("player:"+playerType);
})

socket.on('wait', function(data){
  if (data==1){
    console.log("Not enough players");
    alert("Waiting for opponent...");
  }else{
    result.innerText="Waiting for opponent's choice";
    if (c<5){
      c++;
      setTimeout(start,2000);
    }
    else {
      result.innerText="Opponent not responding, do wait.";
    }
  }  
})

socket.on('game',function(){
  console.log("Game started");
  if (choice==""){
    result.innerText="Select your choice !!";
  }else{
    if (playerType=="1"){
      socket.emit('choice1',choice);
    }else{
      socket.emit('choice2',choice);
    }
  }
  
})

socket.on('result',function(data){
  
  if (playerType=="1"){
    oppo.classList.remove("paper","rock","scissors");
    if (data.choice2=='paper'){
      oppo.classList.add("paper");
    }else if (data.choice2=='rock'){
      oppo.classList.add("rock");
    }
    else{
      oppo.classList.add("scissor");
    }
  }else{
    oppo.classList.remove("paper","rock","scissors");
    if (data.choice1=='paper'){
      oppo.classList.add("paper");
    }else if (data.choice1=='rock'){
      oppo.classList.add("rock");
    }
    else{
      oppo.classList.add("scissor");
    }
  }

  
  if (data.winner==playerType){
    result.innerText="Won 🤩";
  }else if (data.winner=="draw"){
    result.innerText="Draw 😬";
  }else{
    result.innerText="Lost ☹️";
  }

  btn.innerText="Again";

})

socket.on('full', function (msg) {
  console.log("Room full");
  alert("Room full !!");
});



