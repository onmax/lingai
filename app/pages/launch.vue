<script setup lang="ts">
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
      <div
        class="text-center max-w-4xl mx-auto transition-all duration-1200 ease-out"
        :class="showContent ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-10 blur-lg'"
      >
        <!-- Main Headline -->
        <h1
          class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent leading-tight mb-6 transition-opacity duration-600 delay-800"
          :class="showContent ? 'opacity-100' : 'opacity-0'"
        >
          Learn Spanish at
          <br>
          <span
            class="text-yellow-400 transition-opacity duration-800 delay-1000"
            :class="showContent ? 'opacity-100' : 'opacity-0'"
          >
            <span class="animate-pulse">
              Hyperspeed
            </span>
          </span>
        </h1>

        <!-- Subline -->
        <p
          :class="[
            isDark ? 'text-xl text-neutral-300' : 'text-xl text-neutral-700',
            'leading-relaxed mb-12 max-w-2xl mx-auto transition-opacity duration-600 delay-1200',
            showContent ? 'opacity-100' : 'opacity-0'
          ]"
        >
          Master Spanish faster than you thought possible.
          <br class="hidden md:block">
          Join the rebellion against slow language learning.
        </p>

        <!-- Email Registration Form -->
        <div
          v-if="!isSubmitted"
          class="max-w-md mx-auto transition-opacity duration-600 delay-1600"
          :class="showContent ? 'opacity-100' : 'opacity-0'"
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
        </div>

        <!-- Success Message -->
        <div
          v-else
          class="text-center transition-all duration-500 ease-out"
          :class="isSubmitted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-80 translate-y-8'"
        >
          <div class="i-tabler:check w-16 h-16 text-green-400 mx-auto mb-4 animate-bounce" />
          <h3 :class="isDark ? 'text-xl text-white font-semibold' : 'text-xl text-neutral-800 font-semibold'" class="mb-2">
            Welcome to the Rebellion!
          </h3>
          <p :class="isDark ? 'text-base text-neutral-300' : 'text-base text-neutral-600'">
            You'll be the first to know when we launch into hyperspace.
          </p>
        </div>

        <!-- Additional Text -->
        <div
          class="mt-16 transition-opacity duration-600 delay-2000"
          :class="showContent ? 'opacity-100' : 'opacity-0'"
        >
          <p :class="isDark ? 'text-sm text-neutral-500' : 'text-sm text-neutral-600'" class="mb-4">
            Built by rebels, for rebels. No boring textbooks. No endless grammar drills.
          </p>
          <p :class="isDark ? 'text-xs text-neutral-600' : 'text-xs text-neutral-500'">
            Join 1,000+ language learners who chose the fast lane.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scale-10 {
  transform: scale(0.1);
}

.blur-lg {
  filter: blur(20px);
}

.blur-0 {
  filter: blur(0px);
}

.duration-1200 {
  transition-duration: 1200ms;
}

.duration-600 {
  transition-duration: 600ms;
}

.duration-800 {
  transition-duration: 800ms;
}

.delay-800 {
  transition-delay: 800ms;
}

.delay-1000 {
  transition-delay: 1000ms;
}

.delay-1200 {
  transition-delay: 1200ms;
}

.delay-1600 {
  transition-delay: 1600ms;
}

.delay-2000 {
  transition-delay: 2000ms;
}
</style>
