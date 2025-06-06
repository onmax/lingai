<script setup lang="ts">
// Auth composable for authentication state and methods
const { user, loggedIn, signOut } = useAuth()

// Dropdown state for profile menu
const showProfileDropdown = ref(false)

// Template ref for dropdown
const dropdownRef = ref<HTMLElement>()

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  showProfileDropdown.value = false
})

// Handle sign out
async function handleSignOut() {
  showProfileDropdown.value = false
  await signOut({ redirectTo: '/' })
}

// Profile picture generation based on user name or email
const profilePicture = computed(() => {
  if (!user.value)
    return ''

  const name = user.value.name || user.value.email || 'User'
  // Generate a simple avatar using initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=32`
})

// Get user display name
const displayName = computed(() => {
  return user.value?.name || user.value?.email?.split('@')[0] || 'User'
})
</script>

<template>
  <header bg="white" border="b neutral-200" px-4 py-3 relative z-10>
    <div flex="~ items-center justify-between" max-w-7xl mx="auto">
      <!-- Logo/Brand -->
      <div flex="~ items-center">
        <NuxtLink to="/" text="xl blue-600" font="bold" hover:text="blue-700" transition-colors>
          LingAI
        </NuxtLink>
      </div>

      <!-- Right side - Auth buttons -->
      <div flex="~ items-center gap-4">
        <div v-if="!loggedIn" flex="~ items-center gap-2">
          <NuxtLink
            to="/"
            px-4 py-2 text="sm neutral-600" font="medium"
            hover:text="neutral-900" transition-colors
          >
            Sign In
          </NuxtLink>
        </div>

        <!-- Authenticated user dropdown -->
        <div v-else relative>
          <button
            flex="~ items-center gap-2" px-3 py-2 rounded="full"
            hover:bg="neutral-100" transition-colors
            @click="showProfileDropdown = !showProfileDropdown"
          >
            <img
              :src="profilePicture"
              :alt="`${displayName}'s profile`"
              w-8 h-8 rounded="full"
              loading="lazy"
            >
            <span text="sm neutral-700" font="medium">
              {{ displayName }}
            </span>
            <div
              i-tabler:chevron-down w-4 h-4 text="neutral-500"
              :class="{ 'rotate-180': showProfileDropdown }"
              transition="transform"
            />
          </button>

          <!-- Dropdown menu -->
          <div
            v-show="showProfileDropdown"
            ref="dropdownRef"
            absolute top="full" right-0 mt-2 w-48
            bg="white" rounded="lg" shadow="lg" border="neutral-200"
            py-2 z-20
          >
            <NuxtLink
              to="/user"
              flex="~ items-center gap-2" px-4 py-2 text="sm neutral-700"
              hover:bg="neutral-100" transition-colors
              @click="showProfileDropdown = false"
            >
              <div i-tabler:user w-4 h-4 />
              Profile
            </NuxtLink>

            <hr border="neutral-200" my-1>

            <button
              flex="~ items-center gap-2" w="full" px-4 py-2 text="sm red-600 left"
              hover:bg="red-50" transition-colors
              @click="handleSignOut"
            >
              <div i-tabler:logout w-4 h-4 />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
