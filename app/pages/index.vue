<script setup lang="ts">
definePageMeta({
  auth: {
    only: 'guest',
    redirectUserTo: '/user',
  },
})

const auth = useAuth()

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
    await navigateTo('/user')
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
    await navigateTo('/user')
  }
  loading.value = false
}
</script>

<template>
  <TabsRoot
    class="flex flex-col w-full max-w-md mx-auto shadow-sm rounded-lg border"
    default-value="signin"
  >
    <TabsList
      class="relative shrink-0 flex border-b border-mauve6"
      aria-label="Sign in or sign up"
    >
      <TabsIndicator class="absolute px-8 left-0 h-[2px] bottom-0 w-[--reka-tabs-indicator-size] translate-x-[--reka-tabs-indicator-position] translate-y-[1px] rounded-full transition-[width,transform] duration-300">
        <div class="bg-grass8 w-full h-full" />
      </TabsIndicator>
      <TabsTrigger
        class="bg-white px-5 h-[45px] flex-1 flex items-center justify-center f-text-sm leading-none text-mauve11 select-none rounded-tl-md hover:text-grass11 data-[state=active]:text-grass11 outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-black"
        value="signin"
      >
        Sign In
      </TabsTrigger>
      <TabsTrigger
        class="bg-white px-5 h-[45px] flex-1 flex items-center justify-center f-text-sm leading-none text-mauve11 select-none rounded-tr-md hover:text-grass11 data-[state=active]:text-grass11 outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-black"
        value="signup"
      >
        Sign Up
      </TabsTrigger>
    </TabsList>

    <TabsContent
      class="grow p-5 bg-white rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
      value="signin"
    >
      <form class="flex flex-col gap-4" @submit.prevent="signIn">
        <UFormGroup label="Email" required>
          <UInput v-model="email" type="email" placeholder="Email" />
        </UFormGroup>
        <UFormGroup label="Password" required>
          <UInput v-model="password" type="password" placeholder="Password" />
        </UFormGroup>
        <button
          type="submit"
          nq-pill-blue
          nq-arrow
          :disabled="!email || !password || loading"
        >
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>
        <button flex="~ items-center gap-6"
          type="button"
          nq-pill-blue
          nq-arrow
          @click="auth.signIn.social({ provider: 'github', callbackURL: '/user' })"
        >
          <div i-nimiq:logos-github-mono />
          Sign In with Github
        </button>
      </form>
    </TabsContent>

    <TabsContent
      class="grow p-5 bg-white rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
      value="signup"
    >
      <form class="flex flex-col gap-4" @submit.prevent="signUp">
        <UFormGroup label="Email" required>
          <UInput v-model="email" type="email" placeholder="Email" />
        </UFormGroup>
        <UFormGroup label="Password" required>
          <UInput v-model="password" type="password" placeholder="Password" />
        </UFormGroup>
        <UFormGroup label="Name">
          <UInput v-model="name" type="name" placeholder="Name" />
        </UFormGroup>
        <button
          type="submit"
          nq-pill-blue
          nq-arrow
          :disabled="loading"
        >
          {{ loading ? 'Signing Up...' : 'Sign Up' }}
        </button>
      </form>
    </TabsContent>
  </TabsRoot>
</template>
