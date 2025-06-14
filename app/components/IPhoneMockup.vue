<script lang="ts" setup>
interface IPhoneMockupProps {
  width?: number
  height?: number
}

const props = withDefaults(defineProps<IPhoneMockupProps>(), {
  width: 375,
  height: 812,
})

// Generate unique ID for clip paths to avoid conflicts (SSR-safe)
const uniqueId = useId()

// Calculated dimensions
const cornerRadius = computed(() => props.width * 0.15)
const bezelWidth = computed(() => props.width * 0.02)
const topBezel = computed(() => props.height * 0.06)
const bottomBezel = computed(() => props.height * 0.04)
const screenRadius = computed(() => props.width * 0.12)
const screenWidth = computed(() => props.width - (bezelWidth.value * 2))
const screenHeight = computed(() => props.height - topBezel.value - bottomBezel.value)
</script>

<template>
  <svg
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    flex="~ shrink-0"
  >
    <g :clip-path="`url(#clip-${uniqueId})`">
      <!-- Phone body -->
      <path
        :d="`M0 ${cornerRadius}C0 ${cornerRadius * 0.45} ${cornerRadius * 0.45} 0 ${cornerRadius} 0H${width - cornerRadius}C${width - cornerRadius * 0.55} 0 ${width} ${cornerRadius * 0.45} ${width} ${cornerRadius}V${height - cornerRadius}C${width} ${height - cornerRadius * 0.55} ${width - cornerRadius * 0.55} ${height} ${width - cornerRadius} ${height}H${cornerRadius}C${cornerRadius * 0.45} ${height} 0 ${height - cornerRadius * 0.55} 0 ${height - cornerRadius}V${cornerRadius}Z`"
        class="fill-neutral-900 dark:fill-neutral-100"
      />

      <!-- Inner screen area -->
      <path
        :d="`M${bezelWidth} ${topBezel}C${bezelWidth} ${topBezel - screenRadius * 0.55} ${bezelWidth + screenRadius * 0.45} ${bezelWidth} ${bezelWidth + screenRadius} ${bezelWidth}H${width - bezelWidth - screenRadius}C${width - bezelWidth - screenRadius * 0.55} ${bezelWidth} ${width - bezelWidth} ${bezelWidth + screenRadius * 0.45} ${width - bezelWidth} ${bezelWidth + screenRadius}V${height - bottomBezel - screenRadius}C${width - bezelWidth} ${height - bottomBezel - screenRadius * 0.55} ${width - bezelWidth - screenRadius * 0.55} ${height - bottomBezel} ${width - bezelWidth - screenRadius} ${height - bottomBezel}H${bezelWidth + screenRadius}C${bezelWidth + screenRadius * 0.45} ${height - bottomBezel} ${bezelWidth} ${height - bottomBezel - screenRadius * 0.55} ${bezelWidth} ${height - bottomBezel - screenRadius}V${topBezel}Z`"
        class="fill-white dark:fill-neutral-900"
      />

      <!-- Dynamic Island / Notch -->
      <rect
        :x="width / 2 - 50"
        :y="bezelWidth + 8"
        width="100"
        height="24"
        rx="12"
        class="fill-neutral-900 dark:fill-neutral-100"
      />

      <!-- Home indicator -->
      <rect
        :x="width / 2 - 66"
        :y="height - 20"
        width="132"
        height="4"
        rx="2"
        class="fill-neutral-400 dark:fill-neutral-600"
      />

      <!-- Content area -->
      <foreignObject
        :x="bezelWidth"
        :y="topBezel"
        :width="screenWidth"
        :height="screenHeight"
        :clip-path="`url(#screen-clip-${uniqueId})`"
      >
        <div class="size-full bg-white dark:bg-neutral-900">
          <slot />
        </div>
      </foreignObject>
    </g>

    <defs>
      <clipPath :id="`clip-${uniqueId}`">
        <rect
          :width="width"
          :height="height"
          :rx="cornerRadius"
        />
      </clipPath>
      <clipPath :id="`screen-clip-${uniqueId}`">
        <rect
          :width="screenWidth"
          :height="screenHeight"
          :rx="screenRadius"
        />
      </clipPath>
    </defs>
  </svg>
</template>
