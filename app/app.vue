<script setup>
const { signOut: _signOut, loggedIn: _loggedIn } = useAuth()
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
