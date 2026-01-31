<script setup lang="ts">
interface Props {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
  padding: 'md',
})

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
}
</script>

<template>
  <div
    :class="[
      'bg-white rounded-lg shadow-card border border-slate-200/60',
      hover && 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
      paddingClasses[padding],
    ]"
  >
    <slot />
  </div>
</template>
