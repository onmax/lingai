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

async function signIn() {
  if (loading.value)
    return
  loading.value = true
  const { error } = await auth.signIn.email({
    email: email.value,
    password: password.value,
  })
  if (error) {
    // toast.add({
    //   title: error.message,
    //   color: 'red',
    // })
  }
  else {
    await navigateAfterLogin()
    // toast.add({
    //   title: `You have been signed in!`,
    // })
  }
  loading.value = false
}

async function signUp() {
  if (loading.value)
    return
  loading.value = true
  const { error } = await auth.signUp.email({
    email: email.value,
    password: password.value,
    name: name.value,
  })
  if (error) {
    // toast.add({
    //   title: error.message,
    //   color: 'red',
    // })
  }
  else {
    // toast.add({
    //   title: `You have been signed up!`,
    // })
    await navigateAfterLogin()
  }
  loading.value = false
}
</script>

<template>
  <TabsRoot flex="~ col " mx-auto max-w-320 shadow f-rounded-lg default-value="signin">
    <TabsList relative shrink-0 flex aria-label="Sign in or sign up">
      <TabsIndicator
        absolute px-8 left-0 h-8 bottom-0 w="$reka-tabs-indicator-size"
        translate-x="$reka-tabs-indicator-position" translate-y-1 rounded-full transition="[width,transform]"
        duration-300
      >
        <div bg-blue size-full />
      </TabsIndicator>
      <TabsTrigger
        bg-white px-24 h-45 flex="1 ~ items-center justify-center" text="f-sm hocus:blue reka-active:blue"
        transition-colors leading-none text-blue select-none rounded-tl-md outline-none cursor-default
        focus-visible:relative focus-visible:shadow="[0_0_0_2px] neutral" value="signin"
      >
        Sign In
      </TabsTrigger>
      <TabsTrigger
        bg-white px-6 h-45 flex="1 ~ items-center justify-center" text="f-sm hocus:blue reka-active:blue"
        transition-colors leading-none text-blue select-none rounded-tr-md outline-none cursor-default
        focus-visible:relative focus-visible:shadow="[0_0_0_2px] neutral" value="signup"
      >
        Sign Up
      </TabsTrigger>
    </TabsList>

    <TabsContent grow p-20 bg-white rounded-b-md outline-none focus:shadow="[0_0_0_2px] neutral" value="signin">
      <form flex="~ col gap-4" @submit.prevent="signIn">
        <label nq-label>
          Email
          <input v-model="email" nq-input-box type="email" placeholder="Email">
        </label>
        <label nq-label>
          Password
          <input v-model="password" nq-input-box type="password" placeholder="Password">
        </label>
        <button
          type="submit" nq-pill-blue nq-arrow :disabled="!email || !password || loading"
        >
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>
        <button
          type="button" nq-pill-blue nq-arrow
          @click="auth.signIn.social({ provider: 'github', callbackURL: '/courses/spanish' })"
        >
          <div i-nimiq:logos-github-mono />
          Sign In with Github
        </button>
      </form>
    </TabsContent>

    <TabsContent grow p-20 bg-white rounded-b-md outline-none focus:shadow="[0_0_0_2px] neutral" value="signup">
      <form class="flex flex-col gap-4" @submit.prevent="signUp">
        <label nq-label>
          Email
          <input v-model="email" nq-input-box type="email" placeholder="Email">
        </label>
        <label nq-label>
          Password
          <input v-model="password" nq-input-box type="password" placeholder="Password">
        </label>
        <label nq-label>
          Name
          <input v-model="name" nq-input-box type="name" placeholder="Name">
        </label>
        <button type="submit" nq-pill-blue nq-arrow :disabled="loading">
          {{ loading ? 'Signing Up...' : 'Sign Up' }}
        </button>
      </form>
    </TabsContent>
  </TabsRoot>
</template>
