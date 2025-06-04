<script setup>
const { signOut, loggedIn } = useAuth()
const headerLinks = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'User',
    to: '/user',
  },
  {
    label: 'Secret',
    to: '/secret',
  },
  {
    label: 'About',
    to: '/about',
  },
]
const footerLinks = [
  {
    label: 'Source code',
    to: 'https://github.com/atinux/nuxthub-better-auth',
    target: '_blank',
  },
  {
    label: 'NuxtHub',
    to: 'https://hub.nuxt.com',
    target: '_blank',
  },
  {
    label: 'Better Auth',
    to: 'https://better-auth.com',
    target: '_blank',
  }
]
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />
   <NuxtLayout />
</template>
