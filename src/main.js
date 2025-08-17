import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import des vues
import Home from './views/Home.vue'
import Upload from './views/Upload.vue'
import Analysis from './views/Analysis.vue'
import Visualization from './views/Visualization.vue'
import Export from './views/Export.vue'

// Configuration du routeur
const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/upload', name: 'upload', component: Upload },
  { path: '/analysis', name: 'analysis', component: Analysis },
  { path: '/visualization', name: 'visualization', component: Visualization },
  { path: '/export', name: 'export', component: Export }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Configuration de l'application
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
