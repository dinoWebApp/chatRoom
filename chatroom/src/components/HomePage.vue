<template>
  <div v-if="enroll === false" align="center">
    <div class="form-floating mb-2 col-6 d-flex">
      <input type="text" class="form-control" id="floatingIdInput" placeholder="닉네임" v-bind:value="nickName" @change="inputNick">
      <label for="floatingIdInput">닉네임</label>
      <button @click="clickEnroll" class="btn btn-danger col-auto">등록</button>
    </div>
  </div>
  <div v-if="enroll">
    <div align="center">
      <div class="form-floating mb-2 col-6 d-flex">
        <input type="text" class="form-control" id="floatingIdInput" placeholder="채팅방 이름" v-bind:value="chatName" @change="inputChatName">
        <label for="floatingIdInput">채팅방 이름</label>
        <button @click="clickChatEnroll" class="btn btn-danger col-auto">등록</button>
      </div>
    </div>
    <div v-for="item in chatRooms" :key="item" class="container">
      <div>
        <div>
          {{ item.roomName }}
        </div>
        <div style="font-size: small; color: gray;">
          {{ item.lastMessage }}
        </div>
        <button @click="clickJoinRoom" class="btn btn-danger">입장</button>
      </div>
      <hr/>
    </div>
  </div>
  
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';


export default{
  setup() {
    const router = useRouter();
    let nickName = ref('');
    let chatName = ref('');
    let enroll = ref(false);
    let chatRooms = ref([]);
    function clickJoinRoom(e) {
      router.push({path : '/chat-room', query : {roomName : e.target.previousElementSibling.previousElementSibling.innerText, nickName : nickName.value}});
    }
    function clickEnroll() {
      enroll.value = true;
      axios.get('/api/chatRooms')
      .then(res=>{
        chatRooms.value = res.data;
      })
      .catch(err=>{
        console.log(err);
      })
    }
    function inputNick(e) {
      nickName.value = e.target.value;
    }
    function inputChatName(e) {
      chatName.value = e.target.value;
    }
    function clickChatEnroll() {
      axios.post('/api/enrollChatRoom', {chatRoomName : chatName.value})
      .then(res=>{
        chatRooms.value = res.data;
      })
      .catch(err=>{
        console.log(err);
      })
    }

    return {clickJoinRoom, nickName, enroll, clickEnroll, inputNick, chatName, inputChatName, clickChatEnroll, chatRooms};
  },

};

</script>


<style scoped>

</style>
