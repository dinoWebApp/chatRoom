const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http').createServer(app);
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
require('dotenv').config();


const io = require("socket.io")(http, {
  cors: {
    credentials: true,
  },
  allowEIO3: true,
});

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());
app.use(cors());
let db;

MongoClient.connect(process.env.DB_URL, (err, client)=>{
  if (err) return console.log(err);
  db = client.db('chatRoom');
  http.listen(8080, () => {
    console.log('listening on *:8080');
  });
});



io.on('connection', (socket) => {
  console.log('a user connected');


  //채팅방 들어가기
  socket.on('join', (data)=>{
    console.log('join room ' + data);
    socket.join(data);
  });

  //채팅 보내기
  socket.on('send', (data)=>{
    db.collection('chatRooms').findOne({roomName : data.roomName})
    .then(result=>{
      if(result) {
        let curr = new Date();
        let utc = curr.getTime() + (curr.getTimezoneOffset()*60*1000);
        let KR_TIME_DIFF = 9*60*60*1000;
        let kr_curr = new Date(utc + KR_TIME_DIFF);
        let month = ("0" + (1 + kr_curr.getMonth())).slice(-2);
        let day = ("0" + kr_curr.getDate()).slice(-2);
        let hours = ("0" + kr_curr.getHours()).slice(-2);
        let minutes = ("0" + kr_curr.getMinutes()).slice(-2);
        let date = (month + '-' + day + ' ' + hours + ':' + minutes);
        db.collection('chatRooms').updateOne({roomName : data.roomName}, {
          $push : {
            chats : 
            {
              sendFrom : data.sendFrom,
              chat : data.chat,
              chatId : result.lastChatId + 1,
              date : date
            }
          },
          $inc : {
            lastChatId : 1
          }
        })
        .then(()=>{
          io.to(data.roomName).emit('broadcast', {
            sendFrom : data.sendFrom,
            chat : data.chat,
            chatId : result.lastChatId + 1,
            date : date
          });
        })
        .catch(err=>{
          console.log(err);
        });
      } else {
        db.collection('chatRooms').insertOne({
          roomName : data.roomName,
          chats : [
            {
              sendFrom : data.sendFrom,
              chat : data.chat,
              chatId : 1,
              date : date
            }
          ],
          lastChatId : 1
        })
        .then(()=>{
          io.to(data.roomName).emit('broadcast', {
            sendFrom : data.sendFrom,
            chat : data.chat,
            chatId : 1,
            date : date
          });
        })
        .catch(err=>{
          console.log(err);
        });
      }
    })
    .catch(err=>{
      console.log(err)
    });
  })

  // 채팅방 나가기
  socket.on('leave', (data)=>{
    console.log('leave room' + data);
    socket.leave(data);
  });
});


//채팅방 로드
app.get('/chatRoom', (req, res)=>{
  let unreadChats;
  db.collection('chatRooms').findOne({roomName : req.query.roomName})
  .then(result=>{
    unreadChats = result.lastChatId - parseInt(req.query.lastChatId);
    res.send({
      roomName : result.roomName,
      chats : result.chats,
      unreadChats : unreadChats
    });
  })
  .catch(err=>{
    console.log(err);
  })
})













