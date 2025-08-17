<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Aura Visualizer
              </h1>
            </div>
            <div class="hidden md:ml-8 md:flex md:space-x-8">
              <router-link 
                to="/" 
                class="nav-link px-3 py-2 rounded-md text-sm"
                :class="{ 'active': $route.name === 'home' }"
              >
                Accueil
              </router-link>
              <router-link 
                to="/upload" 
                class="nav-link px-3 py-2 rounded-md text-sm"
                :class="{ 'active': $route.name === 'upload' }"
              >
                Import
              </router-link>
              <router-link 
                to="/analysis" 
                class="nav-link px-3 py-2 rounded-md text-sm"
                :class="{ 'active': $route.name === 'analysis' }"
                v-if="hasData"
              >
                Analyse
              </router-link>
              <router-link 
                to="/visualization" 
                class="nav-link px-3 py-2 rounded-md text-sm"
                :class="{ 'active': $route.name === 'visualization' }"
                v-if="hasData"
              >
                Visualisation
              </router-link>
              <router-link 
                to="/export" 
                class="nav-link px-3 py-2 rounded-md text-sm"
                :class="{ 'active': $route.name === 'export' }"
                v-if="hasData"
              >
                Export
              </router-link>
            </div>
          </div>
          
          <!-- Status indicator -->
          <div class="flex items-center space-x-4">
            <div v-if="isProcessing" class="flex items-center space-x-2">
              <div class="loading-spinner w-4 h-4"></div>
              <span class="text-sm text-gray-600">Traitement...</span>
            </div>
            <div v-else-if="hasData" class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Données chargées</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- Toast notifications -->
    <div 
      v-if="notification.show"
      class="fixed top-4 right-4 z-50 max-w-sm w-full"
    >
      <div 
        class="rounded-lg shadow-lg p-4"
        :class="{
          'bg-green-50 border border-green-200': notification.type === 'success',
          'bg-red-50 border border-red-200': notification.type === 'error',
          'bg-blue-50 border border-blue-200': notification.type === 'info',
          'bg-yellow-50 border border-yellow-200': notification.type === 'warning'
        }"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg 
              v-if="notification.type === 'success'"
              class="h-5 w-5 text-green-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg 
              v-else-if="notification.type === 'error'"
              class="h-5 w-5 text-red-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p 
              class="text-sm font-medium"
              :class="{
                'text-green-800': notification.type === 'success',
                'text-red-800': notification.type === 'error',
                'text-blue-800': notification.type === 'info',
                'text-yellow-800': notification.type === 'warning'
              }"
            >
              {{ notification.message }}
            </p>
          </div>
          <div class="ml-auto pl-3">
            <button 
              @click="hideNotification"
              class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="{
                'text-green-500 hover:bg-green-100 focus:ring-green-600': notification.type === 'success',
                'text-red-500 hover:bg-red-100 focus:ring-red-600': notification.type === 'error',
                'text-blue-500 hover:bg-blue-100 focus:ring-blue-600': notification.type === 'info',
                'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600': notification.type === 'warning'
              }"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive } from 'vue'
import { useAppStore } from './stores/app'

export default {
  name: 'App',
  setup() {
    const appStore = useAppStore()
    
    const notification = reactive({
      show: false,
      type: 'info',
      message: ''
    })
    
    const hasData = computed(() => appStore.hasData)
    const isProcessing = computed(() => appStore.isProcessing)
    
    const showNotification = (type, message) => {
      notification.type = type
      notification.message = message
      notification.show = true
      
      setTimeout(() => {
        notification.show = false
      }, 5000)
    }
    
    const hideNotification = () => {
      notification.show = false
    }
    
    // Écouter les notifications du store
    appStore.$onAction(({ name, after }) => {
      after((result) => {
        if (name === 'showNotification') {
          showNotification(result.type, result.message)
        }
      })
    })
    
    return {
      hasData,
      isProcessing,
      notification,
      hideNotification
    }
  }
}
</script>
