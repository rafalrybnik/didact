<script setup lang="ts">
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-vue-next'

interface Question {
  id: string
  questionText: string
  options: string[]
  order: number
}

interface QuizData {
  id: string
  lessonId: string
  passingScore: number
  maxRetries: number
  questions: Question[]
}

interface Attempts {
  count: number
  bestScore: number | null
  hasPassed: boolean
  canRetry: boolean
  remaining: number | null
}

interface QuizResult {
  questionId: string
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
}

interface Props {
  quiz: QuizData
  attempts: Attempts
  courseSlug: string
  lessonId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'completed', passed: boolean): void
}>()

const { error: showError, success: showSuccess } = useToast()

// State
const currentQuestionIndex = ref(0)
const answers = ref<(number | null)[]>([])
const isSubmitting = ref(false)
const showResults = ref(false)
const result = ref<{
  score: number
  passed: boolean
  results: QuizResult[]
} | null>(null)
const canRetry = ref(props.attempts.canRetry)
const remaining = ref(props.attempts.remaining)

// Initialize answers array
onMounted(() => {
  answers.value = new Array(props.quiz.questions.length).fill(null)
})

// Computed
const currentQuestion = computed(() => props.quiz.questions[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === props.quiz.questions.length - 1)
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)
const allAnswered = computed(() => answers.value.every(a => a !== null))
const progress = computed(() => {
  const answered = answers.value.filter(a => a !== null).length
  return Math.round((answered / props.quiz.questions.length) * 100)
})

// Methods
function selectAnswer(optionIndex: number) {
  if (showResults.value) return
  answers.value[currentQuestionIndex.value] = optionIndex
}

function nextQuestion() {
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
  }
}

function prevQuestion() {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
  }
}

function goToQuestion(index: number) {
  currentQuestionIndex.value = index
}

async function submitQuiz() {
  if (!allAnswered.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const response = await $fetch<{
      attempt: { score: number; passed: boolean; results: QuizResult[] }
      canRetry: boolean
      remaining: number | null
    }>(`/api/courses/${props.courseSlug}/lessons/${props.lessonId}/quiz/submit`, {
      method: 'POST',
      body: { answers: answers.value },
    })

    result.value = response.attempt
    canRetry.value = response.canRetry
    remaining.value = response.remaining
    showResults.value = true

    if (response.attempt.passed) {
      showSuccess('Gratulacje!', 'Zdałeś quiz!')
      emit('completed', true)
    } else {
      showError('Nie zdałeś', `Wynik: ${response.attempt.score}%. Wymagane: ${props.quiz.passingScore}%`)
    }
  } catch (e: any) {
    showError('Błąd', e.data?.message || 'Nie udało się wysłać odpowiedzi')
  } finally {
    isSubmitting.value = false
  }
}

function retryQuiz() {
  answers.value = new Array(props.quiz.questions.length).fill(null)
  currentQuestionIndex.value = 0
  showResults.value = false
  result.value = null
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-slate-900">Quiz</h3>
        <div class="text-sm text-slate-500">
          {{ quiz.questions.length }} pytań
          <span v-if="quiz.maxRetries > 0">• Max {{ quiz.maxRetries }} prób</span>
        </div>
      </div>
      <div class="mt-2 text-sm text-slate-600">
        Wymagane: {{ quiz.passingScore }}% poprawnych odpowiedzi
      </div>
    </div>

    <!-- Previous attempts info -->
    <div v-if="attempts.count > 0 && !showResults" class="px-6 py-3 bg-slate-100 border-b border-slate-200">
      <div class="flex items-center gap-4 text-sm">
        <span class="text-slate-600">
          Poprzednie próby: {{ attempts.count }}
        </span>
        <span v-if="attempts.bestScore !== null" class="text-slate-600">
          Najlepszy wynik: {{ attempts.bestScore }}%
        </span>
        <span v-if="attempts.hasPassed" class="flex items-center gap-1 text-green-600">
          <CheckCircle class="w-4 h-4" />
          Zaliczony
        </span>
      </div>
    </div>

    <!-- Results view -->
    <div v-if="showResults && result" class="p-6">
      <div class="text-center mb-6">
        <div
          class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          :class="result.passed ? 'bg-green-100' : 'bg-red-100'"
        >
          <component
            :is="result.passed ? CheckCircle : XCircle"
            class="w-10 h-10"
            :class="result.passed ? 'text-green-600' : 'text-red-600'"
          />
        </div>
        <h4 class="text-2xl font-bold" :class="result.passed ? 'text-green-600' : 'text-red-600'">
          {{ result.score }}%
        </h4>
        <p class="text-slate-600 mt-1">
          {{ result.passed ? 'Quiz zaliczony!' : 'Quiz niezaliczony' }}
        </p>
      </div>

      <!-- Results list -->
      <div class="space-y-4 mb-6">
        <div
          v-for="(question, index) in quiz.questions"
          :key="question.id"
          class="p-4 rounded-lg border"
          :class="result.results[index].isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
        >
          <div class="flex items-start gap-3">
            <component
              :is="result.results[index].isCorrect ? CheckCircle : XCircle"
              class="w-5 h-5 mt-0.5 flex-shrink-0"
              :class="result.results[index].isCorrect ? 'text-green-600' : 'text-red-600'"
            />
            <div class="flex-1">
              <p class="font-medium text-slate-900">{{ question.questionText }}</p>
              <p class="text-sm mt-1">
                <span class="text-slate-500">Twoja odpowiedź:</span>
                <span :class="result.results[index].isCorrect ? 'text-green-700' : 'text-red-700'">
                  {{ question.options[result.results[index].userAnswer] }}
                </span>
              </p>
              <p v-if="!result.results[index].isCorrect" class="text-sm mt-1">
                <span class="text-slate-500">Poprawna odpowiedź:</span>
                <span class="text-green-700">
                  {{ question.options[result.results[index].correctAnswer] }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Retry button -->
      <div v-if="canRetry && !result.passed" class="text-center">
        <UiButton variant="primary" @click="retryQuiz">
          <RefreshCw class="w-4 h-4" />
          Spróbuj ponownie
          <span v-if="remaining !== null" class="text-sm opacity-75">
            (pozostało {{ remaining }})
          </span>
        </UiButton>
      </div>
    </div>

    <!-- Quiz view -->
    <div v-else class="p-6">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex justify-between text-sm text-slate-500 mb-2">
          <span>Postęp</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary-500 transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Question navigation dots -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="(_, index) in quiz.questions"
          :key="index"
          class="w-8 h-8 rounded-full text-sm font-medium transition-colors"
          :class="[
            index === currentQuestionIndex
              ? 'bg-primary-500 text-white'
              : answers[index] !== null
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
          @click="goToQuestion(index)"
        >
          {{ index + 1 }}
        </button>
      </div>

      <!-- Question -->
      <div class="mb-6">
        <p class="text-lg font-medium text-slate-900 mb-4">
          {{ currentQuestion.questionText }}
        </p>

        <div class="space-y-3">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="w-full text-left p-4 rounded-lg border-2 transition-all"
            :class="
              answers[currentQuestionIndex] === index
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
            "
            @click="selectAnswer(index)"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                :class="
                  answers[currentQuestionIndex] === index
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-slate-300'
                "
              >
                <div
                  v-if="answers[currentQuestionIndex] === index"
                  class="w-2 h-2 rounded-full bg-white"
                />
              </div>
              <span class="text-slate-700">{{ option }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <UiButton
          v-if="!isFirstQuestion"
          variant="secondary"
          @click="prevQuestion"
        >
          Poprzednie
        </UiButton>
        <div v-else />

        <UiButton
          v-if="!isLastQuestion"
          variant="secondary"
          @click="nextQuestion"
        >
          Następne
        </UiButton>
        <UiButton
          v-else
          variant="primary"
          :disabled="!allAnswered || isSubmitting"
          @click="submitQuiz"
        >
          {{ isSubmitting ? 'Wysyłanie...' : 'Zakończ quiz' }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
