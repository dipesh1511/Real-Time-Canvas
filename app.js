const express = require("express");

const app= express();
const http = require('http').createServer(app);
const io  = require('socket.io')(http);


app.use(express.static("frontModule"));

let port = 3000;
http.listen(port, ()=> {
    console.log("listening to port" + port);
})

//let io= socket(server);

io.on("connection", (socket)=> {
    console.log("made connection");
    //received data 
    socket.on("beginPath", (data)=>{
        //data from frontend
        // transfer data to all connected computer
        socket.broadcast.emit("beginPath", data);
    })

    socket.on("drawPath", (data)=>{
       
        socket.broadcast.emit("drawPath", data);
    })
    socket.on("redoUndo", (data)=>{
        socket.broadcast.emit("redoUndo", data);
    })
})
