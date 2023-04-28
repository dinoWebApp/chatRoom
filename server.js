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
app.use(express.static(path.join(__dirname, 'chatroom/dist')));
let db;

MongoClient.connect(process.env.DB_URL, (err, client)=>{
  if (err) return console.log(err);
  db = client.db('chatRoom');
  http.listen(8080, () => {
    console.log('listening on *:8080');
  });
});

app.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname, 'chatroom/dist/index.html'));
})

io.on('connection', (socket) => {
  console.log('a user connected');


  //채팅방 들어가기
  socket.on('join', (data)=>{
    console.log('join room' + data);
    socket.join(data);
  });

  //메세지 보내기
  socket.on('send', (data)=>{
    console.log(data);
    db.collection('messageId').findOne({name : 'messageId'})
    .then(result=>{
      data.id = result.id + 1
      return db.collection('messages').insertOne(data)
    })
    .then(()=>{
      return db.collection('messageId').updateOne({name : 'messageId'}, {$inc : {id : 1}})
    })
    .then(()=>{
      return db.collection('chatRecent').findOne({name : 'recentNum'})
    })
    .then((result)=>{
      let recent = result.id + 1;
      return db.collection('chatRooms').updateOne({roomName : data.roomName}, {$set : {lastMessage : data.message, recent : recent}});
    })
    .then(()=>{
      return db.collection('chatRecent').updateOne({name : 'recentNum'}, {$inc : {id : 1}});
    })
    .then(()=>{
      io.to(data.roomName).emit('broadcast', data);
    })
    .catch(err=>{
      console.log(err);
    })
    
  })

  // 채팅방 나가기
  socket.on('leave', (data)=>{
    console.log('leave room' + data);
    socket.leave(data);
  });

  socket.on('push', (data) => {
    console.log(data);
    io.to(data).emit('broadcast', 'push');
  });
  
  
});

app.get('/api/chatRooms', (req, res)=>{
  db.collection('chatRooms').find().sort({recent : -1}).toArray()
  .then(result=>{
    res.send(result);
  })
  .catch(err=>{
    console.log(err);
  })
});

app.get('/api/chatRoom', (req, res)=>{
  let roomName = req.query.roomName;
  db.collection('messages').find({roomName : roomName}).sort({id : 1}).toArray()
  .then(result=>{
    res.send(result);
  })
  .catch(err=>{
    console.log(err);
  })
})

app.post('/api/enrollChatRoom', (req, res)=>{
  console.log(req.body.chatRoomName);
  let recentNum;
  db.collection('chatRecent').findOne({name : 'recentNum'})
  .then(result=>{
    recentNum = result.id + 1;
    return db.collection('chatRooms').insertOne({roomName : req.body.chatRoomName, recent : recentNum, lastMessage : '방금 전 생성'});
  })
  .then(()=>{
    return db.collection('chatRecent').updateOne({name : 'recentNum'}, {$inc : {id : 1}});
  })
  .then(()=>{
    return db.collection('chatRooms').find().sort({recent : -1}).toArray()
  })
  .then(result=>{
    res.send(result);
  })
  .catch(err=>{
    console.log(err);
  })
  
});

app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname, 'chatroom/dist/index.html'));
});











