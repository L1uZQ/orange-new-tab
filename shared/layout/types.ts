export const WIDGET_TYPES = ['search', 'clock', 'yiyan', 'quickLinks'] as const
export type WidgetType = (typeof WIDGET_TYPES)[number]

export const LAYOUT_MODES = ['managed', 'free'] as const
export type LayoutMode = (typeof LAYOUT_MODES)[number]

export const STACK_DIRECTIONS = ['vertical', 'horizontal'] as const
export type StackDirection = (typeof STACK_DIRECTIONS)[number]

export interface WidgetInstance {
  id: string
  type: WidgetType
  enabled: boolean
  /** Search widgets use their own engine; an empty value inherits the global default. */
  engine?: string
}

export interface ManagedLayoutNode {
  id: string
  /** A widget node points at a WidgetInstance; a container node owns children. */
  widgetId?: string
  direction?: StackDirection
  gap?: number
  children?: ManagedLayoutNode[]
}

export interface FreeWidgetRect {
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutState {
  mode: LayoutMode
  widgets: WidgetInstance[]
  managedRoot: ManagedLayoutNode
  /** Logical pixels relative to the layout origin, never viewport coordinates. */
  freeRects: Record<string, FreeWidgetRect>
  freeGap: number
}

