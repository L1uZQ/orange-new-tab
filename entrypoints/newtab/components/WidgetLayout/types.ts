import type { ManagedLayoutNode, WidgetInstance } from '@/shared/layout'

export interface WidgetRenderContext {
  widget: WidgetInstance
  node: ManagedLayoutNode
}

