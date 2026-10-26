<script setup lang="ts">
import type { ManagedLayoutNode, WidgetInstance } from '@/shared/layout'

import Clock from '../Clock.vue'
import QuickLinks from '../QuickLinks/index.vue'
import SearchBox from '../SearchBox/index.vue'
import YiYan from '../YiYan.vue'

defineProps<{
  widget: WidgetInstance
  node: ManagedLayoutNode
  ready: boolean
}>()

const emit = defineEmits<{
  contextmenu: [event: MouseEvent]
  updateEngine: [widgetId: string, engine: string]
}>()

</script>

<template>
  <div
    class="layout-widget"
    :data-widget-id="widget.id"
    :data-widget-type="widget.type"
    @contextmenu.stop.prevent="$emit('contextmenu', $event)"
  >
    <span class="layout-widget__label">{{ widget.id }}</span>
    <search-box
      v-if="widget.type === 'search'"
      :engine="widget.engine"
      class-name="layout-widget__search"
      @update:engine="emit('updateEngine', widget.id, $event)"
      @contextmenu.stop.prevent="$emit('contextmenu', $event)"
    />
    <clock v-else-if="widget.type === 'clock'" @contextmenu.stop.prevent="$emit('contextmenu', $event)" />
    <yi-yan v-else-if="widget.type === 'yiyan'" @contextmenu.stop.prevent="$emit('contextmenu', $event)" />
    <quick-links
      v-else-if="widget.type === 'quickLinks'"
      :ready="ready"
      @contextmenu.stop.prevent="$emit('contextmenu', $event)"
    />
  </div>
</template>

<style lang="scss">
.layout-widget__label {
  position: absolute;
  top: -18px;
  left: 50%;
  z-index: 1;
  padding: 1px 7px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  pointer-events: none;
  background-color: var(--el-bg-color-overlay);
  border-radius: 6px;
  opacity: 0;
  transform: translateX(-50%);
  transition: opacity var(--el-transition-duration-fast) ease;
}

.layout-widget:hover > .layout-widget__label {
  opacity: 1;
}
</style>

