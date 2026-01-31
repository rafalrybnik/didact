<script setup lang="ts">
interface Props {
  title: string
  contentHtml?: string
  videoUrl?: string
  videoIframe?: string
}

defineProps<Props>()
</script>

<template>
  <article class="max-w-4xl mx-auto">
    <!-- Title -->
    <h1 class="text-3xl font-bold text-slate-900 mb-6">{{ title }}</h1>

    <!-- Video -->
    <div v-if="videoUrl || videoIframe" class="mb-8">
      <CourseVideoEmbed :url="videoUrl" :iframe="videoIframe" />
    </div>

    <!-- Content -->
    <div
      v-if="contentHtml"
      class="prose prose-slate max-w-none prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-600 prose-a:text-primary-600 prose-img:rounded-lg"
      v-html="contentHtml"
    />
  </article>
</template>
