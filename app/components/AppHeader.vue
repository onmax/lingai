<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui'

// Auth composable for authentication state and methods
const { user, loggedIn, signOut } = useAuth()

// Handle sign out
async function handleSignOut() {
  await signOut({ redirectTo: '/' })
}

// Profile picture generation based on user name or email
const profilePicture = computed(() => {
  if (!user.value)
    return ''

  const name = user.value.name || user.value.email || 'User'
  // Generate a simple avatar using initials with blue background
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1F6FEB&color=ffffff&size=32`
})

// Get user display name
const displayName = computed(() => {
  return user.value?.name || user.value?.email?.split('@')[0] || 'User'
})
</script>

<template>
  <header class="bg-white border-b border-neutral-200 px-4 py-2 relative z-10">
    <div class="flex items-center justify-between max-w-6xl mx-auto">
      <!-- Logo/Brand -->
      <div class="flex items-center">
        <NuxtLink to="/" class="text-xl text-blue-600 font-bold hover:text-blue-700 transition-colors">
          LingAI
        </NuxtLink>
      </div>

      <!-- Right side - Auth buttons -->
      <div class="flex items-center gap-8">
        <div v-if="!loggedIn" class="flex items-center gap-4">
          <NuxtLink
            to="/"
            class="px-2 py-1 text-sm text-neutral-700 hover:text-neutral-800 font-medium rounded transition-colors"
          >
            Sign In
          </NuxtLink>
        </div>

        <!-- Authenticated user dropdown -->
        <DropdownMenuRoot v-else>
          <DropdownMenuTrigger as-child>
            <button
              class="flex items-center gap-2 hover:bg-neutral-100 px-3 py-2 rounded-full transition-colors outline-none reka-active:ring-2 reka-active:ring-blue-500"
            >
              <img
                :src="profilePicture"
                :alt="`${displayName}'s profile`"
                class="w-8 h-8 rounded-full"
                loading="lazy"
              >
              <span class="text-sm text-neutral-700 font-medium">
                {{ displayName }}
              </span>
              <div
                class="i-tabler:chevron-down w-4 h-4 text-neutral-500 transition-transform data-state-open:rotate-180"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuContent
              class="min-w-48 p-1 bg-white rounded-md shadow-lg border border-neutral-200 z-50 origin-top-right"
              :side-offset="8"
              align="end"
            >
              <DropdownMenuItem as-child>
                <NuxtLink
                  to="/courses/spanish"
                  class="flex items-center gap-2 px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors rounded outline-none reka-active:ring-2 reka-active:ring-blue-500"
                >
                  <div class="i-tabler:book w-4 h-4" />
                  Spanish Lessons
                </NuxtLink>
              </DropdownMenuItem>

              <DropdownMenuSeparator class="my-1 h-px bg-neutral-200" />

              <DropdownMenuItem as-child>
                <button
                  class="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 text-left hover:bg-red-50 transition-colors rounded outline-none reka-active:ring-2 reka-active:ring-red-500"
                  @click="handleSignOut"
                >
                  <div class="i-tabler:logout w-4 h-4" />
                  Sign Out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
    </div>
  </header>
</template>
