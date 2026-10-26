<script setup lang="ts">
import { useElementSize, useEventListener } from '@vueuse/core'

import type { FreeWidgetRect, WidgetInstance } from '@/shared/layout'
import { defaultFreeRect } from '@/shared/layout'

import WidgetHost from './WidgetHost.vue'

const props = defineProps<{
  widgets: WidgetInstance[]
  rects: Record<string, FreeWidgetRect>
  ready: boolean
}>()

const emit = defineEmits<{
  updateRect: [widgetId: string, rect: FreeWidgetRect]
  widgetContextmenu: [event: MouseEvent, widget: WidgetInstance]
  updateEngine: [widgetId: string, engine: string]
}>()

const canvasRef = useTemplateRef('canvasRef')
const { width: viewportWidth, height: viewportHeight } = useElementSize(canvasRef)
const dragging = shallowRef<{
  id: string
  startX: number
  startY: number
  x: number
  y: number
  width: number
  height: number
} | null>(null)

const rawBounds = computed(() => {
  const entries = props.widgets.map((widget) => rectsFor(widget.id))
  if (!entries.length) return { minX: 0, minY: 0, width: 0, height: 0 }
  const minX = Math.min(...entries.map((rect) => rect.x))
  const minY = Math.min(...entries.map((rect) => rect.y))
  const maxX = Math.max(...entries.map((rect) => rect.x + rect.width))
  const maxY = Math.max(...entries.map((rect) => rect.y + rect.height))
  return { minX, minY, width: maxX - minX, height: maxY - minY }
})

const bounds = computed(() => rawBounds.value)

const canvasScale = computed(() => {
  const pad = 80
  if (!bounds.value.width || !bounds.value.height) return 1
  return Math.min(
    1,
    Math.max(0.35, (viewportWidth.value - pad) / bounds.value.width),
    Math.max(0.35, (viewportHeight.value - pad) / bounds.value.height),
  )
})

function rectsFor(widgetId: string) {
  return props.rects[widgetId] ?? defaultFreeRect(widgetId)
}

function normalizeRectForRender(widgetId: string): FreeWidgetRect {
  const rect = rectsFor(widgetId)
  const centerX = bounds.value.minX + bounds.value.width / 2
  const centerY = bounds.value.minY + bounds.value.height / 2
  return {
    x: Math.min(600, Math.max(-600, rect.x - centerX)),
    y: Math.min(450, Math.max(-450, rect.y - centerY)),
    width: Math.min(900, Math.max(180, rect.width)),
    height: Math.min(700, Math.max(40, rect.height)),
  }
}

function startDrag(event: PointerEvent, widget: WidgetInstance) {
  if (event.button !== 0) return
  event.preventDefault()
  event.stopPropagation()
  const rect = rectsFor(widget.id)
  dragging.value = {
    id: widget.id,
    startX: event.clientX,
    startY: event.clientY,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  }
  ;(event.currentTarget as HTMLElement | null)?.setPointerCapture(event.pointerId)
}

useEventListener(window, 'pointermove', (event) => {
  const current = dragging.value
  if (!current) return
  emit('updateRect', current.id, {
    x: current.x + Math.round((event.clientX - current.startX) / canvasScale.value),
    y: current.y + Math.round((event.clientY - current.startY) / canvasScale.value),
    width: current.width,
    height: current.height,
  })
})

useEventListener(window, 'pointerup', () => {
  dragging.value = null
})
</script>

<template>
  <div ref="canvasRef" class="free-canvas" @contextmenu.stop>
    <div
      class="free-canvas__stage"
      :style="{
        transform: `scale(${canvasScale})`,
      }"
    >
      <div
        v-for="widget in widgets"
        :key="widget.id"
        class="free-widget"
        :class="{ 'free-widget--dragging': dragging?.id === widget.id }"
        :style="{
          left: `${normalizeRectForRender(widget.id).x}px`,
          top: `${normalizeRectForRender(widget.id).y}px`,
          width: `${normalizeRectForRender(widget.id).width}px`,
          minHeight: `${normalizeRectForRender(widget.id).height}px`,
        }"
        @contextmenu.stop.prevent="$emit('widgetContextmenu', $event, widget)"
      >
        <button
          type="button"
          class="free-widget__handle"
          :aria-label="`${widget.id} drag handle`"
          @pointerdown.stop="startDrag($event, widget)"
        >
          ⠿
        </button>
        <widget-host
          :widget="widget"
          :node="{ id: widget.id, widgetId: widget.id }"
          :ready="ready"
          @contextmenu="(event: MouseEvent) => $emit('widgetContextmenu', event, widget)"
          @update-engine="
            (widgetId: string, engine: string) => $emit('updateEngine', widgetId, engine)
          "
        />
      </div>
    </div>
  </div>
</template>

