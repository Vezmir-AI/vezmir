<script setup>
import { ref } from 'vue'
import ChatInput from '@/components/ChatInput.vue'

const messages = ref([])

const handleMessage = (message) => {
  messages.value.push(message)
  console.log('Message sent:', message)
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-4xl font-bold mb-8">Welcome</h1>
    <ChatInput @send-message="handleMessage" />
  </div>
</template>
