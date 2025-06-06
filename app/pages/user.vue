<script setup lang="ts">
// Set page meta
definePageMeta({
  middleware: 'auth',
})

// https://better-auth.vercel.app/docs/integrations/nuxt#ssr-usage
const { user, session, client } = useAuth()

// Fetch accounts and user profile data using proper Nuxt patterns
const { data: accounts } = await useAsyncData('accounts', () => client.listAccounts())

const { data: userProfile, pending: profilePending } = await useFetch('/api/user/profile', {
  default: () => ({ profile: null, topics: [], languages: [] }),
})

function hasProvider(provider: string) {
  return accounts.value?.data?.some(account => account.provider === provider)
}

const error = useRoute().query?.error
onMounted(() => {
  if (error) {
    console.error('Error linking account:', error)
  }
})

// Check if user needs onboarding
const needsOnboarding = computed(() => {
  return !userProfile.value?.profile
})

// Watch for changes and redirect to onboarding if needed
watch(needsOnboarding, (needs) => {
  if (needs && !profilePending.value) {
    navigateTo('/onboarding')
  }
}, { immediate: true })
</script>

<template>
  <div container mx="auto" px-4 py-8>
    <h1 text="3xl" font="bold" mb-8>
      User Profile
    </h1>

    <!-- User Info -->
    <div grid="~ cols-1 lg:cols-2" gap-8>
      <!-- Account Info -->
      <div bg="white" rounded="lg" shadow p-6>
        <h3 text="xl" font="bold" mb-4>
          Account Information
        </h3>
        <div space="y-4">
          <div>
            <strong>Email:</strong> {{ user?.email }}
          </div>
          <div>
            <strong>Name:</strong> {{ user?.name }}
          </div>
          <div>
            <strong>Member since:</strong> {{ user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown' }}
          </div>
        </div>

        <div mt-6>
          <h4 font="semibold" mb-2>
            Linked Accounts
          </h4>
          <button
            v-if="hasProvider('github')"
            class="nq-pill"
            bg="neutral-100" text="neutral-800"
          >
            ✓ Linked with GitHub
          </button>
          <button
            v-else
            class="nq-pill nq-arrow"
            bg="black" text="white"
            @click="client.linkSocial({ provider: 'github' })"
          >
            Link account with GitHub
          </button>
        </div>
      </div>

      <!-- Language Learning Profile -->
      <div bg="white" rounded="lg" shadow p-6>
        <h3 text="xl" font="bold" mb-4>
          Learning Profile
        </h3>

        <div v-if="userProfile?.profile" space="y-4">
          <div>
            <strong>Target Language:</strong>
            <span capitalize ml-2>{{ userProfile.profile.targetLanguage }}</span>
          </div>

          <div>
            <strong>Languages You Speak:</strong>
            <div mt-2 space="y-2">
              <div
                v-for="lang in userProfile.languages"
                :key="lang.language"
                flex="~ items-center justify-between" bg="neutral-50" p-2 rounded
              >
                <span capitalize>{{ lang.language }}</span>
                <span text="sm neutral-600" capitalize>{{ lang.level }}</span>
              </div>
            </div>
          </div>

          <div>
            <strong>Topics of Interest:</strong>
            <div mt-2 flex="~ wrap" gap-2>
              <span
                v-for="topic in userProfile.topics"
                :key="topic"
                bg="blue-100" text="blue-800 f-sm" px-2 py-1 rounded="full" capitalize
              >
                {{ topic }}
              </span>
            </div>
          </div>

          <div mt-6>
            <button
              class="nq-pill nq-arrow"
              @click="navigateTo('/onboarding')"
            >
              Update Preferences
            </button>
          </div>
        </div>

        <div v-else text="center" py-8>
          <p text="neutral-600" mb-4>
            Complete your learning profile to get started!
          </p>
          <button
            class="nq-pill nq-arrow"
            @click="navigateTo('/onboarding')"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>

    <!-- Debug Info (Development) -->
    <details mt-8>
      <summary cursor="pointer" text="f-sm neutral-500">
        Debug Info (Development)
      </summary>
      <div mt-4 space="y-4">
        <div>
          <h4 font="semibold">
            User Object:
          </h4>
          <pre bg="neutral-100" p-4 rounded text="f-xs" of="auto">{{ user }}</pre>
        </div>
        <div>
          <h4 font="semibold">
            Session Object:
          </h4>
          <pre bg="neutral-100" p-4 rounded text="f-xs" of="auto">{{ session }}</pre>
        </div>
        <div>
          <h4 font="semibold">
            User Profile:
          </h4>
          <pre bg="neutral-100" p-4 rounded text="f-xs" of="auto">{{ userProfile }}</pre>
        </div>
      </div>
    </details>
  </div>
</template>
