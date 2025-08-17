<template>
  <div v-if="!hasData" class="text-center py-12">
    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune donnée disponible</h3>
    <p class="mt-1 text-sm text-gray-500">Commencez par importer vos fichiers.</p>
    <div class="mt-6">
      <router-link to="/upload" class="btn-primary">
        Importer des fichiers
      </router-link>
    </div>
  </div>

  <div v-else class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Export des résultats</h1>
        <p class="mt-2 text-lg text-gray-600">
          Exportez vos analyses dans différents formats professionnels
        </p>
      </div>
    </div>

    <!-- Export Options -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- PDF Report -->
      <div class="card hover:shadow-lg transition-shadow duration-200">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Rapport PDF</h3>
          <p class="text-sm text-gray-500 mb-4">
            Rapport complet avec graphiques, statistiques et analyses
          </p>
          
          <div class="space-y-3 mb-6">
            <label class="flex items-center">
              <input 
                v-model="pdfOptions.includeCharts" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Inclure les graphiques</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="pdfOptions.includeRawData" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Inclure les données brutes</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="pdfOptions.includeStatistics" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Inclure les statistiques</span>
            </label>
          </div>
          
          <button 
            @click="exportPDF"
            :disabled="isExporting"
            class="btn-primary w-full"
          >
            <svg v-if="isExporting" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isExporting ? 'Génération...' : 'Télécharger PDF' }}
          </button>
        </div>
      </div>

      <!-- Excel Export -->
      <div class="card hover:shadow-lg transition-shadow duration-200">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg class="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L4.414 9H17a1 1 0 100-2H4.414l1.879-1.879z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Fichier Excel</h3>
          <p class="text-sm text-gray-500 mb-4">
            Données structurées avec statistiques et tableaux de synthèse
          </p>
          
          <div class="space-y-3 mb-6">
            <label class="flex items-center">
              <input 
                v-model="excelOptions.includeProcessedData" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Données traitées</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="excelOptions.includeStatistics" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Feuille statistiques</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="excelOptions.includePivotTables" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Tableaux croisés</span>
            </label>
          </div>
          
          <button 
            @click="exportExcel"
            :disabled="isExporting"
            class="btn-primary w-full"
          >
            <svg v-if="isExporting" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isExporting ? 'Génération...' : 'Télécharger Excel' }}
          </button>
        </div>
      </div>

      <!-- HTML Interactive -->
      <div class="card hover:shadow-lg transition-shadow duration-200">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg class="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Rapport HTML</h3>
          <p class="text-sm text-gray-500 mb-4">
            Page web interactive avec graphiques dynamiques
          </p>
          
          <div class="space-y-3 mb-6">
            <label class="flex items-center">
              <input 
                v-model="htmlOptions.includeInteractiveCharts" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Graphiques interactifs</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="htmlOptions.includeFilters" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Filtres dynamiques</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="htmlOptions.embedData" 
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600"
              />
              <span class="ml-2 text-sm text-gray-700">Données intégrées</span>
            </label>
          </div>
          
          <button 
            @click="exportHTML"
            :disabled="isExporting"
            class="btn-primary w-full"
          >
            <svg v-if="isExporting" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isExporting ? 'Génération...' : 'Télécharger HTML' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Export Options -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold text-gray-900">Options avancées</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Export Settings -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Paramètres d'export</h3>
          
          <div class="space-y-4">
            <div>
              <label class="label">Titre du rapport</label>
              <input 
                v-model="exportSettings.title" 
                type="text" 
                class="input-field"
                placeholder="Analyse des résultats de questionnaire"
              />
            </div>
            
            <div>
              <label class="label">Auteur</label>
              <input 
                v-model="exportSettings.author" 
                type="text" 
                class="input-field"
                placeholder="Votre nom"
              />
            </div>
            
            <div>
              <label class="label">Description</label>
              <textarea 
                v-model="exportSettings.description" 
                rows="3" 
                class="input-field"
                placeholder="Description de l'analyse..."
              ></textarea>
            </div>
            
            <div>
              <label class="label">Questions à inclure</label>
              <div class="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                <label 
                  v-for="question in questionsList" 
                  :key="question.id"
                  class="flex items-center"
                >
                  <input 
                    v-model="exportSettings.selectedQuestions"
                    :value="question.id"
                    type="checkbox" 
                    class="rounded border-gray-300 text-primary-600"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ question.label }}</span>
                </label>
              </div>
              <button 
                @click="selectAllQuestions"
                class="mt-2 text-sm text-primary-600 hover:text-primary-800"
              >
                Sélectionner toutes
              </button>
            </div>
          </div>
        </div>
        
        <!-- Export Preview -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Aperçu de l'export</h3>
          
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Questions sélectionnées:</span>
              <span class="font-medium">{{ exportSettings.selectedQuestions.length }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Total réponses:</span>
              <span class="font-medium">{{ totalResponses }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Filtres actifs:</span>
              <span class="font-medium">{{ activeFiltersCount }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Réponses filtrées:</span>
              <span class="font-medium">{{ filteredResponses.length }}</span>
            </div>
            
            <div class="pt-3 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                L'export incluera {{ exportSettings.selectedQuestions.length }} questions 
                avec {{ filteredResponses.length }} réponses analysées.
              </p>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="mt-6 space-y-3">
            <button 
              @click="exportAll"
              :disabled="isExporting"
              class="btn-accent w-full"
            >
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter tous les formats
            </button>
            
            <button 
              @click="saveTemplate"
              class="btn-secondary w-full"
            >
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Sauvegarder comme modèle
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export History -->
    <div v-if="exportHistory.length > 0" class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold text-gray-900">Historique des exports</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Format</th>
              <th>Questions</th>
              <th>Réponses</th>
              <th>Taille</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="export_ in exportHistory" :key="export_.id">
              <td>{{ formatDate(export_.date) }}</td>
              <td>
                <span class="badge" :class="getBadgeClass(export_.format)">
                  {{ export_.format.toUpperCase() }}
                </span>
              </td>
              <td>{{ export_.questionsCount }}</td>
              <td>{{ export_.responsesCount }}</td>
              <td>{{ formatFileSize(export_.size) }}</td>
              <td>
                <button 
                  @click="reExport(export_)"
                  class="text-sm text-primary-600 hover:text-primary-800 mr-3"
                >
                  Re-exporter
                </button>
                <button 
                  @click="deleteExport(export_.id)"
                  class="text-sm text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
// Import export utilities (we'll need to create these)
import { PDFExporter } from '../utils/exporters/pdfExporter'
import { ExcelExporter } from '../utils/exporters/excelExporter'
import { HTMLExporter } from '../utils/exporters/htmlExporter'

export default {
  name: 'Export',
  setup() {
    const appStore = useAppStore()
    const isExporting = ref(false)
    const exportHistory = ref([])
    
    // Export options
    const pdfOptions = reactive({
      includeCharts: true,
      includeRawData: false,
      includeStatistics: true
    })
    
    const excelOptions = reactive({
      includeProcessedData: true,
      includeStatistics: true,
      includePivotTables: false
    })
    
    const htmlOptions = reactive({
      includeInteractiveCharts: true,
      includeFilters: true,
      embedData: true
    })
    
    const exportSettings = reactive({
      title: 'Analyse des résultats de questionnaire',
      author: '',
      description: '',
      selectedQuestions: []
    })
    
    // Computed properties
    const hasData = computed(() => appStore.hasData)
    const questionnaire = computed(() => appStore.questionnaire)
    const responses = computed(() => appStore.responses)
    const filteredResponses = computed(() => appStore.filteredResponses)
    const totalResponses = computed(() => appStore.totalResponses)
    const questionsList = computed(() => appStore.questionsList)
    const activeFiltersCount = computed(() => Object.keys(appStore.filters).length)
    
    // Methods
    const exportPDF = async () => {
      if (isExporting.value) return
      
      try {
        isExporting.value = true
        appStore.showNotification('info', 'Génération du PDF en cours...')
        
        const exporter = new PDFExporter()
        const exportData = {
          questionnaire: questionnaire.value,
          responses: filteredResponses.value,
          settings: exportSettings,
          options: pdfOptions,
          selectedQuestions: exportSettings.selectedQuestions
        }
        
        await exporter.export(exportData)
        
        // Add to history
        addToHistory('pdf', exportData)
        
        appStore.showNotification('success', 'PDF généré avec succès!')
        
      } catch (error) {
        console.error('Erreur export PDF:', error)
        appStore.showNotification('error', `Erreur lors de l'export PDF: ${error.message}`)
      } finally {
        isExporting.value = false
      }
    }
    
    const exportExcel = async () => {
      if (isExporting.value) return
      
      try {
        isExporting.value = true
        appStore.showNotification('info', 'Génération du fichier Excel en cours...')
        
        const exporter = new ExcelExporter()
        const exportData = {
          questionnaire: questionnaire.value,
          responses: filteredResponses.value,
          settings: exportSettings,
          options: excelOptions,
          selectedQuestions: exportSettings.selectedQuestions
        }
        
        await exporter.export(exportData)
        
        // Add to history
        addToHistory('excel', exportData)
        
        appStore.showNotification('success', 'Fichier Excel généré avec succès!')
        
      } catch (error) {
        console.error('Erreur export Excel:', error)
        appStore.showNotification('error', `Erreur lors de l'export Excel: ${error.message}`)
      } finally {
        isExporting.value = false
      }
    }
    
    const exportHTML = async () => {
      if (isExporting.value) return
      
      try {
        isExporting.value = true
        appStore.showNotification('info', 'Génération du rapport HTML en cours...')
        
        const exporter = new HTMLExporter()
        const exportData = {
          questionnaire: questionnaire.value,
          responses: filteredResponses.value,
          settings: exportSettings,
          options: htmlOptions,
          selectedQuestions: exportSettings.selectedQuestions
        }
        
        await exporter.export(exportData)
        
        // Add to history
        addToHistory('html', exportData)
        
        appStore.showNotification('success', 'Rapport HTML généré avec succès!')
        
      } catch (error) {
        console.error('Erreur export HTML:', error)
        appStore.showNotification('error', `Erreur lors de l'export HTML: ${error.message}`)
      } finally {
        isExporting.value = false
      }
    }
    
    const exportAll = async () => {
      if (isExporting.value) return
      
      try {
        appStore.showNotification('info', 'Export de tous les formats en cours...')
        
        await Promise.all([
          exportPDF(),
          exportExcel(),
          exportHTML()
        ])
        
        appStore.showNotification('success', 'Tous les formats ont été exportés avec succès!')
        
      } catch (error) {
        console.error('Erreur export multiple:', error)
        appStore.showNotification('error', `Erreur lors de l'export multiple: ${error.message}`)
      }
    }
    
    const selectAllQuestions = () => {
      exportSettings.selectedQuestions = questionsList.value.map(q => q.id)
    }
    
    const addToHistory = (format, data) => {
      const exportItem = {
        id: Date.now(),
        date: new Date(),
        format,
        questionsCount: data.selectedQuestions.length,
        responsesCount: data.responses.length,
        size: Math.random() * 1000000, // Placeholder size
        settings: { ...data.settings },
        options: { ...data.options }
      }
      
      exportHistory.value.unshift(exportItem)
      
      // Keep only last 10 exports
      if (exportHistory.value.length > 10) {
        exportHistory.value = exportHistory.value.slice(0, 10)
      }
      
      // Save to localStorage
      localStorage.setItem('aura_export_history', JSON.stringify(exportHistory.value))
    }
    
    const reExport = async (exportItem) => {
      // Restore settings and re-export
      Object.assign(exportSettings, exportItem.settings)
      
      if (exportItem.format === 'pdf') {
        Object.assign(pdfOptions, exportItem.options)
        await exportPDF()
      } else if (exportItem.format === 'excel') {
        Object.assign(excelOptions, exportItem.options)
        await exportExcel()
      } else if (exportItem.format === 'html') {
        Object.assign(htmlOptions, exportItem.options)
        await exportHTML()
      }
    }
    
    const deleteExport = (exportId) => {
      exportHistory.value = exportHistory.value.filter(item => item.id !== exportId)
      localStorage.setItem('aura_export_history', JSON.stringify(exportHistory.value))
    }
    
    const saveTemplate = () => {
      const template = {
        settings: { ...exportSettings },
        pdfOptions: { ...pdfOptions },
        excelOptions: { ...excelOptions },
        htmlOptions: { ...htmlOptions }
      }
      
      const templates = JSON.parse(localStorage.getItem('aura_export_templates') || '[]')
      templates.push({
        id: Date.now(),
        name: exportSettings.title || 'Modèle sans nom',
        date: new Date(),
        template
      })
      
      localStorage.setItem('aura_export_templates', JSON.stringify(templates))
      appStore.showNotification('success', 'Modèle sauvegardé avec succès!')
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const getBadgeClass = (format) => {
      const classes = {
        pdf: 'badge-error',
        excel: 'badge-success',
        html: 'badge-info'
      }
      return classes[format] || 'badge-info'
    }
    
    onMounted(() => {
      appStore.setCurrentStep('export')
      
      // Initialize selected questions
      exportSettings.selectedQuestions = questionsList.value.map(q => q.id)
      
      // Load export history
      const savedHistory = localStorage.getItem('aura_export_history')
      if (savedHistory) {
        exportHistory.value = JSON.parse(savedHistory)
      }
    })
    
    return {
      hasData,
      questionnaire,
      responses,
      filteredResponses,
      totalResponses,
      questionsList,
      activeFiltersCount,
      isExporting,
      exportHistory,
      pdfOptions,
      excelOptions,
      htmlOptions,
      exportSettings,
      exportPDF,
      exportExcel,
      exportHTML,
      exportAll,
      selectAllQuestions,
      reExport,
      deleteExport,
      saveTemplate,
      formatDate,
      formatFileSize,
      getBadgeClass
    }
  }
}
</script>
