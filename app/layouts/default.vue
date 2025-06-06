<script setup lang="ts">
// Use VueUse composable to detect screen size
const { width: screenWidth } = useWindowSize()

// Define breakpoints - show iPhone mockup on tablet (768px) and above
const isMobile = computed(() => screenWidth.value < 768)
</script>

<template>
  <!-- Mobile: Show app directly -->
  <div v-if="isMobile" w-full>
    <AppHeader />
    <NuxtPage />
  </div>

  <!-- Tablet/Desktop: Show app wrapped in iPhone mockup -->
  <div v-else bg-neutral-100 dark:bg-neutral-900 flex="~ items-center justify-center" p-8>
    <IPhoneMockup
      :width="375"
      :height="812"
      class="mx-auto"
    >
      <div w-full h-full of="y-auto">
        <AppHeader />
        <NuxtPage />
      </div>
    </IPhoneMockup>
  </div>
</template>
