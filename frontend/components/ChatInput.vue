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
        v-model="message"
        type="text"
        placeholder="What's on your mind..."
        class="flex-grow bg-transparent outline-none text-gray-200"
        @keyup.enter="sendMessage"
      />
      <button
        class="ml-2 bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600"
        @click="sendMessage"
      >
        <i class="fas fa-paper-plane" />
      </button>
    </div>
  </div>
</template>
