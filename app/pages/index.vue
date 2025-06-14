<script setup lang="ts">
definePageMeta({
  auth: {
    only: 'guest',
    redirectUserTo: '/courses/spanish',
  },
})

const auth = useAuth()

// Composable to handle post-login navigation
async function navigateAfterLogin() {
  try {
    // Fetch user profile to check onboarding status
    const userProfile = await $fetch('/api/user/profile')

    // If user has no profile or no topics, redirect to onboarding
    if (!userProfile?.profile || !userProfile?.topics?.length) {
      await navigateTo('/onboarding')
    }
    else {
      // User is onboarded, redirect to Spanish lessons
      await navigateTo('/courses/spanish')
    }
  }
  catch (error) {
    // If there's an error fetching profile, redirect to onboarding to be safe
    consola.error('Error checking user profile:', error)
    await navigateTo('/onboarding')
  }
}

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)

// Error message states
const signInError = ref('')
const signUpError = ref('')

async function signIn() {
  if (loading.value)
    return

  // Clear previous errors
  signInError.value = ''
  loading.value = true

  const { error } = await auth.signIn.email({
    email: email.value,
    password: password.value,
  })

  if (error) {
    signInError.value = error.message || 'Sign in failed. Please try again.'
  }
  else {
    // Fetch session to ensure authentication state is updated
    await auth.fetchSession()
    await navigateAfterLogin()
  }
  loading.value = false
}

async function signUp() {
  if (loading.value)
    return

  // Clear previous errors
  signUpError.value = ''
  loading.value = true

  const { error } = await auth.signUp.email({
    email: email.value,
    password: password.value,
    name: name.value,
  })

  if (error) {
    signUpError.value = error.message || 'Sign up failed. Please try again.'
  }
  else {
    // Fetch session to ensure authentication state is updated after sign up
    await auth.fetchSession()
    await navigateAfterLogin()
  }
  loading.value = false
}
</script>

<template>
  <TabsRoot class="flex flex-col mx-auto max-w-80 shadow rounded-lg" default-value="signin">
    <TabsList class="relative shrink-0 flex" aria-label="Sign in or sign up">
      <TabsIndicator
        class="absolute px-8 left-0 h-8 bottom-0 w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] translate-y-1 rounded-full transition-all duration-300"
      >
        <div class="bg-blue-500 size-full" />
      </TabsIndicator>
      <TabsTrigger
        class="bg-white px-6 h-11 flex-1 flex items-center justify-center text-sm hover:text-blue-500 data-[state=active]:text-blue-500 transition-colors leading-none text-blue-500 select-none rounded-tl-md outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-neutral-400"
        value="signin"
      >
        Sign In
      </TabsTrigger>
      <TabsTrigger
        class="bg-white px-6 h-11 flex-1 flex items-center justify-center text-sm hover:text-blue-500 data-[state=active]:text-blue-500 transition-colors leading-none text-blue-500 select-none rounded-tr-md outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-neutral-400"
        value="signup"
      >
        Sign Up
      </TabsTrigger>
    </TabsList>

    <TabsContent class="grow p-5 bg-white rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-neutral-400" value="signin">
      <form class="flex flex-col gap-4" @submit.prevent="signIn">
        <label class="flex flex-col gap-2 text-neutral-800 text-sm font-medium">
          Email
          <input v-model="email" class="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="email" placeholder="Email">
        </label>
        <label class="flex flex-col gap-2 text-neutral-800 text-sm font-medium">
          Password
          <input v-model="password" class="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="password" placeholder="Password">
        </label>

        <!-- Sign In Error Message -->
        <div v-if="signInError" class="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {{ signInError }}
        </div>

        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!email || !password || loading"
        >
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          @click="auth.signIn.social({ provider: 'github', callbackURL: '/courses/spanish' })"
        >
          <div class="i-carbon:logo-github" />
          Sign In with Github
        </button>
      </form>
    </TabsContent>

    <TabsContent class="grow p-5 bg-white rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-neutral-400" value="signup">
      <form class="flex flex-col gap-4" @submit.prevent="signUp">
        <label class="flex flex-col gap-2 text-neutral-800 text-sm font-medium">
          Email
          <input v-model="email" class="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="email" placeholder="Email">
        </label>
        <label class="flex flex-col gap-2 text-neutral-800 text-sm font-medium">
          Password
          <input v-model="password" class="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="password" placeholder="Password">
        </label>
        <label class="flex flex-col gap-2 text-neutral-800 text-sm font-medium">
          Name
          <input v-model="name" class="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="name" placeholder="Name">
        </label>

        <!-- Sign Up Error Message -->
        <div v-if="signUpError" class="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {{ signUpError }}
        </div>

        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="loading"
        >
          {{ loading ? 'Signing Up...' : 'Sign Up' }}
        </button>
      </form>
    </TabsContent>
  </TabsRoot>
</template>
