<script setup lang="ts">
import '@newtab/styles/widget-layout.scss'

import { useDebounceFn } from '@vueuse/core'
import { useTranslation } from 'i18next-vue'
import Plus from '~icons/fa7-solid/plus'

import { defaultFreeRect } from '@/shared/layout'
import { useSettingsStore } from '@/shared/settings'

import { useAppDialogs } from '@newtab/composables/appDialogs'
import {
  SettingsRoute,
  useSettingsRouter,
} from '@newtab/components/SettingsPage/composables/useSettingsRouter'

import FreeCanvas from './FreeCanvas.vue'
import ManagedTree from './ManagedTree.vue'

const props = defineProps<{ ready: boolean }>()
const settings = useSettingsStore()
const dialogs = useAppDialogs()
const settingsRouter = useSettingsRouter()
const { t } = useTranslation()

const persist = useDebounceFn(() => void settings.save(), 120)
const layout = computed(() => settings.layout.manager)
const enabledWidgets = computed(() =>
  layout.value.widgets.filter((widget) => widget.enabled),
)

watch(
  enabledWidgets,
  (widgets) => {
    if (layout.value.mode !== 'free') return
    for (const widget of widgets) {
      if (!layout.value.freeRects[widget.id]) {
        layout.value.freeRects[widget.id] = defaultFreeRect(widget.id)
      }
    }
  },
  { immediate: true },
)

function openAddWidget() {
  dialogs.open('settings')
  settingsRouter.push(SettingsRoute.LAYOUT)
}

function widgetContextmenu(event: MouseEvent) {
  event.preventDefault()
}

function updateEngine(widgetId: string, engine: string) {
  const widget = layout.value.widgets.find((item) => item.id === widgetId)
  if (widget) widget.engine = engine
  persist()
}

function openLayoutMenu(event: MouseEvent) {
  event.preventDefault()
  dialogs.open('settings')
  settingsRouter.push(SettingsRoute.LAYOUT)
}

function toggleMode() {
  layout.value.mode = layout.value.mode === 'managed' ? 'free' : 'managed'
  persist()
}

</script>

<template>
  <div
    class="widget-layout"
    :class="`widget-layout--${layout.mode}`"
    @contextmenu.self.stop.prevent="openLayoutMenu"
  >
    <div class="widget-layout__toolbar">
      <button
        type="button"
        class="widget-layout__tool"
        :aria-label="t('newtab:layout.mode')"
        :title="t('newtab:layout.mode')"
        @click="toggleMode"
      >
        {{ layout.mode === 'managed' ? t('newtab:layout.managed') : t('newtab:layout.free') }}
      </button>
      <button
        type="button"
        class="widget-layout__tool"
        :aria-label="t('newtab:layout.addWidget')"
        :title="t('newtab:layout.addWidget')"
        @click="openAddWidget"
      >
        <el-icon><plus /></el-icon>
      </button>
      <button
        type="button"
        class="widget-layout__tool"
        :aria-label="t('newtab:layout.manage')"
        :title="t('newtab:layout.manage')"
        @click="openAddWidget"
      >
        <el-icon><settings /></el-icon>
      </button>
    </div>

    <div v-if="layout.mode === 'managed'" class="widget-layout__managed">
      <managed-tree
        :node="layout.managedRoot"
        :widgets="enabledWidgets"
        :ready="props.ready"
        @widget-contextmenu="widgetContextmenu"
        @update-engine="updateEngine"
      />
    </div>
    <free-canvas
      v-else
      :widgets="enabledWidgets"
      :rects="layout.freeRects"
      :ready="props.ready"
      @update-rect="(id, rect) => ((layout.freeRects[id] = rect), persist())"
      @update-engine="updateEngine"
    />
  </div>
</template>

