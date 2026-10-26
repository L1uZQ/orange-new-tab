import type { LayoutState, ManagedLayoutNode } from './types'

export function findNode(root: ManagedLayoutNode, nodeId: string): ManagedLayoutNode | null {
  if (root.id === nodeId) return root
  for (const child of root.children ?? []) {
    const found = findNode(child, nodeId)
    if (found) return found
  }
  return null
}

export function findWidgetNode(root: ManagedLayoutNode, widgetId: string) {
  return collectWidgetNodes(root).find((node) => node.widgetId === widgetId) ?? null
}

export function findNodeParent(
  root: ManagedLayoutNode,
  nodeId: string,
): ManagedLayoutNode | null {
  if (root.children?.some((child) => child.id === nodeId)) return root
  for (const child of root.children ?? []) {
    const found = findNodeParent(child, nodeId)
    if (found) return found
  }
  return null
}

export function insertNode(
  root: ManagedLayoutNode,
  nodeId: string,
  targetId: string,
  index: number,
) {
  const node = findNode(root, nodeId)
  if (!node) return false
  if (nodeId === targetId) return false
  const sourceParent = findNodeParent(root, nodeId)
  if (!sourceParent?.children) return false
  if (findNode(node, targetId)) return false
  const targetNode = findNode(root, targetId)
  if (!targetNode) return false
  const targetParent = targetNode.direction ? targetNode : findNodeParent(root, targetId)
  if (!targetParent) return false
  sourceParent.children.splice(
    sourceParent.children.findIndex((child) => child.id === nodeId),
    1,
  )
  targetParent.children ??= []
  targetParent.children.splice(Math.max(0, Math.min(index, targetParent.children.length)), 0, node)
  return true
}

export function moveNodeBefore(root: ManagedLayoutNode, nodeId: string, targetId: string) {
  return insertNode(root, nodeId, targetId, 0)
}

export function setNodeGap(root: ManagedLayoutNode, nodeId: string, gap: number) {
  const node = findNode(root, nodeId)
  if (!node) return false
  node.gap = Math.max(0, Math.round(gap))
  return true
}

export function collectWidgetNodes(root: ManagedLayoutNode): ManagedLayoutNode[] {
  return [
    ...(root.widgetId ? [root] : []),
    ...(root.children ?? []).flatMap(collectWidgetNodes),
  ]
}

export function getWidgetNode(
  layout: LayoutState,
  widgetId: string,
): ManagedLayoutNode | undefined {
  return collectWidgetNodes(layout.managedRoot).find((node) => node.widgetId === widgetId)
}

export function removeWidgetNode(root: ManagedLayoutNode, widgetId: string): boolean {
  if (!root.children) return false
  const index = root.children.findIndex((node) => node.widgetId === widgetId)
  if (index >= 0) {
    root.children.splice(index, 1)
    return true
  }
  return root.children.some((node) => removeWidgetNode(node, widgetId))
}

