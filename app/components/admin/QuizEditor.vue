<script setup lang="ts">
import { Plus, Trash2, GripVertical, Save, HelpCircle } from 'lucide-vue-next'

interface Question {
  id: string
  questionText: string
  options: string[]
  correctOption: number
  order: number
}

interface Quiz {
  id: string
  lessonId: string
  passingScore: number
  maxRetries: number
  questions: Question[]
}

interface Props {
  lessonId: string
}

const props = defineProps<Props>()
const { error: showError, success: showSuccess } = useToast()

// Fetch quiz data
const { data, refresh } = await useFetch<{ quiz: Quiz | null }>(`/api/admin/lessons/${props.lessonId}/quiz`)

const quiz = computed(() => data.value?.quiz)
const hasQuiz = computed(() => !!quiz.value)

// Settings form
const settings = reactive({
  passingScore: 70,
  maxRetries: 3,
})

// Initialize settings when quiz loads
watch(quiz, (q) => {
  if (q) {
    settings.passingScore = q.passingScore
    settings.maxRetries = q.maxRetries
  }
}, { immediate: true })

// New question form
const newQuestion = reactive({
  questionText: '',
  options: ['', ''],
  correctOption: 0,
})

const isCreatingQuiz = ref(false)
const isSavingSettings = ref(false)
const isAddingQuestion = ref(false)
const deletingQuestionId = ref<string | null>(null)

// Create quiz
async function createQuiz() {
  isCreatingQuiz.value = true
  try {
    await $fetch(`/api/admin/lessons/${props.lessonId}/quiz`, {
      method: 'POST',
      body: {
        passingScore: settings.passingScore,
        maxRetries: settings.maxRetries,
      },
    })
    showSuccess('Utworzono', 'Quiz został utworzony')
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się utworzyć quizu')
  } finally {
    isCreatingQuiz.value = false
  }
}

// Save settings
async function saveSettings() {
  if (!quiz.value) return

  isSavingSettings.value = true
  try {
    await $fetch(`/api/admin/lessons/${props.lessonId}/quiz`, {
      method: 'PUT',
      body: {
        passingScore: settings.passingScore,
        maxRetries: settings.maxRetries,
      },
    })
    showSuccess('Zapisano', 'Ustawienia quizu zostały zapisane')
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się zapisać ustawień')
  } finally {
    isSavingSettings.value = false
  }
}

// Add option
function addOption() {
  if (newQuestion.options.length < 6) {
    newQuestion.options.push('')
  }
}

// Remove option
function removeOption(index: number) {
  if (newQuestion.options.length > 2) {
    newQuestion.options.splice(index, 1)
    if (newQuestion.correctOption >= index && newQuestion.correctOption > 0) {
      newQuestion.correctOption--
    }
  }
}

// Add question
async function addQuestion() {
  if (!quiz.value) return
  if (!newQuestion.questionText.trim()) {
    showError('Błąd', 'Treść pytania jest wymagana')
    return
  }

  const validOptions = newQuestion.options.filter(o => o.trim())
  if (validOptions.length < 2) {
    showError('Błąd', 'Wymagane są minimum 2 opcje')
    return
  }

  isAddingQuestion.value = true
  try {
    await $fetch(`/api/admin/quiz-questions/${props.lessonId}`, {
      method: 'POST',
      body: {
        questionText: newQuestion.questionText.trim(),
        options: validOptions,
        correctOption: newQuestion.correctOption,
      },
    })
    showSuccess('Dodano', 'Pytanie zostało dodane')
    // Reset form
    newQuestion.questionText = ''
    newQuestion.options = ['', '']
    newQuestion.correctOption = 0
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się dodać pytania')
  } finally {
    isAddingQuestion.value = false
  }
}

// Delete question
async function deleteQuestion(questionId: string) {
  if (deletingQuestionId.value) return

  deletingQuestionId.value = questionId
  try {
    await $fetch(`/api/admin/questions/${questionId}`, {
      method: 'DELETE',
    })
    showSuccess('Usunięto', 'Pytanie zostało usunięte')
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się usunąć pytania')
  } finally {
    deletingQuestionId.value = null
  }
}

// Delete quiz
const isDeletingQuiz = ref(false)

async function deleteQuiz() {
  if (!confirm('Czy na pewno chcesz usunąć quiz? Ta operacja jest nieodwracalna.')) return

  isDeletingQuiz.value = true
  try {
    await $fetch(`/api/admin/lessons/${props.lessonId}/quiz`, {
      method: 'DELETE',
    })
    showSuccess('Usunięto', 'Quiz został usunięty')
    await refresh()
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się usunąć quizu')
  } finally {
    isDeletingQuiz.value = false
  }
}
</script>

<template>
  <UiCard>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium text-slate-900">Quiz</h2>
      <button
        v-if="hasQuiz"
        class="text-sm text-red-600 hover:text-red-700"
        :disabled="isDeletingQuiz"
        @click="deleteQuiz"
      >
        {{ isDeletingQuiz ? 'Usuwanie...' : 'Usuń quiz' }}
      </button>
    </div>

    <!-- No quiz yet -->
    <div v-if="!hasQuiz" class="text-center py-8">
      <HelpCircle class="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p class="text-slate-500 mb-4">Ta lekcja nie ma jeszcze quizu</p>

      <div class="max-w-xs mx-auto space-y-3 mb-4">
        <div>
          <label class="block text-sm text-slate-600 mb-1">Próg zaliczenia (%)</label>
          <input
            v-model.number="settings.passingScore"
            type="number"
            min="0"
            max="100"
            class="input-base text-center"
          />
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Limit prób (0 = bez limitu)</label>
          <input
            v-model.number="settings.maxRetries"
            type="number"
            min="0"
            class="input-base text-center"
          />
        </div>
      </div>

      <UiButton variant="primary" :disabled="isCreatingQuiz" @click="createQuiz">
        <Plus class="w-4 h-4" />
        {{ isCreatingQuiz ? 'Tworzenie...' : 'Utwórz quiz' }}
      </UiButton>
    </div>

    <!-- Quiz exists -->
    <template v-else-if="quiz">
      <!-- Settings -->
      <div class="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Próg zaliczenia (%)</label>
          <input
            v-model.number="settings.passingScore"
            type="number"
            min="0"
            max="100"
            class="input-base"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Limit prób</label>
          <input
            v-model.number="settings.maxRetries"
            type="number"
            min="0"
            class="input-base"
          />
          <p class="text-xs text-slate-500 mt-1">0 = bez limitu</p>
        </div>
        <div class="col-span-2">
          <UiButton
            variant="secondary"
            size="sm"
            :disabled="isSavingSettings"
            @click="saveSettings"
          >
            <Save class="w-4 h-4" />
            {{ isSavingSettings ? 'Zapisywanie...' : 'Zapisz ustawienia' }}
          </UiButton>
        </div>
      </div>

      <!-- Questions list -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-slate-700 mb-3">
          Pytania ({{ quiz.questions.length }})
        </h3>

        <div v-if="quiz.questions.length === 0" class="text-sm text-slate-500 py-4 text-center">
          Brak pytań. Dodaj pierwsze pytanie poniżej.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(question, index) in quiz.questions"
            :key="question.id"
            class="p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div class="flex items-start gap-3">
              <span class="text-sm font-medium text-slate-400 mt-1">{{ index + 1 }}.</span>
              <div class="flex-1">
                <p class="font-medium text-slate-900 mb-2">{{ question.questionText }}</p>
                <ul class="text-sm space-y-1">
                  <li
                    v-for="(option, optIndex) in question.options"
                    :key="optIndex"
                    class="flex items-center gap-2"
                    :class="optIndex === question.correctOption ? 'text-green-600 font-medium' : 'text-slate-600'"
                  >
                    <span class="w-5 h-5 rounded-full border flex items-center justify-center text-xs"
                      :class="optIndex === question.correctOption ? 'border-green-500 bg-green-100' : 'border-slate-300'"
                    >
                      {{ String.fromCharCode(65 + optIndex) }}
                    </span>
                    {{ option }}
                  </li>
                </ul>
              </div>
              <button
                class="text-slate-400 hover:text-red-600"
                :disabled="deletingQuestionId === question.id"
                @click="deleteQuestion(question.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add question form -->
      <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 class="text-sm font-medium text-slate-700 mb-3">Dodaj pytanie</h4>

        <div class="space-y-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Treść pytania</label>
            <input
              v-model="newQuestion.questionText"
              type="text"
              class="input-base"
              placeholder="Wpisz treść pytania..."
            />
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1">Opcje odpowiedzi</label>
            <div class="space-y-2">
              <div
                v-for="(_, index) in newQuestion.options"
                :key="index"
                class="flex items-center gap-2"
              >
                <input
                  type="radio"
                  :name="`correct-${lessonId}`"
                  :value="index"
                  v-model="newQuestion.correctOption"
                  class="text-primary-600"
                />
                <input
                  v-model="newQuestion.options[index]"
                  type="text"
                  class="input-base flex-1"
                  :placeholder="`Opcja ${String.fromCharCode(65 + index)}`"
                />
                <button
                  v-if="newQuestion.options.length > 2"
                  type="button"
                  class="text-slate-400 hover:text-red-600"
                  @click="removeOption(index)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              v-if="newQuestion.options.length < 6"
              type="button"
              class="mt-2 text-sm text-primary-600 hover:text-primary-700"
              @click="addOption"
            >
              + Dodaj opcję
            </button>
          </div>

          <UiButton
            variant="primary"
            size="sm"
            :disabled="isAddingQuestion"
            @click="addQuestion"
          >
            <Plus class="w-4 h-4" />
            {{ isAddingQuestion ? 'Dodawanie...' : 'Dodaj pytanie' }}
          </UiButton>
        </div>
      </div>
    </template>
  </UiCard>
</template>
