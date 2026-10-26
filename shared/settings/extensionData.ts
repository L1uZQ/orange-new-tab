import { browser, storage } from '#imports'

/** 清空本扩展的持久化数据。 */
export async function clearExtensionData({ includeSync = false }: { includeSync?: boolean } = {}) {
  const { idbClearAll } = await import('@/shared/storage/idb')
  const { clearWallpaperLibrary } = await import('@/shared/wallpaperLibrary')
  await clearWallpaperLibrary()

  const tasks = [
    localStorage.clear(),
    sessionStorage.clear(),
    idbClearAll(),
    storage.clear('local'),
    storage.clear('session'),
  ]
  if (includeSync) tasks.push(storage.clear('sync'))
  await Promise.all(tasks)
}

const newtabUrls = new Set([
  browser.runtime.getURL('/newtab.html'),
  'chrome://newtab',
  'chrome://newtab/',
  'edge://newtab',
  'edge://newtab/',
])

/** 重载所有已打开的新标签页；单个标签页失败不会阻断其他标签页。 */
export async function reloadNewtabTabs(): Promise<boolean> {
  const tabs = await browser.tabs.query({})
  const targetIds = tabs.flatMap(({ id, url }) =>
    id !== undefined && url && newtabUrls.has(url) ? [id] : [],
  )
  const results = await Promise.allSettled(targetIds.map((id) => browser.tabs.reload(id)))
  const failed = results.find((result) => result.status === 'rejected')
  if (failed) throw failed.reason
  return targetIds.length > 0
}
