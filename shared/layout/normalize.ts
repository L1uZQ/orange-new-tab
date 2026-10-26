import { createDefaultLayout, DEFAULT_CONTAINER_GAP } from './default.ts'
import {
  LAYOUT_MODES,
  STACK_DIRECTIONS,
  WIDGET_TYPES,
  type FreeWidgetRect,
  type LayoutState,
  type ManagedLayoutNode,
  type WidgetInstance,
} from './types.ts'

const SAFE_ID = /^[a-zA-Z0-9_-]{1,96}$/

function finite(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback
}

function normalizeWidget(value: unknown): WidgetInstance | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  if (typeof input.id !== 'string' || !SAFE_ID.test(input.id)) return null
  if (!WIDGET_TYPES.includes(input.type as WidgetInstance['type'])) return null
  return {
    id: input.id,
    type: input.type as WidgetInstance['type'],
    enabled: input.enabled !== false,
    ...(typeof input.engine === 'string' && input.engine ? { engine: input.engine } : {}),
    ...(typeof input.width === 'number'
      ? { width: finite(input.width, 500, 180, 1200) }
      : {}),
    ...(typeof input.height === 'number'
      ? { height: finite(input.height, 44, 32, 160) }
      : {}),
  }
}

function normalizeNode(value: unknown, widgetIds: Set<string>, depth = 0): ManagedLayoutNode | null {
  if (depth > 8 || !value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  if (typeof input.id !== 'string' || !SAFE_ID.test(input.id)) return null
  if (typeof input.widgetId === 'string') {
    return widgetIds.has(input.widgetId) ? { id: input.id, widgetId: input.widgetId } : null
  }
  const direction = STACK_DIRECTIONS.includes(input.direction as 'vertical' | 'horizontal')
    ? (input.direction as 'vertical' | 'horizontal')
    : 'vertical'
  const children = Array.isArray(input.children)
    ? input.children
        .slice(0, 80)
        .map((child) => normalizeNode(child, widgetIds, depth + 1))
        .filter((child): child is ManagedLayoutNode => child !== null)
    : []
  return {
    id: input.id,
    direction,
    gap: finite(input.gap, DEFAULT_CONTAINER_GAP, 0, 300),
    children,
  }
}

export function normalizeLayoutState(value: unknown): LayoutState {
  const fallback = createDefaultLayout()
  if (!value || typeof value !== 'object') return fallback
  const input = value as Record<string, unknown>
  const widgets = Array.isArray(input.widgets)
    ? input.widgets
        .slice(0, 40)
        .map(normalizeWidget)
        .filter((widget): widget is WidgetInstance => widget !== null)
    : []
  const uniqueWidgets = [...new Map(widgets.map((widget) => [widget.id, widget])).values()]
  const widgetIds = new Set(uniqueWidgets.map((widget) => widget.id))
  const root = normalizeNode(input.managedRoot, widgetIds)
  const freeRects: Record<string, FreeWidgetRect> = {}
  if (input.freeRects && typeof input.freeRects === 'object') {
    for (const [id, rect] of Object.entries(input.freeRects as Record<string, unknown>)) {
      if (!widgetIds.has(id) || !rect || typeof rect !== 'object') continue
      const item = rect as Record<string, unknown>
      freeRects[id] = {
        x: finite(item.x, 0, -5000, 5000),
        y: finite(item.y, 0, -5000, 5000),
        width: finite(item.width, 500, 160, 1800),
        height: finite(item.height, 44, 32, 900),
      }
    }
  }
  return {
    mode: LAYOUT_MODES.includes(input.mode as 'managed' | 'free')
      ? (input.mode as 'managed' | 'free')
      : fallback.mode,
    widgets: uniqueWidgets.length ? uniqueWidgets : fallback.widgets,
    managedRoot: root ?? fallback.managedRoot,
    freeRects,
    freeGap: finite(input.freeGap, 16, 0, 100),
  }
}

