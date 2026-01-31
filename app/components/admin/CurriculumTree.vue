<script setup lang="ts">
import { GripVertical, Plus, Pencil, Trash2, FileText, FolderOpen, ChevronDown, ChevronRight } from 'lucide-vue-next'

interface Lesson {
  id: string
  title: string
  order: number
  moduleId: string | null
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface Props {
  courseId: string
  modules: Module[]
  standaloneLessons: Lesson[]
  structureMode: 'MODULAR' | 'FLAT' | 'FREESTYLE'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-module': []
  'edit-module': [moduleId: string]
  'delete-module': [moduleId: string]
  'add-lesson': [moduleId: string | null]
  'edit-lesson': [lessonId: string]
  'delete-lesson': [lessonId: string]
  'reorder': [type: 'module' | 'lesson', items: { id: string; order: number; moduleId?: string | null }[]]
}>()

const expandedModules = ref<Set<string>>(new Set())

// Expand all modules by default
onMounted(() => {
  props.modules.forEach(m => expandedModules.value.add(m.id))
})

function toggleModule(moduleId: string) {
  if (expandedModules.value.has(moduleId)) {
    expandedModules.value.delete(moduleId)
  } else {
    expandedModules.value.add(moduleId)
  }
}

// Drag state
const draggedItem = ref<{ type: 'module' | 'lesson'; id: string; moduleId?: string | null } | null>(null)
const dragOverItem = ref<{ type: 'module' | 'lesson'; id: string; position: 'before' | 'after' } | null>(null)

function onDragStart(e: DragEvent, type: 'module' | 'lesson', id: string, moduleId?: string | null) {
  draggedItem.value = { type, id, moduleId }
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}

function onDragOver(e: DragEvent, type: 'module' | 'lesson', id: string) {
  e.preventDefault()
  if (!draggedItem.value) return

  // Only allow same-type dragging for now
  if (draggedItem.value.type !== type) return
  if (draggedItem.value.id === id) return

  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const midY = rect.top + rect.height / 2
  const position = e.clientY < midY ? 'before' : 'after'

  dragOverItem.value = { type, id, position }
}

function onDragLeave() {
  dragOverItem.value = null
}

function onDrop(e: DragEvent, type: 'module' | 'lesson', targetId: string, targetModuleId?: string | null) {
  e.preventDefault()
  if (!draggedItem.value || !dragOverItem.value) return
  if (draggedItem.value.type !== type) return
  if (draggedItem.value.id === targetId) return

  if (type === 'module') {
    reorderModules(draggedItem.value.id, targetId, dragOverItem.value.position)
  } else {
    reorderLessons(draggedItem.value.id, targetId, dragOverItem.value.position, targetModuleId)
  }

  draggedItem.value = null
  dragOverItem.value = null
}

function onDragEnd() {
  draggedItem.value = null
  dragOverItem.value = null
}

function reorderModules(draggedId: string, targetId: string, position: 'before' | 'after') {
  const modules = [...props.modules].sort((a, b) => a.order - b.order)
  const draggedIndex = modules.findIndex(m => m.id === draggedId)
  const targetIndex = modules.findIndex(m => m.id === targetId)

  if (draggedIndex === -1 || targetIndex === -1) return

  // Remove dragged item
  const [dragged] = modules.splice(draggedIndex, 1)

  // Find new target index after removal
  let newTargetIndex = modules.findIndex(m => m.id === targetId)
  if (position === 'after') newTargetIndex++

  // Insert at new position
  modules.splice(newTargetIndex, 0, dragged)

  // Emit reorder with new orders
  const items = modules.map((m, i) => ({ id: m.id, order: i }))
  emit('reorder', 'module', items)
}

function reorderLessons(draggedId: string, targetId: string, position: 'before' | 'after', targetModuleId?: string | null) {
  // Get all lessons in the target module (or standalone)
  let lessons: Lesson[]
  if (targetModuleId) {
    const module = props.modules.find(m => m.id === targetModuleId)
    if (!module) return
    lessons = [...module.lessons].sort((a, b) => a.order - b.order)
  } else {
    lessons = [...props.standaloneLessons].sort((a, b) => a.order - b.order)
  }

  const draggedIndex = lessons.findIndex(l => l.id === draggedId)
  const targetIndex = lessons.findIndex(l => l.id === targetId)

  if (draggedIndex === -1 || targetIndex === -1) return

  // Remove dragged item
  const [dragged] = lessons.splice(draggedIndex, 1)

  // Find new target index after removal
  let newTargetIndex = lessons.findIndex(l => l.id === targetId)
  if (position === 'after') newTargetIndex++

  // Insert at new position
  lessons.splice(newTargetIndex, 0, dragged)

  // Emit reorder with new orders
  const items = lessons.map((l, i) => ({ id: l.id, order: i, moduleId: targetModuleId }))
  emit('reorder', 'lesson', items)
}

function getDragClass(type: 'module' | 'lesson', id: string) {
  if (!dragOverItem.value) return ''
  if (dragOverItem.value.type !== type || dragOverItem.value.id !== id) return ''

  return dragOverItem.value.position === 'before'
    ? 'border-t-2 border-t-primary-500'
    : 'border-b-2 border-b-primary-500'
}
</script>

<template>
  <div class="space-y-2">
    <!-- Header with add buttons -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-slate-700">Program kursu</h3>
      <div class="flex items-center gap-2">
        <UiButton
          v-if="structureMode !== 'FLAT'"
          variant="secondary"
          size="sm"
          @click="emit('add-module')"
        >
          <Plus class="h-4 w-4" />
          Moduł
        </UiButton>
        <UiButton
          variant="secondary"
          size="sm"
          @click="emit('add-lesson', null)"
        >
          <Plus class="h-4 w-4" />
          Lekcja
        </UiButton>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="modules.length === 0 && standaloneLessons.length === 0"
      class="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg"
    >
      <FileText class="h-8 w-8 mx-auto mb-2 text-slate-400" />
      <p>Brak zawartości kursu</p>
      <p class="text-sm">Dodaj moduły lub lekcje, aby zbudować program kursu</p>
    </div>

    <!-- Modules -->
    <div v-if="structureMode !== 'FLAT'" class="space-y-2">
      <div
        v-for="module in [...modules].sort((a, b) => a.order - b.order)"
        :key="module.id"
        class="border border-slate-200 rounded-lg bg-white transition-all"
        :class="[
          getDragClass('module', module.id),
          draggedItem?.type === 'module' && draggedItem?.id === module.id ? 'opacity-50' : ''
        ]"
        draggable="true"
        @dragstart="onDragStart($event, 'module', module.id)"
        @dragover="onDragOver($event, 'module', module.id)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, 'module', module.id)"
        @dragend="onDragEnd"
      >
        <!-- Module header -->
        <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-t-lg border-b border-slate-200">
          <GripVertical class="h-4 w-4 text-slate-400 cursor-grab" />
          <button
            class="p-1 hover:bg-slate-200 rounded"
            @click="toggleModule(module.id)"
          >
            <ChevronDown v-if="expandedModules.has(module.id)" class="h-4 w-4 text-slate-500" />
            <ChevronRight v-else class="h-4 w-4 text-slate-500" />
          </button>
          <FolderOpen class="h-4 w-4 text-slate-500" />
          <span class="flex-1 font-medium text-slate-700">{{ module.title }}</span>
          <span class="text-xs text-slate-500">{{ module.lessons.length }} lekcji</span>
          <button
            class="p-1 hover:bg-slate-200 rounded"
            @click="emit('edit-module', module.id)"
          >
            <Pencil class="h-4 w-4 text-slate-500" />
          </button>
          <button
            class="p-1 hover:bg-red-100 rounded"
            @click="emit('delete-module', module.id)"
          >
            <Trash2 class="h-4 w-4 text-red-500" />
          </button>
        </div>

        <!-- Module lessons -->
        <div v-if="expandedModules.has(module.id)" class="p-2 space-y-1">
          <div
            v-for="lesson in [...module.lessons].sort((a, b) => a.order - b.order)"
            :key="lesson.id"
            class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded hover:border-slate-300 transition-all cursor-pointer"
            :class="[
              getDragClass('lesson', lesson.id),
              draggedItem?.type === 'lesson' && draggedItem?.id === lesson.id ? 'opacity-50' : ''
            ]"
            draggable="true"
            @dragstart.stop="onDragStart($event, 'lesson', lesson.id, module.id)"
            @dragover.stop="onDragOver($event, 'lesson', lesson.id)"
            @dragleave="onDragLeave"
            @drop.stop="onDrop($event, 'lesson', lesson.id, module.id)"
            @dragend="onDragEnd"
            @click="emit('edit-lesson', lesson.id)"
          >
            <GripVertical class="h-4 w-4 text-slate-400 cursor-grab" />
            <FileText class="h-4 w-4 text-slate-400" />
            <span class="flex-1 text-sm text-slate-700">{{ lesson.title }}</span>
            <button
              class="p-1 hover:bg-red-100 rounded"
              @click.stop="emit('delete-lesson', lesson.id)"
            >
              <Trash2 class="h-3 w-3 text-red-500" />
            </button>
          </div>

          <!-- Add lesson to module -->
          <button
            class="flex items-center gap-2 px-3 py-2 w-full text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
            @click="emit('add-lesson', module.id)"
          >
            <Plus class="h-4 w-4" />
            Dodaj lekcję
          </button>
        </div>
      </div>
    </div>

    <!-- Standalone lessons (FLAT mode or lessons without module) -->
    <div v-if="standaloneLessons.length > 0 || structureMode === 'FLAT'" class="space-y-1">
      <p v-if="structureMode !== 'FLAT' && modules.length > 0" class="text-xs text-slate-500 mt-4 mb-2">
        Lekcje bez modułu
      </p>
      <div
        v-for="lesson in [...standaloneLessons].sort((a, b) => a.order - b.order)"
        :key="lesson.id"
        class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all cursor-pointer"
        :class="[
          getDragClass('lesson', lesson.id),
          draggedItem?.type === 'lesson' && draggedItem?.id === lesson.id ? 'opacity-50' : ''
        ]"
        draggable="true"
        @dragstart="onDragStart($event, 'lesson', lesson.id, null)"
        @dragover="onDragOver($event, 'lesson', lesson.id)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, 'lesson', lesson.id, null)"
        @dragend="onDragEnd"
        @click="emit('edit-lesson', lesson.id)"
      >
        <GripVertical class="h-4 w-4 text-slate-400 cursor-grab" />
        <FileText class="h-4 w-4 text-slate-400" />
        <span class="flex-1 text-slate-700">{{ lesson.title }}</span>
        <button
          class="p-1 hover:bg-red-100 rounded"
          @click.stop="emit('delete-lesson', lesson.id)"
        >
          <Trash2 class="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  </div>
</template>
