<script setup lang="ts">
interface Props {
  completed: number
  total: number
  percentage: number
  showLabel?: boolean
}

withDefaults(defineProps<Props>(), {
  showLabel: true,
})
</script>

<template>
  <div>
    <div v-if="showLabel" class="flex justify-between text-sm text-slate-600 mb-1">
      <span>Postęp kursu</span>
      <span>{{ percentage }}% ({{ completed }}/{{ total }} lekcji)</span>
    </div>
    <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        class="h-full bg-primary-600 transition-all duration-500 ease-out"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
