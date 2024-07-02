<script setup>
import { ref } from 'vue'

const message = ref('')
const emit = defineEmits(['send-message'])

const sendMessage = () => {
  if (message.value.trim()) {
    emit('send-message', message.value)
    message.value = ''
  }
}
</script>


<template>
    <div class="fixed bottom-0 left-0 right-0 p-4">
      <div class="bg-gray-700 rounded-lg flex items-center p-2">
        <input
          type="text"
          placeholder="What's on your mind..."
          class="flex-grow bg-transparent outline-none text-gray-200"
          v-model="message"
          @keyup.enter="sendMessage"
        />
        <button
          @click="sendMessage"
          class="ml-2 bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </template>
  