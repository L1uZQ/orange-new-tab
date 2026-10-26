import assert from 'node:assert/strict'
import test from 'node:test'

import { createDefaultLayout, defaultFreeRect } from '../shared/layout/default.ts'
import { normalizeLayoutState } from '../shared/layout/normalize.ts'
import {
  collectWidgetNodes,
  findNodeParent,
  insertNode,
  removeWidgetNode,
} from '../shared/layout/tree.ts'

test('默认布局包含两个独立搜索框实例并保留垂直根容器', () => {
  const layout = createDefaultLayout()
  assert.equal(layout.mode, 'managed')
  assert.equal(layout.managedRoot.direction, 'vertical')
  assert.deepEqual(
    layout.widgets.map((widget) => widget.type),
    ['search', 'search', 'clock', 'yiyan', 'quickLinks'],
  )
  assert.equal(layout.managedRoot.children?.length, 5)
})

test('布局树支持嵌套移动且阻止挪进自身子树', () => {
  const layout = createDefaultLayout()
  const root = layout.managedRoot
  const container = { id: 'test-stack', direction: 'vertical', gap: 8, children: [] }
  root.children?.push(container)
  assert.equal(insertNode(root, 'node-clock-main', 'test-stack', 0), true)
  assert.equal(collectWidgetNodes(root).length, 5)
  assert.equal(findNodeParent(root, 'node-clock-main')?.id, 'test-stack')
  assert.equal(insertNode(root, 'test-stack', 'test-stack', 0), false)
})

test('未知组件和非法自由坐标会被过滤或收敛到安全范围', () => {
  const normalized = normalizeLayoutState({
    mode: 'free',
    widgets: [
      { id: 'ok', type: 'search', engine: 'google' },
      { id: 'bad id', type: 'search' },
      { id: 'unknown', type: 'pdf' },
    ],
    managedRoot: { id: 'root', direction: 'vertical', children: [] },
    freeRects: {
      ok: { x: -99999, y: 99999, width: 3, height: 99999 },
      unknown: { x: 0, y: 0, width: 500, height: 44 },
    },
    freeGap: -10,
  })
  assert.deepEqual(
    normalized.widgets.map((widget) => widget.id),
    ['ok'],
  )
  assert.deepEqual(normalized.freeRects.ok, {
    x: -5000,
    y: 5000,
    width: 160,
    height: 900,
  })
  assert.equal(normalized.freeGap, 0)
})

test('删除组件不会破坏其余节点', () => {
  const layout = createDefaultLayout()
  assert.equal(removeWidgetNode(layout.managedRoot, 'clock-main'), true)
  assert.equal(collectWidgetNodes(layout.managedRoot).length, 4)
})

test('自由布局默认坐标以中心为原点且保持上下顺序', () => {
  const a = defaultFreeRect('search-main')
  const b = defaultFreeRect('search-google')
  assert.equal(a.x, -250)
  assert.ok(a.y < b.y)
  assert.equal(a.height, 44)
})

