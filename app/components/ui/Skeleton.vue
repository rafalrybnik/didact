<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  rounded: 'md',
})

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  full: 'rounded-full',
}
</script>

<template>
  <div
    :class="[
      'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
      'bg-[length:200%_100%] animate-shimmer',
      roundedClasses[rounded],
    ]"
    :style="{
      width: width,
      height: height,
    }"
  />
</template>
