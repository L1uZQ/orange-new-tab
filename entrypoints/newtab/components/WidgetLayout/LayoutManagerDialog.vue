<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import Plus from '~icons/fa7-solid/plus'

import {
  WIDGET_TYPES,
  collectWidgetNodes,
  createContainerNode,
  createDefaultLayout,
  createWidgetNode,
  defaultFreeRect,
  findNode,
  findNodeParent,
  insertNode,
  removeWidgetNode,
  type WidgetInstance,
  type WidgetType,
} from '@/shared/layout'
import { setNodeGap } from '@/shared/layout'
import { useSettingsStore } from '@/shared/settings'

import { getVisibleBuiltInSearchEngineKeys } from '@newtab/shared/search'

import BaseDialog from '../BaseDialog.vue'

const opened = defineModel<boolean>({ required: true })
const settings = useSettingsStore()
const { t } = useTranslation()
const layout = computed(() => settings.layout.manager)
const selectedWidgetId = ref<string | null>(null)
const selectedWidget = computed(() =>
  layout.value.widgets.find((widget) => widget.id === selectedWidgetId.value),
)
const selectedNode = computed(() =>
  selectedWidget.value
    ? collectWidgetNodes(layout.value.managedRoot).find(
        (node) => node.widgetId === selectedWidget.value?.id,
      )
    : undefined,
)
const selectedParent = computed(() =>
  selectedNode.value ? findNodeParent(layout.value.managedRoot, selectedNode.value.id) : undefined,
)
const builtInEngineKeys = computed(() =>
  getVisibleBuiltInSearchEngineKeys(
    settings.search.builtInEngineOrder,
    settings.search.hiddenBuiltInEngines,
  ),
)

function widgetTitle(type: WidgetType) {
  return t(`newtab:layout.widgets.${type}`)
}

function addWidget(type: WidgetType) {
  const widget: WidgetInstance = {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    enabled: true,
    ...(type === 'search' ? { engine: settings.search.engine } : {}),
  }
  layout.value.widgets.push(widget)
  const node = createWidgetNode(widget.id)
  layout.value.managedRoot.children ??= []
  layout.value.managedRoot.children.push(node)
  layout.value.freeRects[widget.id] = defaultFreeRect(widget.id)
  selectedWidgetId.value = widget.id
}

function removeWidget(widgetId: string) {
  removeWidgetNode(layout.value.managedRoot, widgetId)
  layout.value.widgets = layout.value.widgets.filter((widget) => widget.id !== widgetId)
  delete layout.value.freeRects[widgetId]
  const remaining = layout.value.widgets[0]?.id ?? null
  if (selectedWidgetId.value === widgetId) selectedWidgetId.value = remaining
}

function addContainer() {
  layout.value.managedRoot.children ??= []
  const container = createContainerNode('horizontal')
  layout.value.managedRoot.children.push(container)
  pendingContainerId.value = container.id
}

const pendingContainerId = ref<string | null>(null)
const pendingWidgetId = ref<string | null>(null)

function selectContainer(containerId: string) {
  pendingContainerId.value = containerId
  if (pendingWidgetId.value) {
    const moved = insertNode(
      layout.value.managedRoot,
      findNode(layout.value.managedRoot, pendingWidgetId.value)?.id ??
        collectWidgetNodes(layout.value.managedRoot).find(
          (node) => node.widgetId === pendingWidgetId.value,
        )?.id ??
        '',
      containerId,
      0,
    )
    if (moved) {
      pendingWidgetId.value = null
      ElMessage.success(t('newtab:layout.movedIntoContainer'))
    }
  }
}

function moveWidgetIntoContainer(widgetId: string, containerId: string) {
  selectedWidgetId.value = widgetId
  const node =
    findNode(layout.value.managedRoot, widgetId) ??
    collectWidgetNodes(layout.value.managedRoot).find((item) => item.widgetId === widgetId)
  if (!node) return
  if (insertNode(layout.value.managedRoot, node.id, containerId, 0)) {
    pendingWidgetId.value = null
    pendingContainerId.value = containerId
    ElMessage.success(t('newtab:layout.movedIntoContainer'))
  }
}

const containers = computed(() =>
  layout.value.managedRoot.children?.filter((node) => node.direction) ?? [],
)

function moveWidget(widgetId: string, direction: -1 | 1) {
  const root = layout.value.managedRoot
  const node = collectWidgetNodes(root).find((item) => item.widgetId === widgetId)
  if (!node) return
  const parent = findNodeParent(root, node.id)
  const siblings = parent?.children ?? root.children ?? []
  const index = siblings.findIndex((item) => item.id === node.id)
  if (index < 0) return
  const next = index + direction
  if (next < 0 || next >= siblings.length) return
  const [item] = siblings.splice(index, 1)
  if (item) siblings.splice(next, 0, item)
}

function resetLayout() {
  settings.layout.manager = createDefaultLayout()
  selectedWidgetId.value = null
}

function syncWidgetEngine(widget: WidgetInstance, engine: string) {
  widget.engine = engine
}

function updateWidgetGap(value: number | undefined) {
  const parent = selectedParent.value
  if (!parent || typeof value !== 'number') return
  setNodeGap(layout.value.managedRoot, parent.id, value)
}

function enableFreeMode() {
  if (layout.value.mode !== 'free') layout.value.mode = 'free'
  for (const widget of layout.value.widgets) {
    if (!layout.value.freeRects[widget.id]) {
      layout.value.freeRects[widget.id] = defaultFreeRect(widget.id)
    }
  }
}

function enableManagedMode() {
  layout.value.mode = 'managed'
}

onMounted(() => {
  selectedWidgetId.value = layout.value.widgets[0]?.id ?? null
})
</script>

<template>
  <BaseDialog
    v-model="opened"
    :title="t('newtab:layout.title')"
    width="760"
    container-class="layout-manager-dialog"
  >
    <div class="layout-manager">
      <section class="layout-manager__section">
        <div class="layout-manager__section-head">
          <div>
            <h3>{{ t('newtab:layout.addWidget') }}</h3>
            <p>{{ t('newtab:layout.addWidgetDescription') }}</p>
          </div>
          <el-button :icon="Plus" type="primary" @click="addContainer">
            {{ t('newtab:layout.addContainer') }}
          </el-button>
        </div>
        <div class="layout-manager__widget-grid">
          <button
            v-for="type in WIDGET_TYPES"
            :key="type"
            type="button"
            class="layout-manager__widget-card"
            @click="addWidget(type)"
          >
            <strong>{{ widgetTitle(type) }}</strong>
            <span>{{ t(`newtab:layout.widgetDescriptions.${type}`) }}</span>
          </button>
        </div>
        <div v-if="containers.length" class="layout-manager__containers">
          <div
            v-for="container in containers"
            :key="container.id"
            class="layout-manager__container"
          >
            <strong>{{ t('newtab:layout.horizontalContainer') }}</strong>
            <span>{{ container.children?.length ?? 0 }} {{ t('newtab:layout.items') }}</span>
            <el-button size="small" @click="selectContainer(container.id)">
              {{ t('newtab:layout.useContainer') }}
            </el-button>
          </div>
        </div>
      </section>

      <section class="layout-manager__section">
        <div class="layout-manager__section-head">
          <div>
            <h3>{{ t('newtab:layout.mode') }}</h3>
            <p>{{ t('newtab:layout.modeDescription') }}</p>
          </div>
          <el-radio-group :model-value="layout.mode" @change="($event === 'free' ? enableFreeMode() : enableManagedMode())">
            <el-radio-button value="managed">{{ t('newtab:layout.managed') }}</el-radio-button>
            <el-radio-button value="free">{{ t('newtab:layout.free') }}</el-radio-button>
          </el-radio-group>
        </div>
      </section>

      <section class="layout-manager__section">
        <div class="layout-manager__section-head">
          <div>
            <h3>{{ t('newtab:layout.components') }}</h3>
            <p>{{ t('newtab:layout.componentsDescription') }}</p>
          </div>
          <el-button type="danger" plain @click="resetLayout">
            {{ t('newtab:layout.reset') }}
          </el-button>
        </div>
        <div class="layout-manager__list">
          <article
            v-for="widget in layout.widgets"
            :key="widget.id"
            class="layout-manager__item"
            :class="{ 'is-selected': widget.id === selectedWidgetId }"
            @click="selectedWidgetId = widget.id"
          >
            <div class="layout-manager__item-main">
              <strong>{{ widgetTitle(widget.type) }}</strong>
              <span>{{ widget.id }}</span>
            </div>
            <div class="layout-manager__item-actions">
              <el-switch v-model="widget.enabled" />
              <el-button size="small" @click.stop="moveWidget(widget.id, -1)">
                {{ t('newtab:layout.moveUp') }}
              </el-button>
              <el-button size="small" @click.stop="moveWidget(widget.id, 1)">
                {{ t('newtab:layout.moveDown') }}
              </el-button>
              <el-button
                v-if="containers.length"
                size="small"
                @click.stop="moveWidgetIntoContainer(widget.id, containers[0]!.id)"
              >
                {{ t('newtab:layout.moveIntoContainer') }}
              </el-button>
              <el-button size="small" type="danger" plain @click.stop="removeWidget(widget.id)">
                {{ t('newtab:layout.remove') }}
              </el-button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="selectedWidget?.type === 'search'" class="layout-manager__section">
        <h3>{{ t('newtab:layout.searchBoxSettings') }}</h3>
        <div class="layout-manager__field">
          <label>{{ t('newtab:layout.searchEngine') }}</label>
          <el-select
            :model-value="selectedWidget.engine"
            @update:model-value="
              (value) => selectedWidget && syncWidgetEngine(selectedWidget, String(value))
            "
          >
            <el-option
              v-for="key in builtInEngineKeys"
              :key="key"
              :label="t(`newtab:search.engines.${key}`)"
              :value="key"
            />
          </el-select>
        </div>
      </section>

      <section v-if="selectedParent" class="layout-manager__section">
        <h3>{{ t('newtab:layout.spacing') }}</h3>
        <div class="layout-manager__field">
          <label>{{ t('newtab:layout.containerGap') }}</label>
          <el-input-number
            :model-value="selectedParent.gap ?? 24"
            :min="0"
            :max="200"
            :step="2"
            controls-position="right"
            @update:model-value="updateWidgetGap"
          />
        </div>
      </section>
    </div>
  </BaseDialog>
</template>

