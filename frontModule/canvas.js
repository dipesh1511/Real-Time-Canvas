let canvas = document.querySelector("canvas");
canvas.width= window.innerWidth;
canvas.height= window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-colour");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo= document.querySelector(".redo");
let undo = document.querySelector(".undo");  

let penColor= "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.Value;
let eraserWidth= eraserWidthElem.value;

//API
let tool = canvas.getContext("2d");
/*
let history = {
    redo_list: [],
    undo_list: [],

    saveStates: function(canvas, list, keep_redo) {
      keep_redo = keep_redo || false;
      if(!keep_redo) {
        this.redo_list = [];
      }
      
      (list || this.undo_list).push(canvas.toDataURL());   
    },

    undo: function(canvas, tool) {
      this.restoreState(canvas, tool, this.undo_list, this.redo_list);
    },

    redo: function(canvas, tool) {
      this.restoreState(canvas, tool, this.redo_list, this.undo_list);
    },

    restorestate: function(canvas, tool,  pop, push) {
      if(pop.length) {
        saveState(canvas, push, true);
        var restore_state = pop.pop();
        var img = new Element('img', {'src':restore_state});
        img.onload = function() {
          tool.clearRect(0, 0, 600, 400);
          tool.drawImage(img, 0, 0, 600, 400, 0, 0, 600, 400);  
        }
      }
    }
  }

*/

let undoRedoTracker= []; //data 
let track=0; // represent which action to track from array (index of array)

let mouseDown = false;

tool.strokeStyle = penColor; //to modify color
tool.lineWidth= penWidth; // to modify width (thickness)
/*tool.beginPath();
tool.moveTo(20,20); // starting point 
tool.lineTo(100,150); //ending point
tool.stroke(); // to fill color */

// mousedown - start new path,  mousemove - path fill(graphics)
canvas.addEventListener("mousedown", (e) => {
   // history.saveState(this.canvas);
    mouseDown= true;
    // beginPath({
    //     x : e.clientX,
    //     y : e.clientY
    // })
    let data = {
        x : e.clientX,
        y : e.clientY
    }
    socket.emit("beginPath", data); // send data to server

})
canvas.addEventListener("mousemove", (e) => {
    if(mouseDown) {
        let data= {
            x : e.clientX,
            y : e.clientY,
            color : eraserFlag ? eraserColor : penColor,
            width : eraserFlag ? eraserWidth : penWidth
        }
        socket.emit("drawPath", data);
    }
    
})
canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;

    let url= canvas.toDataURL();
    undoRedoTracker.push(url);
    track= undoRedoTracker.length-1;

})

undo.addEventListener("click", (e)=>{
   if(track > 0) track--;
    // track action performed 
    let data = {
        trackValue : track,
        undoRedoTracker
    }
    socket.emit("redoUndo", data);
})

redo.addEventListener("click", (e)=>{
    if(track< undoRedoTracker.length-1) track++;
    // track action performed 
    let data={
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("redoUndo", data); 
})

function undoRedoCanvas(trackObj) {
    track= trackObj.trackValue;
    undoRedoTracker= trackObj.undoRedoTracker;

    let url= undoRedoTracker[track];
    let img = new Image();
    img.src= url;
    img.onload = (e) => {
        tool.drawImage(img,0,0,canvas.width, canvas.height);
    }
}


function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawPath(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e)=> {
        let color = colorElem.classList[0];
        penColor= color;
        tool.strokeStyle =penColor;
    })
});

pencilWidthElem.addEventListener("change", (e)=> {
    penWidth = pencilWidthElem.value;
    tool.lineWidth= penWidth;
})
eraserWidthElem.addEventListener("change", (e)=> {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth= eraserWidth;
})

/*
eraser.addEventListener("click", (e)=>{
    if(eraserFlag){
        tool.strokeStyle= eraserColor;
        tool.lineWidth= eraserWidth;
    }
    else {
        tool.strokeStyle= penColor;
        tool.lineWidth= penWidth;
    }
}) */

download.addEventListener("click", (e) => {
    let url= canvas.toDataURL();
    let a= document.createElement("a");
    a.href= url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath", (data) => {
    // data from server
    beginPath(data);
    
})
socket.on("drawPath", (data) => {
    drawPath(data);  
})

socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);  
})