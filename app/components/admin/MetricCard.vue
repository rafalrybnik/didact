<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: string | number
  icon?: Component
  trend?: {
    value: number
    isPositive: boolean
  }
}>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-card border border-slate-200/60 p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ title }}</p>
        <p class="text-2xl font-semibold text-slate-900 mt-1">{{ value }}</p>
        <p v-if="trend" class="text-sm mt-1" :class="trend.isPositive ? 'text-green-600' : 'text-red-600'">
          {{ trend.isPositive ? '+' : '' }}{{ trend.value }}%
          <span class="text-slate-500">vs poprzedni okres</span>
        </p>
      </div>
      <div v-if="icon" class="p-3 bg-primary-50 rounded-lg">
        <component :is="icon" class="h-6 w-6 text-primary-600" />
      </div>
    </div>
  </div>
</template>
