<script setup lang="ts">
import { motion } from 'motion/vue'
import FallingStarsBg from '~/components/FallingStarsBg.vue'

// Page meta
definePageMeta({
  layout: false,
  auth: false,
})

// SEO
useSeoMeta({
  title: 'LingAI - Learn Spanish at Hyperspeed',
  description: 'Master Spanish faster than you thought possible. Join the rebellion against slow language learning.',
  ogTitle: 'LingAI - Learn Spanish at Hyperspeed',
  ogDescription: 'Master Spanish faster than you thought possible. Join the rebellion against slow language learning.',
})

const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')

const isDark = ref(true)

// Submit form
async function handleSubmit() {
  if (isSubmitting.value || !email.value)
    return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/early-access', {
      method: 'POST',
      body: { email: email.value },
    })

    isSubmitted.value = true
  }
  catch (error: any) {
    errorMessage.value = error?.data?.message || 'Something went wrong. Please try again.'
  }
  finally {
    isSubmitting.value = false
  }
}

const showContent = ref(false)

// Start the hyperspeed animation on mount
onMounted(() => {
  setTimeout(() => {
    showContent.value = true
  }, 300)
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden" :class="isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800'">
    <!-- Falling Stars Background -->
    <FallingStarsBg color="#60A5FA" :count="600" />

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
      <motion.div
        class="text-center max-w-4xl mx-auto"
        :initial="{ opacity: 0, scale: 0.1, filter: 'blur(20px)' }"
        :animate="showContent ? {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
        } : {
          opacity: 0,
          scale: 0.1,
          filter: 'blur(20px)',
        }"
        :transition="{
          duration: 1.2,
          ease: [0.25, 0.46, 0.45, 0.94],
          times: [0, 0.5, 1],
          scale: {
            keyframes: [0.1, 1.1, 1],
            times: [0, 0.5, 1],
          },
        }"
      >
        <!-- Main Headline -->
        <motion.h1
          class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent leading-tight mb-6"
          :initial="{ opacity: 0 }"
          :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
          :transition="{ duration: 0.6, delay: 0.8, ease: 'easeOut' }"
        >
          Learn Spanish at
          <br>
          <motion.span
            class="text-yellow-400"
            :initial="{ opacity: 0 }"
            :animate="showContent ? { opacity: [0, 1] } : { opacity: 0 }"
            :transition="{ duration: 0.8, delay: 1.0 }"
          >
            <motion.span
              :animate="{ opacity: [1, 0.7, 1] }"
              :transition="{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }"
            >
              Hyperspeed
            </motion.span>
          </motion.span>
        </motion.h1>

        <!-- Subline -->
        <motion.p
          :class="isDark ? 'text-xl text-neutral-300' : 'text-xl text-neutral-700'"
          class="leading-relaxed mb-12 max-w-2xl mx-auto"
          :initial="{ opacity: 0 }"
          :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
          :transition="{ duration: 0.6, delay: 1.2, ease: 'easeOut' }"
        >
          Master Spanish faster than you thought possible.
          <br class="hidden md:block">
          Join the rebellion against slow language learning.
        </motion.p>

        <!-- Email Registration Form -->
        <motion.div
          v-if="!isSubmitted"
          class="max-w-md mx-auto"
          :initial="{ opacity: 0 }"
          :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
          :transition="{ duration: 0.6, delay: 1.6, ease: 'easeOut' }"
        >
          <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div class="relative">
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email to join the mission"
                class="w-full px-6 py-4 rounded-full text-lg text-center transition-all duration-300 focus:outline-none focus:border-blue-400"
                :class="isDark
                  ? 'bg-white/10 border-2 border-blue-500/30 text-white placeholder:text-neutral-400 focus:bg-white/15'
                  : 'bg-neutral-50 border-2 border-blue-500/30 text-neutral-800 placeholder:text-neutral-700 focus:bg-neutral-100'"
                :disabled="isSubmitting"
              >
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || !email"
              class="px-8 py-4 bg-yellow-500 text-neutral-900 rounded-full font-semibold text-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <div class="animate-spin i-tabler:loader-2 w-5 h-5" />
                Launching...
              </span>
              <span v-else>
                Get Early Access
              </span>
            </button>
          </form>

          <!-- Error Message -->
          <p v-if="errorMessage" class="text-sm text-red-400 text-center mt-4">
            {{ errorMessage }}
          </p>
        </motion.div>

        <!-- Success Message -->
        <motion.div
          v-else
          class="text-center"
          :initial="{ opacity: 0, scale: 0.8, y: 30 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :transition="{ duration: 0.5, ease: 'easeOut' }"
        >
          <motion.div
            class="i-tabler:check w-16 h-16 text-green-400 mx-auto mb-4"
            :animate="{
              y: [0, -10, 0],
              scale: [1, 1.1, 1],
            }"
            :transition="{
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }"
          />
          <h3 :class="isDark ? 'text-xl text-white font-semibold' : 'text-xl text-neutral-800 font-semibold'" class="mb-2">
            Welcome to the Rebellion!
          </h3>
          <p :class="isDark ? 'text-base text-neutral-300' : 'text-base text-neutral-600'">
            You'll be the first to know when we launch into hyperspace.
          </p>
        </motion.div>

        <!-- Additional Text -->
        <motion.div
          class="mt-16"
          :initial="{ opacity: 0 }"
          :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
          :transition="{ duration: 0.6, delay: 2.0, ease: 'easeOut' }"
        >
          <p :class="isDark ? 'text-sm text-neutral-500' : 'text-sm text-neutral-700'">
            Powered by AI • Science-proven for 30+ years • Coming soon to a galaxy near you
          </p>
        </motion.div>
      </motion.div>
    </div>

    <!-- Scroll indicator (optional) -->
    <motion.div
      class="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      :initial="{ opacity: 0 }"
      :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
      :transition="{ duration: 0.6, ease: 'easeOut', delay: 2.2 }"
    >
      <motion.div
        class="i-tabler:chevron-down w-6 h-6"
        :class="isDark ? 'text-neutral-500' : 'text-neutral-700'"
        :animate="{ opacity: [1, 0.5, 1] }"
        :transition="{ duration: 2, repeat: Infinity, ease: 'easeInOut' }"
      />
    </motion.div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
