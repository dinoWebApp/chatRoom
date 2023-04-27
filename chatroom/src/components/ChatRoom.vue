<template>
  <div>
    {{ roomName }}
  </div>
  <div align="center" class="container"> 
    <div>
      <input v-bind:value="message" @input="inputMessage" type="text">
      <button @click="send">send</button>
    </div>
  </div>

  <div class="container" align="center">
    <div v-for="item in messages" :key="item">
      {{ item.nickName }} : {{ item.message }}
    </div>
    <div align="center" id="content">
    
    </div>
  </div>
  

  
  
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useRoute } from 'vue-router';
import axios from 'axios';
export default {
  name : 'ChatRoom',
  setup() {
    let message = ref('');
    const socket = io('http://localhost:8080');
    const route = useRoute();
    let roomName = route.query.roomName;
    let nickName = route.query.nickName;
    let messages = ref([]);

    axios.get('/api/chatRoom?roomName=' + route.query.roomName)
    .then(res=>{
      messages.value = res.data;
    })
    .catch(err=>{
      console.log(err);
    })
    

    socket.on('connect', () => {
      console.log('connected to server');
    });

    socket.emit('join', roomName);

    socket.on('broadcast', (data)=>{
      var newDiv = document.createElement("div");
      let txt = document.createTextNode(data.nickName+' : '+data.message);
      newDiv.appendChild(txt);
      document.getElementById('content').appendChild(newDiv);
    })


    onMounted(() => {
      console.log('mounted');
    });

    onUnmounted(()=>{
      socket.emit('leave', roomName);
    });

    function inputMessage(e) {
      message.value = e.target.value;
    }

    function send() {
      let sendData = {
        roomName : roomName,
        message : message.value,
        nickName : nickName
      }
      socket.emit('send', sendData);
      
    }

    function push() {
      socket.emit('push', 'chatroom2');
    }

    return {
      message,
      roomName, inputMessage, send, push, nickName, messages
    };
  }
}
</script>

<style>

</style>