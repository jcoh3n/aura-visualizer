<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">{{ question.label }}</h3>
      <div class="flex space-x-2">
        <button 
          @click="toggleAnimation"
          class="text-sm text-gray-600 hover:text-gray-800"
          title="Animation"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l4.414 4.414a1 1 0 001.414 0 4 4 0 00-7.071-7.071z" />
          </svg>
        </button>
        <button 
          @click="exportChart"
          class="text-sm text-gray-600 hover:text-gray-800"
          title="Exporter le graphique"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="flex flex-col lg:flex-row lg:space-x-6">
      <!-- Chart -->
      <div class="flex-1 relative">
        <canvas 
          ref="chartCanvas"
          class="w-full h-80"
          @mousemove="handleMouseMove"
          @mouseleave="hideTooltip"
          @click="handleClick"
        ></canvas>
        
        <!-- Tooltip -->
        <div 
          v-if="tooltip.show"
          class="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none z-10"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
          <div class="font-medium">{{ tooltip.label }}</div>
          <div class="text-gray-300">{{ tooltip.value }} réponses ({{ tooltip.percentage }}%)</div>
        </div>
        
        <!-- Center label -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ data?.total || 0 }}</div>
            <div class="text-sm text-gray-600">réponses</div>
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="lg:w-64 mt-4 lg:mt-0">
        <h4 class="text-sm font-medium text-gray-900 mb-3">Légende</h4>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="(item, index) in sortedData" 
            :key="item.value"
            class="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-primary-50': selectedSlice === index }"
            @click="toggleSlice(index)"
          >
            <div 
              class="w-4 h-4 rounded-full flex-shrink-0"
              :style="{ backgroundColor: colors[index % colors.length] }"
            ></div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">
                {{ item.label }}
              </div>
              <div class="text-xs text-gray-500">
                {{ item.count }} ({{ item.percentage.toFixed(1) }}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-200">
      <div>
        Total: {{ data?.total || 0 }} réponses
      </div>
      <div>
        Options: {{ sortedData.length }}
      </div>
      <div>
        Taux de réponse: {{ data?.completion_rate?.toFixed(1) || 0 }}%
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

export default {
  name: 'PieChart',
  props: {
    question: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      default: null
    },
    responses: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    const selectedSlice = ref(null)
    const animationEnabled = ref(true)
    const animationProgress = ref(0)
    
    let chart = null
    let animationFrame = null
    let animationId = null
    
    const tooltip = ref({
      show: false,
      x: 0,
      y: 0,
      label: '',
      value: 0,
      percentage: 0
    })
    
    const sortedData = computed(() => {
      if (!props.data?.distribution) return []
      return [...props.data.distribution].sort((a, b) => b.count - a.count)
    })
    
    const colors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#6B7280', // gray-500
      '#14B8A6', // teal-500
      '#F43F5E'  // rose-500
    ]
    
    const drawChart = () => {
      if (!chartCanvas.value || !props.data?.distribution) return
      
      const canvas = chartCanvas.value
      const ctx = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()
      
      // Set canvas size
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      const width = rect.width
      const height = rect.height
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2 - 40
      const innerRadius = radius * 0.4 // For donut chart
      
      const data = sortedData.value
      const total = data.reduce((sum, item) => sum + item.count, 0)
      
      if (total === 0) return
      
      let currentAngle = -Math.PI / 2 // Start at top
      chart = { slices: [] }
      
      data.forEach((item, index) => {
        const sliceAngle = (item.count / total) * 2 * Math.PI
        const endAngle = currentAngle + sliceAngle
        
        // Apply animation
        const animatedEndAngle = animationEnabled.value 
          ? currentAngle + sliceAngle * animationProgress.value 
          : endAngle
        
        if (animatedEndAngle > currentAngle) {
          // Draw slice
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, currentAngle, animatedEndAngle)
          ctx.arc(centerX, centerY, innerRadius, animatedEndAngle, currentAngle, true)
          ctx.closePath()
          
          // Highlight selected slice
          if (selectedSlice.value === index) {
            ctx.fillStyle = lightenColor(colors[index % colors.length], 20)
            // Slightly offset the slice
            const midAngle = (currentAngle + animatedEndAngle) / 2
            const offsetX = Math.cos(midAngle) * 10
            const offsetY = Math.sin(midAngle) * 10
            ctx.translate(offsetX, offsetY)
          } else {
            ctx.fillStyle = colors[index % colors.length]
          }
          
          ctx.fill()
          
          // Reset translation
          if (selectedSlice.value === index) {
            const midAngle = (currentAngle + animatedEndAngle) / 2
            const offsetX = Math.cos(midAngle) * 10
            const offsetY = Math.sin(midAngle) * 10
            ctx.translate(-offsetX, -offsetY)
          }
          
          // Add subtle border
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Store slice data for interaction
          chart.slices[index] = {
            startAngle: currentAngle,
            endAngle: animatedEndAngle,
            centerX,
            centerY,
            radius,
            innerRadius,
            data: item
          }
          
          // Draw percentage label for larger slices
          if (item.percentage > 5) {
            const midAngle = (currentAngle + animatedEndAngle) / 2
            const labelRadius = (radius + innerRadius) / 2
            const labelX = centerX + Math.cos(midAngle) * labelRadius
            const labelY = centerY + Math.sin(midAngle) * labelRadius
            
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 12px Inter, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            
            // Add text shadow for better readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            ctx.shadowBlur = 2
            ctx.fillText(`${item.percentage.toFixed(1)}%`, labelX, labelY)
            ctx.shadowBlur = 0
          }
        }
        
        currentAngle = endAngle
      })
    }
    
    const lightenColor = (color, percent) => {
      const num = parseInt(color.replace("#", ""), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) + amt
      const G = (num >> 8 & 0x00FF) + amt
      const B = (num & 0x0000FF) + amt
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
    }
    
    const handleMouseMove = (event) => {
      if (!chart?.slices) return
      
      const rect = chartCanvas.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Check if mouse is over a slice
      const hoveredSlice = findSliceAtPosition(x, y)
      
      if (hoveredSlice !== null) {
        const slice = chart.slices[hoveredSlice]
        tooltip.value = {
          show: true,
          x: event.clientX - rect.left + 10,
          y: event.clientY - rect.top - 10,
          label: slice.data.label,
          value: slice.data.count,
          percentage: slice.data.percentage.toFixed(1)
        }
        
        chartCanvas.value.style.cursor = 'pointer'
      } else {
        hideTooltip()
      }
    }
    
    const handleClick = (event) => {
      const rect = chartCanvas.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      const clickedSlice = findSliceAtPosition(x, y)
      
      if (clickedSlice !== null) {
        selectedSlice.value = selectedSlice.value === clickedSlice ? null : clickedSlice
        drawChart()
      }
    }
    
    const findSliceAtPosition = (x, y) => {
      if (!chart?.slices) return null
      
      for (let i = 0; i < chart.slices.length; i++) {
        const slice = chart.slices[i]
        const dx = x - slice.centerX
        const dy = y - slice.centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance >= slice.innerRadius && distance <= slice.radius) {
          let angle = Math.atan2(dy, dx)
          if (angle < 0) angle += 2 * Math.PI
          
          // Normalize angles
          let startAngle = slice.startAngle
          let endAngle = slice.endAngle
          
          if (startAngle < 0) {
            startAngle += 2 * Math.PI
            endAngle += 2 * Math.PI
          }
          
          if (angle >= startAngle && angle <= endAngle) {
            return i
          }
        }
      }
      
      return null
    }
    
    const hideTooltip = () => {
      tooltip.value.show = false
      if (chartCanvas.value) {
        chartCanvas.value.style.cursor = 'default'
      }
    }
    
    const toggleSlice = (index) => {
      selectedSlice.value = selectedSlice.value === index ? null : index
      drawChart()
    }
    
    const toggleAnimation = () => {
      animationEnabled.value = !animationEnabled.value
      if (animationEnabled.value) {
        startAnimation()
      }
    }
    
    const startAnimation = () => {
      animationProgress.value = 0
      
      const animate = () => {
        animationProgress.value += 0.02
        
        if (animationProgress.value >= 1) {
          animationProgress.value = 1
          animationId = null
        } else {
          animationId = requestAnimationFrame(animate)
        }
        
        drawChart()
      }
      
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      animationId = requestAnimationFrame(animate)
    }
    
    const exportChart = () => {
      if (!chartCanvas.value) return
      
      const link = document.createElement('a')
      link.download = `pie_chart_${props.question.id}.png`
      link.href = chartCanvas.value.toDataURL()
      link.click()
    }
    
    const resizeObserver = new ResizeObserver(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      animationFrame = requestAnimationFrame(() => {
        nextTick(() => {
          drawChart()
        })
      })
    })
    
    onMounted(() => {
      animationProgress.value = animationEnabled.value ? 0 : 1
      nextTick(() => {
        if (animationEnabled.value) {
          startAnimation()
        } else {
          drawChart()
        }
        
        if (chartCanvas.value) {
          resizeObserver.observe(chartCanvas.value)
        }
      })
    })
    
    onUnmounted(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      resizeObserver.disconnect()
    })
    
    // Watch for data changes
    watch(() => props.data, () => {
      nextTick(() => {
        if (animationEnabled.value) {
          startAnimation()
        } else {
          drawChart()
        }
      })
    }, { deep: true })
    
    return {
      chartCanvas,
      tooltip,
      selectedSlice,
      sortedData,
      colors,
      handleMouseMove,
      handleClick,
      hideTooltip,
      toggleSlice,
      toggleAnimation,
      exportChart
    }
  }
}
</script>
