<script setup lang="ts">
// Wallpaper component using the user's uploaded image in the bottom right
</script>

<template>
  <div class="fixed inset-0 w-full h-full -z-50 bg-[#000000] overflow-hidden select-none">
    <!-- Render the sword skeleton image exactly at the bottom right corner -->
    <div
      class="absolute inset-0 bg-no-repeat bg-right-bottom bg-contain pointer-events-none opacity-85 transition-opacity duration-700"
      style="background-image: url('/wallpaper.png'); background-size: 38% auto;"
    ></div>
  </div>
</template>
