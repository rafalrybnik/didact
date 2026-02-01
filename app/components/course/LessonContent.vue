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
      class="lesson-content prose prose-slate max-w-none prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-600 prose-a:text-primary-600 prose-img:rounded-lg"
      v-html="contentHtml"
    />
  </article>
</template>

<style scoped>
/* Table styling for rendered content */
.lesson-content :deep(table) {
  border-collapse: collapse;
  margin: 1rem 0;
  width: 100%;
  overflow-x: auto;
  display: block;
}

.lesson-content :deep(table td),
.lesson-content :deep(table th) {
  border: 1px solid #cbd5e1;
  padding: 0.75rem;
  text-align: left;
}

.lesson-content :deep(table th) {
  background-color: #f1f5f9;
  font-weight: 600;
}

.lesson-content :deep(table tr:hover) {
  background-color: #f8fafc;
}

/* Highlight styling */
.lesson-content :deep(mark) {
  background-color: #fef08a;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

/* YouTube embed styling */
.lesson-content :deep(div[data-youtube-video]) {
  margin: 1.5rem 0;
}

.lesson-content :deep(div[data-youtube-video] iframe) {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
}

/* Image styling */
.lesson-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* Blockquote styling */
.lesson-content :deep(blockquote) {
  border-left: 4px solid #e2e8f0;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #64748b;
  font-style: italic;
}

/* Code styling */
.lesson-content :deep(code) {
  background-color: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
}

/* Code block styling */
.lesson-content :deep(pre) {
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.lesson-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}
</style>
