<script setup lang="ts">
import type { ManagedLayoutNode, WidgetInstance } from '@/shared/layout'

import WidgetHost from './WidgetHost.vue'

defineOptions({ name: 'ManagedTree' })

defineProps<{
  node: ManagedLayoutNode
  widgets: WidgetInstance[]
  ready: boolean
}>()

defineEmits<{
  widgetContextmenu: [event: MouseEvent, node: ManagedLayoutNode, widget: WidgetInstance]
  containerContextmenu: [event: MouseEvent, node: ManagedLayoutNode]
  updateEngine: [widgetId: string, engine: string]
}>()

</script>

<template>
  <div
    v-if="node.direction"
    class="managed-container"
    :class="`managed-container--${node.direction}`"
    :style="{ gap: `${node.gap ?? 24}px` }"
    :data-node-id="node.id"
    @contextmenu.stop.prevent="$emit('containerContextmenu', $event, node)"
  >
    <template v-for="child in node.children" :key="child.id">
      <managed-tree
        v-if="child.direction"
        :node="child"
        :widgets="widgets"
        :ready="ready"
        @widget-contextmenu="
          (event, childNode, widget) => $emit('widgetContextmenu', event, childNode, widget)
        "
        @container-contextmenu="
          (event, childNode) => $emit('containerContextmenu', event, childNode)
        "
        @update-engine="
          (widgetId: string, engine: string) => $emit('updateEngine', widgetId, engine)
        "
      />
      <widget-host
        v-else-if="child.widgetId && widgets.find((item) => item.id === child.widgetId)"
        :node="child"
        :widget="widgets.find((item) => item.id === child.widgetId)!"
        :ready="ready"
        @contextmenu="
          (event: MouseEvent) =>
            $emit(
              'widgetContextmenu',
              event,
              child,
              widgets.find((item) => item.id === child.widgetId)!,
            )
        "
        @update-engine="
          (widgetId: string, engine: string) => $emit('updateEngine', widgetId, engine)
        "
      />
    </template>
  </div>
</template>

