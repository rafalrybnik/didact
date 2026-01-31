<script setup lang="ts">
interface Props {
  variant?: 'default' | 'draft' | 'published' | 'completed' | 'pending' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClasses = {
  default: 'bg-slate-100 text-slate-700',
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-green-100 text-green-700',
  completed: 'bg-primary-100 text-primary-700',
  pending: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
    ]"
  >
    <slot />
  </span>
</template>
