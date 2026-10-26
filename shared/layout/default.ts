import type { LayoutState, ManagedLayoutNode, WidgetInstance } from './types'

export const DEFAULT_WIDGET_WIDTH = 500
export const DEFAULT_WIDGET_HEIGHT = 44
export const DEFAULT_CONTAINER_GAP = 24

const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: 'search-main', type: 'search', enabled: true, engine: 'bing' },
  { id: 'search-google', type: 'search', enabled: true, engine: 'google' },
  { id: 'clock-main', type: 'clock', enabled: true },
  { id: 'yiyan-main', type: 'yiyan', enabled: true },
  { id: 'quick-links-main', type: 'quickLinks', enabled: true },
]

export function createDefaultLayout(): LayoutState {
  const widgets = structuredClone(DEFAULT_WIDGETS)
  const managedRoot: ManagedLayoutNode = {
    id: 'root',
    direction: 'vertical',
    gap: DEFAULT_CONTAINER_GAP,
    children: [
      { id: 'node-search-main', widgetId: 'search-main' },
      { id: 'node-search-google', widgetId: 'search-google' },
      { id: 'node-clock-main', widgetId: 'clock-main' },
      { id: 'node-yiyan-main', widgetId: 'yiyan-main' },
      { id: 'node-quick-links-main', widgetId: 'quick-links-main' },
    ],
  }

  return {
    mode: 'managed',
    widgets,
    managedRoot,
    freeRects: {},
    freeGap: 16,
  }
}

export function createWidgetNode(widgetId: string): ManagedLayoutNode {
  return { id: `node-${widgetId}-${Date.now()}`, widgetId }
}

export function createContainerNode(direction: 'vertical' | 'horizontal' = 'horizontal') {
  return {
    id: `container-${Date.now()}`,
    direction,
    gap: DEFAULT_CONTAINER_GAP,
    children: [] as ManagedLayoutNode[],
  } satisfies ManagedLayoutNode
}

export function defaultFreeRect(widgetId: string) {
  const index = DEFAULT_WIDGETS.findIndex((widget) => widget.id === widgetId)
  const rank = index >= 0 ? index : 0
  return {
    x: -DEFAULT_WIDGET_WIDTH / 2,
    y: rank * 64 - 160,
    width: DEFAULT_WIDGET_WIDTH,
    height: DEFAULT_WIDGET_HEIGHT,
  }
}

