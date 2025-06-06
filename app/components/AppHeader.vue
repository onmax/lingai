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
  // Generate a simple avatar using initials with Nimiq blue
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1F6FEB&color=ffffff&size=32`
})

// Get user display name
const displayName = computed(() => {
  return user.value?.name || user.value?.email?.split('@')[0] || 'User'
})
</script>

<template>
  <header bg="white" border="b-1 border-neutral-200" px-f-sm py-f-xs relative z-10>
    <div flex="~ items-center justify-between" max-w-f-6xl mx="auto">
      <!-- Logo/Brand -->
      <div flex="~ items-center">
        <NuxtLink to="/" text="f-xl nq-blue" font="bold" hover:text="nq-600" transition-colors>
          LingAI
        </NuxtLink>
      </div>

      <!-- Right side - Auth buttons -->
      <div flex="~ items-center gap-f-lg">
        <div v-if="!loggedIn" flex="~ items-center gap-f-sm">
          <NuxtLink
            to="/"
            px-f-2xs py-f-3xs text="f-sm neutral-700 hocus:neutral-800" font-medium
            rounded-f-xs transition-colors
          >
            Sign In
          </NuxtLink>
        </div>

        <!-- Authenticated user dropdown -->
        <DropdownMenuRoot v-else>
          <DropdownMenuTrigger as-child>
            <button
              flex="~ items-center gap-f-2xs" hocus:bg="neutral-100" px-f-xs py-f-2xs rounded-full
              transition-colors outline="none reka-active:ring-2 reka-active:ring-blue-500"
            >
              <img
                :src="profilePicture"
                :alt="`${displayName}'s profile`"
                w-f-md h-f-md rounded-full
                loading="lazy"
              >
              <span text="f-sm neutral-700" font-medium>
                {{ displayName }}
              </span>
              <div
                i-tabler:chevron-down w-f-xs h-f-xs text="neutral-500"
                transition="transform"
                data-state-open:rotate-180
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuContent
              min-w-f-2xl p-f-3xs bg="white" rounded="f-md" shadow="f-lg" border="1 neutral-200"
              z-50 origin-top-right
              :side-offset="8"
              align="end"
            >
              <DropdownMenuItem as-child>
                <NuxtLink
                  to="/courses/spanish"
                  flex="~ items-center gap-f-3xs" px-f-2xs py-f-3xs text="f-sm neutral-700"
                  hover:bg="neutral-100" hocus:bg="neutral-100" transition-colors rounded-f-xs
                  outline="none reka-active:ring-2 reka-active:ring-blue-500"
                >
                  <div i-tabler:book w-f-xs h-f-xs />
                  Spanish Lessons
                </NuxtLink>
              </DropdownMenuItem>

              <DropdownMenuSeparator my-f-4xs h-px bg="neutral-200" />

              <DropdownMenuItem as-child>
                <button
                  flex="~ items-center gap-f-3xs" w="full" px-f-2xs py-f-3xs text="f-sm red-600 left"
                  hover:bg="red-50" hocus:bg="red-50" transition-colors rounded-f-xs
                  outline="none reka-active:ring-2 reka-active:ring-red-500"
                  @click="handleSignOut"
                >
                  <div i-tabler:logout w-f-xs h-f-xs />
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
