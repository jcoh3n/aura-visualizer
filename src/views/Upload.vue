<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Import des fichiers</h1>
      <p class="mt-2 text-lg text-gray-600">
        Importez votre questionnaire (JSON/JS) et vos réponses (Excel) pour commencer l'analyse
      </p>
    </div>

    <!-- Progress Steps -->
    <div class="mb-8">
      <nav aria-label="Progress">
        <ol class="flex items-center">
          <li class="relative">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-full">
                <span class="text-white font-medium">1</span>
              </div>
              <span class="ml-4 text-sm font-medium text-gray-900">Import des fichiers</span>
            </div>
          </li>
          
          <li class="relative ml-8">
            <div class="flex items-center">
              <div 
                class="flex items-center justify-center w-10 h-10 rounded-full"
                :class="step >= 2 ? 'bg-primary-600' : 'bg-gray-300'"
              >
                <span 
                  class="font-medium"
                  :class="step >= 2 ? 'text-white' : 'text-gray-500'"
                >
                  2
                </span>
              </div>
              <span 
                class="ml-4 text-sm font-medium"
                :class="step >= 2 ? 'text-gray-900' : 'text-gray-500'"
              >
                Analyse
              </span>
            </div>
          </li>
          
          <li class="relative ml-8">
            <div class="flex items-center">
              <div 
                class="flex items-center justify-center w-10 h-10 rounded-full"
                :class="step >= 3 ? 'bg-primary-600' : 'bg-gray-300'"
              >
                <span 
                  class="font-medium"
                  :class="step >= 3 ? 'text-white' : 'text-gray-500'"
                >
                  3
                </span>
              </div>
              <span 
                class="ml-4 text-sm font-medium"
                :class="step >= 3 ? 'text-gray-900' : 'text-gray-500'"
              >
                Visualisation
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Questionnaire Upload -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <svg class="w-6 h-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Questionnaire
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Fichier JSON ou JS contenant la structure du questionnaire
          </p>
        </div>

        <div 
          class="upload-zone"
          :class="{ 'dragover': dragoverQuestionnaire }"
          @drop="handleDrop($event, 'questionnaire')"
          @dragover.prevent="dragoverQuestionnaire = true"
          @dragleave="dragoverQuestionnaire = false"
          @click="triggerFileInput('questionnaire')"
        >
          <input 
            ref="questionnaireInput"
            type="file"
            accept=".json,.js"
            @change="handleFileSelect($event, 'questionnaire')"
            class="hidden"
          />
          
          <div v-if="!files.questionnaire" class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="mt-4">
              <label class="cursor-pointer">
                <span class="mt-2 block text-sm font-medium text-gray-900">
                  Glissez votre fichier questionnaire ici
                </span>
                <span class="mt-2 block text-sm text-gray-500">
                  ou cliquez pour parcourir
                </span>
              </label>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Formats supportés: JSON, JS
            </p>
          </div>
          
          <div v-else class="text-center">
            <svg class="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="mt-2">
              <p class="text-sm font-medium text-gray-900">{{ files.questionnaire.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(files.questionnaire.size) }}</p>
            </div>
            <button 
              @click.stop="removeFile('questionnaire')"
              class="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Supprimer
            </button>
          </div>
        </div>

        <!-- Questionnaire Preview -->
        <div v-if="questionnairePreview" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-900 mb-2">Aperçu du questionnaire</h3>
          <div class="text-xs text-gray-600 space-y-1">
            <p><strong>Titre:</strong> {{ questionnairePreview.title || 'Sans titre' }}</p>
            <p><strong>Questions:</strong> {{ questionnairePreview.total_questions || 0 }}</p>
            <p><strong>Types:</strong> {{ questionnairePreview.question_types ? Object.keys(questionnairePreview.question_types).join(', ') : 'Aucun' }}</p>
          </div>
        </div>
      </div>

      <!-- Responses Upload -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <svg class="w-6 h-6 text-accent-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Réponses
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Fichier Excel contenant les réponses brutes
          </p>
        </div>

        <div 
          class="upload-zone"
          :class="{ 'dragover': dragoverResponses }"
          @drop="handleDrop($event, 'responses')"
          @dragover.prevent="dragoverResponses = true"
          @dragleave="dragoverResponses = false"
          @click="triggerFileInput('responses')"
        >
          <input 
            ref="responsesInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="handleFileSelect($event, 'responses')"
            class="hidden"
          />
          
          <div v-if="!files.responses" class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="mt-4">
              <label class="cursor-pointer">
                <span class="mt-2 block text-sm font-medium text-gray-900">
                  Glissez votre fichier de réponses ici
                </span>
                <span class="mt-2 block text-sm text-gray-500">
                  ou cliquez pour parcourir
                </span>
              </label>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Formats supportés: Excel (.xlsx, .xls), CSV
            </p>
          </div>
          
          <div v-else class="text-center">
            <svg class="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="mt-2">
              <p class="text-sm font-medium text-gray-900">{{ files.responses.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(files.responses.size) }}</p>
            </div>
            <button 
              @click.stop="removeFile('responses')"
              class="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Supprimer
            </button>
          </div>
        </div>

        <!-- Responses Preview -->
        <div v-if="responsesPreview" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-900 mb-2">Aperçu des réponses</h3>
          <div class="text-xs text-gray-600 space-y-1">
            <p><strong>Nombre de réponses:</strong> {{ responsesPreview.total_responses }}</p>
            <p><strong>Colonnes détectées:</strong> {{ responsesPreview.columns }}</p>
            <p><strong>Taille:</strong> {{ formatFileSize(files.responses.size) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing Section -->
    <div v-if="isProcessing" class="mt-8">
      <div class="card">
        <div class="flex items-center justify-center py-8">
          <div class="loading-spinner mr-4"></div>
          <div>
            <p class="text-lg font-medium text-gray-900">Traitement en cours...</p>
            <p class="text-sm text-gray-600">{{ processingMessage }}</p>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="progress-bar mt-4">
          <div 
            class="progress-fill"
            :style="{ width: `${processingProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="processingResults" class="mt-8">
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900">Résultats du traitement</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="stat-card">
            <div class="text-2xl font-bold text-primary-600">
              {{ processingResults.statistics.total_responses }}
            </div>
            <div class="text-sm text-gray-600">Réponses traitées</div>
          </div>
          
          <div class="stat-card">
            <div class="text-2xl font-bold text-accent-600">
              {{ processingResults.statistics.avg_completion_rate.toFixed(1) }}%
            </div>
            <div class="text-sm text-gray-600">Taux de completion moyen</div>
          </div>
          
          <div class="stat-card">
            <div class="text-2xl font-bold text-green-600">
              {{ Object.keys(processingResults.mapping.direct).length }}
            </div>
            <div class="text-sm text-gray-600">Colonnes mappées</div>
          </div>
        </div>

        <!-- Mapping Results -->
        <div v-if="processingResults.mapping.unmapped_columns.length > 0" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 class="text-sm font-medium text-yellow-800 mb-2">Colonnes non mappées</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="column in processingResults.mapping.unmapped_columns" 
              :key="column"
              class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
            >
              {{ column }}
            </span>
          </div>
        </div>

        <!-- Errors and Warnings -->
        <div v-if="processingResults.errors.length > 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 class="text-sm font-medium text-red-800 mb-2">Erreurs ({{ processingResults.errors.length }})</h3>
          <div class="text-xs text-red-700 max-h-32 overflow-y-auto">
            <div v-for="error in processingResults.errors.slice(0, 5)" :key="error.row" class="mb-1">
              Ligne {{ error.row }}: {{ error.error }}
            </div>
            <div v-if="processingResults.errors.length > 5" class="text-red-600">
              ... et {{ processingResults.errors.length - 5 }} autres erreurs
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <router-link 
            to="/analysis"
            class="btn-primary"
          >
            Continuer vers l'analyse
            <svg class="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </router-link>
          
          <button 
            @click="resetUpload"
            class="btn-secondary"
          >
            Recommencer
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="canProcess && !isProcessing && !processingResults" class="mt-8 flex justify-end">
      <button 
        @click="processFiles"
        class="btn-primary"
        :disabled="!files.questionnaire || !files.responses"
      >
        Traiter les fichiers
        <svg class="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { QuestionnaireParser } from '../utils/questionnaireParser'
import { ExcelReader } from '../utils/excelReader'

export default {
  name: 'Upload',
  setup() {
    const router = useRouter()
    const appStore = useAppStore()
    
    // Reactive state
    const files = reactive({
      questionnaire: null,
      responses: null
    })
    
    const dragoverQuestionnaire = ref(false)
    const dragoverResponses = ref(false)
    const questionnairePreview = ref(null)
    const responsesPreview = ref(null)
    const isProcessing = ref(false)
    const processingMessage = ref('')
    const processingProgress = ref(0)
    const processingResults = ref(null)
    const step = ref(1)
    
    // Computed properties
    const canProcess = computed(() => {
      return files.questionnaire && files.responses && !isProcessing.value
    })
    
    // File input references
    const questionnaireInput = ref(null)
    const responsesInput = ref(null)
    
    // Methods
    const triggerFileInput = (type) => {
      if (type === 'questionnaire') {
        questionnaireInput.value.click()
      } else {
        responsesInput.value.click()
      }
    }
    
    const handleFileSelect = (event, type) => {
      const file = event.target.files[0]
      if (file) {
        setFile(type, file)
      }
    }
    
    const handleDrop = (event, type) => {
      event.preventDefault()
      if (type === 'questionnaire') {
        dragoverQuestionnaire.value = false
      } else {
        dragoverResponses.value = false
      }
      
      const file = event.dataTransfer.files[0]
      if (file) {
        setFile(type, file)
      }
    }
    
    const setFile = async (type, file) => {
      files[type] = file
      
      // Preview the file
      if (type === 'questionnaire') {
        await previewQuestionnaire(file)
      } else {
        await previewResponses(file)
      }
    }
    
    const removeFile = (type) => {
      files[type] = null
      if (type === 'questionnaire') {
        questionnairePreview.value = null
      } else {
        responsesPreview.value = null
      }
    }
    
    const previewQuestionnaire = async (file) => {
      try {
        const text = await readFileAsText(file)
        const parser = new QuestionnaireParser()
        const structure = await parser.parse(text)
        questionnairePreview.value = parser.getSummary().statistics
      } catch (error) {
        console.error('Erreur preview questionnaire:', error)
        appStore.showNotification('error', `Erreur lors de la lecture du questionnaire: ${error.message}`)
      }
    }
    
    const previewResponses = async (file) => {
      try {
        const reader = new ExcelReader()
        const data = await reader.readFile(file)
        responsesPreview.value = {
          total_responses: data.length,
          columns: Object.keys(data[0] || {}).length
        }
      } catch (error) {
        console.error('Erreur preview réponses:', error)
        appStore.showNotification('error', `Erreur lors de la lecture des réponses: ${error.message}`)
      }
    }
    
    const readFileAsText = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsText(file)
      })
    }
    
    const processFiles = async () => {
      if (!canProcess.value) return
      
      isProcessing.value = true
      processingProgress.value = 0
      step.value = 2
      
      try {
        // Step 1: Parse questionnaire
        processingMessage.value = 'Analyse du questionnaire...'
        processingProgress.value = 20
        
        const questionnaireText = await readFileAsText(files.questionnaire)
        const parser = new QuestionnaireParser()
        const questionnaireStructure = await parser.parse(questionnaireText)
        
        appStore.setQuestionnaire(questionnaireStructure)
        
        // Step 2: Read Excel responses
        processingMessage.value = 'Lecture des réponses Excel...'
        processingProgress.value = 40
        
        const excelReader = new ExcelReader()
        await excelReader.readFile(files.responses)
        
        // Step 3: Map responses
        processingMessage.value = 'Mapping des réponses...'
        processingProgress.value = 60
        
        const mappingResults = excelReader.mapResponses(questionnaireStructure)
        
        // Step 4: Store results
        processingMessage.value = 'Finalisation...'
        processingProgress.value = 80
        
        appStore.setResponses(mappingResults.data)
        appStore.setProcessedData(mappingResults)
        
        processingProgress.value = 100
        processingMessage.value = 'Traitement terminé!'
        
        // Show results
        processingResults.value = mappingResults
        
        appStore.showNotification('success', 'Fichiers traités avec succès!')
        
      } catch (error) {
        console.error('Erreur traitement:', error)
        appStore.showNotification('error', `Erreur lors du traitement: ${error.message}`)
      } finally {
        isProcessing.value = false
      }
    }
    
    const resetUpload = () => {
      files.questionnaire = null
      files.responses = null
      questionnairePreview.value = null
      responsesPreview.value = null
      processingResults.value = null
      isProcessing.value = false
      processingProgress.value = 0
      step.value = 1
      appStore.resetStore()
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    return {
      files,
      dragoverQuestionnaire,
      dragoverResponses,
      questionnairePreview,
      responsesPreview,
      isProcessing,
      processingMessage,
      processingProgress,
      processingResults,
      canProcess,
      step,
      questionnaireInput,
      responsesInput,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      removeFile,
      processFiles,
      resetUpload,
      formatFileSize
    }
  }
}
</script>
