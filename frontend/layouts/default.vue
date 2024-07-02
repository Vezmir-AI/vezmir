<template>
    <div class="min-h-screen bg-gray-800 text-gray-200">
      <header class="flex justify-between items-center p-4">
        <button class="text-gray-400 hover:text-gray-200">
          <i class="fas fa-bars"></i>
        </button>
        <button class="text-gray-400 hover:text-gray-200 rounded-full bg-gray-700 w-8 h-8 flex items-center justify-center">
          J
        </button>
      </header>
      <main class="container mx-auto px-4">
        <slot />
      </main>
    </div>
  </template>
  