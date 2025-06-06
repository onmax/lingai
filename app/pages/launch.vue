<script setup lang="ts">
import { motion } from 'motion-v'

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

// Color mode
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Email registration state
const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')

// Handle email submission
async function handleSubmit() {
  if (!email.value || isSubmitting.value)
    return

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // Here you would typically send to your API
    // For now, we'll simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    isSubmitted.value = true
    email.value = ''
  }
  catch {
    errorMessage.value = 'Something went wrong. Please try again.'
  }
  finally {
    isSubmitting.value = false
  }
}

// Animation state
const showContent = ref(false)

// Start the hyperspeed animation on mount
onMounted(() => {
  setTimeout(() => {
    showContent.value = true
  }, 300)
})
</script>

<template>
  <div relative min-h-screen :class="isDark ? 'bg-neutral-1100 text-white' : 'bg-white text-neutral-800'" of-hidden>
    <!-- Falling Stars Background -->
    <FallingStarsBg color="#60A5FA" :count="600" />

    <!-- Main Content -->
    <div relative z-10 flex="~ col items-center justify-center" min-h-screen px-16>
      <motion.div
        text-center max-w-1024 mx-auto
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
          text="f-4xl transparent" font-bold
          bg="gradient-to-r from-blue-400 via-purple-400 to-blue-600"
          bg-clip-text
          leading-tight mb-24
          :initial="{ opacity: 0 }"
          :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
          :transition="{ duration: 0.6, delay: 0.8, ease: 'easeOut' }"
        >
          Learn Spanish at
          <br>
          <motion.span
            text-gold
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
          :class="isDark ? 'text-f-xl text-neutral-300' : 'text-f-xl text-neutral-700'"
          leading-relaxed mb-48 max-w-672 mx-auto
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
          max-w-448 mx-auto
          :initial="{ opacity: 0 }"
          :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
          :transition="{ duration: 0.6, delay: 1.6, ease: 'easeOut' }"
        >
          <form flex="~ col gap-16" @submit.prevent="handleSubmit">
            <div relative>
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email to join the mission"
                nq-input-box
                w-full px-24 py-16 rounded-full
                :class="isDark
                  ? 'bg-white/10 border-2 border-blue-500/30 text-f-lg text-white text-center placeholder:text-neutral-400 focus:bg-white/15'
                  : 'bg-neutral-50 border-2 border-blue-500/30 text-f-lg text-neutral-800 text-center placeholder:text-neutral-700 focus:bg-neutral-100'"
                focus:border-blue-400 focus:outline-none
                transition="all duration-300"
                :disabled="isSubmitting"
              >
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || !email"
              nq-pill-xl
              nq-pill-gold
            >
              <span v-if="isSubmitting" flex="~ items-center gap-8">
                <div animate-spin i-nimiq:spinner w-20 h-20 />
                Launching...
              </span>
              <span v-else>
                Get Early Access
              </span>
            </button>
          </form>

          <!-- Error Message -->
          <p v-if="errorMessage" text="f-sm red-400 center" mt-16>
            {{ errorMessage }}
          </p>
        </motion.div>

        <!-- Success Message -->
        <motion.div
          v-else
          text-center
          :initial="{ opacity: 0, scale: 0.8, y: 30 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :transition="{ duration: 0.5, ease: 'easeOut' }"
        >
          <motion.div
            i-nimiq:check w-64 h-64 text-green-400 mx-auto mb-16
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
          <h3 :class="isDark ? 'text-f-xl text-white font-semibold' : 'text-f-xl text-neutral-800 font-semibold'" mb-8>
            Welcome to the Rebellion!
          </h3>
          <p :class="isDark ? 'text-f-base text-neutral-300' : 'text-f-base text-neutral-600'">
            You'll be the first to know when we launch into hyperspace.
          </p>
        </motion.div>

        <!-- Additional Text -->
        <motion.div
          mt-64
          :initial="{ opacity: 0 }"
          :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
          :transition="{ duration: 0.6, delay: 2.0, ease: 'easeOut' }"
        >
          <p :class="isDark ? 'text-f-sm text-neutral-500' : 'text-f-sm text-neutral-700'">
            Powered by AI • Science-proven for 30+ years • Coming soon to a galaxy near you
          </p>
        </motion.div>
      </motion.div>
    </div>

    <!-- Scroll indicator (optional) -->
    <motion.div
      absolute bottom-32 left="1/2" transform="-translate-x-1/2"
      :initial="{ opacity: 0 }"
      :animate="showContent ? { opacity: 1 } : { opacity: 0 }"
      :transition="{ duration: 0.6, ease: 'easeOut', delay: 2.2 }"
    >
      <motion.div
        i-nimiq:chevron-down w-24 h-24
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
