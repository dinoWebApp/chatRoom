import { createWebHistory, createRouter } from "vue-router";
import HomePage from './components/HomePage.vue'
import ChatRoom from './components/ChatRoom.vue'
const routes = [
  {
    path: '/',
    name : 'HomePage',
    component : HomePage
  },
  {
    path : '/chat-room',
    name : 'ChatRoom',
    component : ChatRoom
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;