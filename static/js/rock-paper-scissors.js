var socket = io();

var choice="";
var playerType;
var type;
var c=0;
var rn;

var you = document.getElementById('you');
var oppo = document.getElementById('oppo');
var result = document.getElementById("result");
var btn = document.getElementById("btn1");

function begin(){
  rn=prompt("Enter room number 1-50 :");
  if(rn === null){
    window.location.assign('/');
  }else if(rn>0 && rn<51){
      console.log("Room "+rn);
      socket.emit('joined',{roomId:rn, game:"1"});
  }else{
      alert("Enter a valid Room number !!");
      begin();
  }
}

begin();

var start = function(){
  type=btn.textContent;
  if(type==="Start"){
    socket.emit('start',{roomId:rn,game:"1",choice:choice});
  }else{
    console.log("New game");
    result.innerText="";
    choice="";
    btn.innerText="Start";
    you.classList.remove("paper","rock","scissor");
    oppo.classList.remove("paper","rock","scissor");
    socket.emit('newGame',{roomId:rn,game:"1"});
  }
  
}

var move = function(id){
  choice = id;
  console.log('choice : '+ choice);
  you.classList.remove("paper","rock","scissor");
  if (choice=='paper'){
    you.classList.add("paper");
  }else if (choice=='rock'){
    you.classList.add("rock");
  }
  else{
    you.classList.add("scissor");
  }   
}

socket.on('player1',function(roomId){
  if(roomId==rn){
    playerType="1";
    console.log("player:"+playerType);
  }
})

socket.on('player2',function(roomId){
  if(roomId==rn){
    playerType="2";
    console.log("player:"+playerType);
  }
})

socket.on('wait', function(data){
  if (data==1){
    console.log("Not enough players");
    alert("Waiting for opponent ... \nAsk your friend to join room "+rn+" .");
  }else{
    result.innerText="Waiting for opponent's choice";
    if (c<5){
      c++;
      setTimeout(start,2000);
    }else{
      result.innerText="Opponent not responding, do wait.";
      setTimeout(start,2000);
    }
  }  
})

socket.on('game',function(data){
  if(data.roomId==rn){
    if(data.game=="1"){
      console.log("Game started");
      if (choice==""){
        result.innerText="Select your choice !!";
      }else{
        if (playerType=="1"){
          socket.emit('choice1',{choice:choice,roomId:rn});
        }else{
          socket.emit('choice2',{choice:choice,roomId:rn});
        }
      }
    }  
  }  
});

socket.on('result',function(data){

  oppo.classList.remove("paper","rock","scissor");
  if (playerType=="1"){
    
    if (data.choice2==='paper'){
      oppo.classList.add("paper");
    }else if (data.choice2==='rock'){
      oppo.classList.add("rock");
    }else if (data.choice2==='scissor'){
      oppo.classList.add("scissor");
    }
  }else{
    
    if (data.choice1==='paper'){
      oppo.classList.add("paper");
    }else if (data.choice1==='rock'){
      oppo.classList.add("rock");
    }else if (data.choice2==='scissor'){
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

  setTimeout(5000);
  btn.innerText="Again";

})

socket.on('nan',function(roomId){
  if(roomId==rn){
    console.log('nan received')
    result.innerText=""
    alert("Opponent left!! Go back.");
    // socket.emit('newGame',{roomId:rn,game:1});
  }
})


socket.on('new',function(data){
  if(data.roomId==rn){
    console.log("New game");
    result.innerText="";
    choice="";
    btn.innerText="Start";
    you.classList.remove("paper","rock","scissor");
    oppo.classList.remove("paper","rock","scissor");
  }
})

socket.on('full', function (msg) {
  console.log("Room full");
  alert("Room full !! Enter another number.");
  begin();
});



