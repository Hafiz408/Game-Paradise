var socket = io();

var cell;
var playerType;
var type;
var c=0;
var turn=false;
var gameOn=false;

var result = document.getElementById("result");
var btn = document.getElementById("btn1");

var move = function(id){
    cell=document.getElementById(id);
    if(gameOn){
        result.innerText="Click Start to begin";
    }
    if (!checkPosition(id)){
        if(turn){
            socket.emit('move',{playerType:playerType,id:id});
            result.innerText="Opponent's turn";
            position[id]=true
            if (playerType=="1"){
                cell.innerText="X"
                table[id]="X"
            }else{
                cell.innerText="O"
                table[id]="O"
            }
            turn=false;
        }else if(gameOn){
            result.innerText="Wait for your turn";
        }else{
            result.innerText="Click Start to begin";
        }        
    }    
}

cells=["1","2","3","4","5","6","7","8","9"]

var clearAll = function(){
    for (i=0;i<cells.length;i++){
        var cell=document.getElementById(cells[i]);
        cell.innerText="-";
    }
    for (var i in table){
        var cell=document.getElementById(i);
        table[i]="-";
    }
    console.log('cleared');
}


position={"1":false,"2":false,"3":false,"4":false,"5":false,"6":false,"7":false,"8":false,"9":false}

var checkPosition = function(cell){
    return position.cell;
}

table={"1":"-","2":"-","3":"-","4":"-","5":"-","6":"-","7":"-","8":"-","9":"-"}

var displayTable = function(){
    for (var i in table){
        var cell=document.getElementById(i);
        cell.innerText=table[i];
    }
    console.log("Table updated");
}

var start = function(){
    type=btn.textContent;
    if(!gameOn){
        if(type==="Start"){
            socket.emit('start');
            gameOn=true;
            btn.innerText="Again";
          }else{
            console.log("New game");
            result.innerText="";
            btn.innerText="Start";
            clearAll();
            socket.emit('newGame',2);
          }    
    }else{
        result.innerText="Finish the present game";
    }
  }

socket.emit('joined',2);

socket.on('player1',function(){
    playerType="1";
    console.log("player:"+playerType);
});
  
socket.on('player2',function(){
    playerType="2";
    console.log("player:"+playerType);
});

socket.on('syn',function(){
    gameOn=true;
    btn.innerText="Again";
});

socket.on('full', function (msg) {
    console.log("Room full");
    alert("Room full !!");
});

socket.on('game',function(roomId){
    if(roomId==2){
        console.log("Game on");
        if(playerType=="1"){
            turn=true
        }else{
            turn=false
        }
        if(turn){
            result.innerText="Your turn"

        }else{
            result.innerText="Opponent's turn"
        }
    }    

})

socket.on('new',function(room){
    if(room==2){
        console.log("New game");
        result.innerText="";
        btn.innerText="Start";
        clearAll();
    }
})

socket.on('nan',function(){
    result.innerText="Opponent left!! Go back."
    // alert("Opponent left!! Go back.");
  })

socket.on('change',function(data){
    console.log("Change :");
    if(data.playerType=="1"){
        table[data.id]="X"
    }else{
        table[data.id]="O"
    }
    position[data.id]=true
    console.log(data.playerType);
    console.log(table);
    console.log(position);
    displayTable();
    if(playerType!=data.playerType){
        turn=true;
    }else{
        turn=false;
    }
    result.innerText="Your turn";
});

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
  });

  socket.on('result',function(data){
      turn=false;
      if(data.room==2){
          if (data.winner==playerType){
            result.innerText="Won 🤩";
          }else if (data.winner=="draw"){
            result.innerText="Draw 😬";
          }else{
            result.innerText="Lost ☹️";
          }
          gameOn=false;
      }
  });



