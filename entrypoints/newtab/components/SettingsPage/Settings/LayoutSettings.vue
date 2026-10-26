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
  setNodeGap,
  type WidgetInstance,
  type WidgetType,
} from '@/shared/layout'
import { useSettingsStore } from '@/shared/settings'
import type { ActionBtnPosition, MainPositionType } from '@/shared/settings/types'

import { getVisibleBuiltInSearchEngineKeys } from '@newtab/shared/search'
import { isOnlyTouchDevice } from '@newtab/shared/touch'

import SettingsSection from './SettingsSection.vue'

const { t } = useTranslation('settings')

const settings = useSettingsStore()
const layout = computed(() => settings.layout.manager)

// --- 组件管理 ---
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
  return t('newtab:layout.widgets.' + type)
}

function addWidget(type: WidgetType) {
  const widget: WidgetInstance = {
    id: type + '-' + crypto.randomUUID(),
    type,
    enabled: true,
    ...(type === 'search'
      ? { engine: settings.search.engine, width: 500, height: 44 }
      : {}),
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

const mainPositionOptions: { value: MainPositionType; label: string }[] = [
  { value: 'center', label: 'layout.mainPosition.center' },
  { value: 'dvh', label: 'layout.mainPosition.dvh' },
  { value: 'px', label: 'layout.mainPosition.px' },
  { value: 'bottom-dvh', label: 'layout.mainPosition.bottomDvh' },
  { value: 'bottom-px', label: 'layout.mainPosition.bottomPx' },
]

const mainPositionFromBottom = computed(() =>
  settings.layout.mainPosition.type.startsWith('bottom-'),
)
const mainPositionUsesDvh = computed(() => settings.layout.mainPosition.type.endsWith('dvh'))
const mainPositionValueLabel = computed(() => {
  if (mainPositionFromBottom.value) {
    return mainPositionUsesDvh.value
      ? 'layout.mainPosition.bottomDvhValue'
      : 'layout.mainPosition.bottomPxValue'
  }
  return mainPositionUsesDvh.value ? 'layout.mainPosition.dvhValue' : 'layout.mainPosition.pxValue'
})

type BtnCorner = { value: ActionBtnPosition; label: string; topOnly?: true }
const actionBtnOptions: BtnCorner[] = [
  { value: 'top-left', label: 'layout.actionBtn.topLeft', topOnly: true },
  { value: 'top-right', label: 'layout.actionBtn.topRight', topOnly: true },
  { value: 'bottom-left', label: 'layout.actionBtn.bottomLeft' },
  { value: 'bottom-right', label: 'layout.actionBtn.bottomRight' },
]

const dockEnabled = computed(() => settings.dock.enabled && !settings.dock.replaceQuickLinks)
const quickLinksScrollEnabled = computed(
  () => settings.quickLinks.enabled && settings.quickLinks.useScroll,
)

function selectActionBtn(pos: ActionBtnPosition) {
  if (dockEnabled.value && !pos.startsWith('top')) return
  settings.layout.actionBtnPosition = pos
}
</script>
<template>
  <div class="settings__items-container settings-page-grid">
    <!-- 组件管理 -->
    <SettingsSection
      :title="t('newtab:layout.components')"
      :summary="t('newtab:layout.componentsDescription')"
      mobile-open
    >
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('newtab:layout.addWidget') }}</div>
        <div class="layout-widget-grid">
          <button
            v-for="type in WIDGET_TYPES"
            :key="type"
            type="button"
            class="layout-widget-card"
            @click="addWidget(type)"
          >
            <strong>{{ widgetTitle(type) }}</strong>
            <span>{{ t('newtab:layout.widgetDescriptions.' + type) }}</span>
          </button>
        </div>
      </div>
      <div class="settings__item settings__item--horizontal">
        <el-button :icon="Plus" type="primary" @click="addContainer">
          {{ t('newtab:layout.addContainer') }}
        </el-button>
        <el-button type="danger" plain @click="resetLayout">
          {{ t('newtab:layout.reset') }}
        </el-button>
      </div>
      <div v-if="containers.length" class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('newtab:layout.horizontalContainer') }}</div>
        <div class="layout-container-list">
          <div v-for="container in containers" :key="container.id" class="layout-container-item">
            <span>{{ container.children?.length ?? 0 }} {{ t('newtab:layout.items') }}</span>
            <el-button size="small" @click="selectContainer(container.id)">
              {{ t('newtab:layout.useContainer') }}
            </el-button>
          </div>
        </div>
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('newtab:layout.components') }}</div>
        <div class="layout-widget-list">
          <article
            v-for="widget in layout.widgets"
            :key="widget.id"
            class="layout-widget-item"
            :class="{ 'is-selected': widget.id === selectedWidgetId }"
            @click="selectedWidgetId = widget.id"
          >
            <div class="layout-widget-item__main">
              <strong>{{ widgetTitle(widget.type) }}</strong>
              <span>{{ widget.id }}</span>
            </div>
            <div class="layout-widget-item__actions">
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
      </div>
    </SettingsSection>

    <!-- 布局模式 -->
    <SettingsSection :title="t('newtab:layout.mode')" :summary="t('newtab:layout.modeDescription')">
      <div class="settings__item settings__item--horizontal">
        <el-radio-group
          :model-value="layout.mode"
          @change="
            (mode) => (String(mode) === 'free' ? enableFreeMode() : enableManagedMode())
          "
        >
          <el-radio-button value="managed">{{ t('newtab:layout.managed') }}</el-radio-button>
          <el-radio-button value="free">{{ t('newtab:layout.free') }}</el-radio-button>
        </el-radio-group>
      </div>
    </SettingsSection>

    <!-- 搜索框实例设置 -->
    <SettingsSection
      v-if="selectedWidget?.type === 'search'"
      :title="t('newtab:layout.searchBoxSettings')"
    >
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('newtab:layout.searchWidth') }}</div>
        <el-input-number
          :model-value="selectedWidget.width ?? 500"
          :min="180"
          :max="1200"
          :step="10"
          controls-position="right"
          @update:model-value="(value) => selectedWidget && (selectedWidget.width = Number(value))"
        />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('newtab:layout.searchHeight') }}</div>
        <el-input-number
          :model-value="selectedWidget.height ?? 44"
          :min="32"
          :max="160"
          :step="1"
          controls-position="right"
          @update:model-value="(value) => selectedWidget && (selectedWidget.height = Number(value))"
        />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('newtab:layout.searchEngine') }}</div>
        <el-select
          :model-value="selectedWidget.engine"
          style="width: 150px"
          @update:model-value="
            (value) => selectedWidget && syncWidgetEngine(selectedWidget, String(value))
          "
        >
          <el-option
            v-for="key in builtInEngineKeys"
            :key="key"
            :label="t('newtab:search.engines.' + key)"
            :value="key"
          />
        </el-select>
      </div>
    </SettingsSection>

    <!-- 容器间距 -->
    <SettingsSection v-if="selectedParent" :title="t('newtab:layout.spacing')">
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('newtab:layout.containerGap') }}</div>
        <el-input-number
          :model-value="selectedParent.gap ?? 24"
          :min="0"
          :max="200"
          :step="2"
          controls-position="right"
          @update:model-value="updateWidgetGap"
        />
      </div>
    </SettingsSection>

    <SettingsSection
      :title="t('common.sections.position')"
      :summary="t('common.sections.summary.position')"
    >
      <div class="settings__item settings__item--horizontal settings__item--with-note">
        <div class="settings__label">{{ t('layout.mainPosition.label') }}</div>
        <el-select
          v-model="settings.layout.mainPosition.type"
          style="width: 150px"
          popper-class="settings-item-popper"
          :show-arrow="false"
          fit-input-width
        >
          <el-option
            v-for="opt in mainPositionOptions"
            :key="opt.value"
            :value="opt.value"
            :label="t(opt.label)"
            :disabled="quickLinksScrollEnabled && opt.value === 'center'"
          />
        </el-select>
        <p v-if="quickLinksScrollEnabled" class="settings__item-note">
          {{ t('layout.mainPosition.quickLinksScrollNote') }}
        </p>
        <p v-if="mainPositionFromBottom" class="settings__item-note">
          {{ t('layout.mainPosition.bottomNote') }}
        </p>
      </div>
      <div
        v-if="settings.layout.mainPosition.type !== 'center'"
        class="settings__item settings__item--vertical"
      >
        <div class="settings__label">{{ t(mainPositionValueLabel) }}</div>
        <el-slider
          v-model="settings.layout.mainPosition.value"
          :min="0"
          :max="mainPositionUsesDvh ? 80 : 500"
          :step="mainPositionUsesDvh ? 1 : 10"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>

      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('layout.actionBtn.label') }}</div>
        <div class="layout-corner-selector">
          <button
            v-for="opt in actionBtnOptions"
            :key="opt.value"
            type="button"
            class="layout-corner-btn"
            :aria-pressed="settings.layout.actionBtnPosition === opt.value"
            :class="{
              'layout-corner-btn--active': settings.layout.actionBtnPosition === opt.value,
              'layout-corner-btn--disabled': dockEnabled && !opt.topOnly,
            }"
            :disabled="dockEnabled && !opt.topOnly"
            @click="selectActionBtn(opt.value)"
          >
            {{ t(opt.label) }}
          </button>
        </div>
        <p v-if="dockEnabled" class="settings__item-note">
          {{ t('layout.actionBtn.dockNote') }}
        </p>
      </div>
    </SettingsSection>

    <SettingsSection
      :title="t('common.sections.behavior')"
      :summary="t('common.sections.summary.behavior')"
      content-class="settings-control-grid"
    >
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('layout.minimalModeOnDoubleClick') }}</div>
        <el-switch v-model="settings.layout.minimalModeOnDoubleClick" />
      </div>

      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('theme.idleHide') }}</div>
        <el-switch v-model="settings.theme.idleHide" :disabled="isOnlyTouchDevice" />
      </div>
      <div class="settings__item settings__item--horizontal settings-control-wide">
        <div class="settings__label">{{ t('theme.keepClockVisibleOnIdle') }}</div>
        <el-switch
          v-model="settings.theme.keepClockVisibleOnIdle"
          :disabled="!settings.theme.idleHide || isOnlyTouchDevice"
        />
      </div>
      <el-alert
        v-if="isOnlyTouchDevice"
        :title="t('common.touchDeviceDisabledNote')"
        type="warning"
        show-icon
        :closable="false"
      />
    </SettingsSection>

    <SettingsSection
      :title="t('common.sections.radius')"
      :summary="t('common.sections.summary.radius')"
      content-class="settings-control-grid"
    >
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('search.borderRadius') }} (%)</div>
        <el-slider
          v-model="settings.search.borderRadius"
          :min="0"
          :max="50"
          :step="1"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div v-if="settings.quickLinks.enabled" class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('layout.quickLinksIconBorderRadius') }} (%)</div>
        <el-slider
          v-model="settings.quickLinks.iconBorderRadius"
          :min="0"
          :max="50"
          :step="1"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div v-if="dockEnabled" class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('layout.dockBorderRadius') }} (px)</div>
        <el-slider
          v-model="settings.dock.borderRadius"
          :min="0"
          :max="40"
          :step="1"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('layout.actionBtn.borderRadius') }} (%)</div>
        <el-slider
          v-model="settings.layout.actionBtnBorderRadius"
          :min="0"
          :max="50"
          :step="1"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('yiyan.borderRadius') }} (px)</div>
        <el-slider
          v-model="settings.yiyan.borderRadius"
          :min="0"
          :max="40"
          :step="1"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('layout.globalBorderRadius') }} (px)</div>
        <el-slider
          v-model="settings.layout.globalBorderRadius"
          :min="0"
          :max="40"
          :step="1"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
    </SettingsSection>
  </div>
</template>
<style lang="scss" scoped>
.layout-corner-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 8px 0;
}

.layout-corner-btn {
  padding: 12px 8px;
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-regular);
  cursor: pointer;
  background-color: var(--settings-option-background);
  border: 1.5px solid var(--el-border-color);
  border-radius: var(--le-radius-inner, 10px);
  transition:
    border-color var(--el-transition-duration-fast) ease,
    background-color var(--el-transition-duration-fast) ease,
    color var(--el-transition-duration-fast) ease;

  &:hover:not(:disabled) {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-3);
  }

  &--active {
    color: var(--el-color-primary);
    background-color: var(--settings-option-active-background);
    border-color: var(--el-color-primary);
  }

  &--disabled {
    color: var(--el-text-color-disabled);
    cursor: not-allowed;
    background-color: var(--settings-option-background);
    opacity: 0.6;
  }
}

.layout-widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

.layout-widget-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  background-color: var(--settings-option-background);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--el-color-primary);
  }

  span {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
  }
}

.layout-container-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-container-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  font-size: var(--el-font-size-small);
  background-color: var(--settings-option-background);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.layout-widget-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.layout-widget-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  background-color: var(--settings-option-background);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: border-color 0.2s ease;

  &:hover,
  &.is-selected {
    border-color: var(--el-color-primary);
  }
}

.layout-widget-item__main {
  display: flex;
  flex-direction: column;
  gap: 2px;

  span {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
  }
}

.layout-widget-item__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
</style>
