<script setup lang="ts">
interface Props {
  iframe?: string
  url?: string
}

const props = defineProps<Props>()

// Sanitize iframe - only allow YouTube and Vimeo
const sanitizedIframe = computed(() => {
  if (!props.iframe) return null

  // Parse the iframe to extract src
  const srcMatch = props.iframe.match(/src=["']([^"']+)["']/)
  if (!srcMatch) return null

  const src = srcMatch[1]

  // Only allow trusted domains
  const allowedDomains = [
    'youtube.com',
    'www.youtube.com',
    'youtube-nocookie.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
    'vimeo.com',
  ]

  try {
    const url = new URL(src)
    const isAllowed = allowedDomains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain))

    if (!isAllowed) {
      console.warn('Blocked iframe from untrusted domain:', url.hostname)
      return null
    }

    // Return sanitized iframe with safe attributes
    return `<iframe src="${src}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
  } catch {
    return null
  }
})

// Generate iframe from URL if no custom iframe provided
const generatedIframe = computed(() => {
  if (sanitizedIframe.value) return null
  if (!props.url) return null

  // YouTube
  const youtubeMatch = props.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    return `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
  }

  // Vimeo
  const vimeoMatch = props.url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" class="w-full h-full" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
  }

  return null
})

const displayIframe = computed(() => sanitizedIframe.value || generatedIframe.value)
</script>

<template>
  <div v-if="displayIframe" class="aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-lg">
    <div v-html="displayIframe" class="w-full h-full" />
  </div>
  <div v-else-if="url || iframe" class="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
    <p class="text-slate-500">Nie można wyświetlić video</p>
  </div>
</template>
