import { withNotesLock } from '@/shared/notes'
import { withSyncWriteLock } from '@/shared/storage/syncWrite'

import { mergeImportedSnapshot } from './apply.ts'
import { parseJsonBackup, serializeJsonBackup, type ParsedLocalBackup } from './backupFormat.ts'
import {
  applyPreparedBrowserSnapshot,
  captureBrowserSyncSnapshotResult,
  prepareBrowserApply,
} from './browserData.ts'
import { JSON_BACKUP_SCOPE } from './catalog.ts'
import type { SyncScopePreferences, SyncSnapshotV1 } from './types.ts'

const MAX_JSON_BACKUP_BYTES = 25 * 1024 * 1024
const textDecoder = new TextDecoder('utf-8', { fatal: true })
const PRODUCT_ID = 'orange-new-tab'

export interface PreparedBrowserImport extends ParsedLocalBackup {
  source: 'json-v1'
  scope: SyncScopePreferences
}

export async function createBrowserJsonBackup() {
  const capture = await captureBrowserSyncSnapshotResult({ ...JSON_BACKUP_SCOPE })
  return {
    json: serializeJsonBackup(capture.snapshot, browser.runtime.getManifest().version),
    omissions: capture.resourceOmissions,
  }
}

/** 全新项目只接受自有格式的 JSON 备份。 */
export async function prepareBrowserImport(file: Blob): Promise<PreparedBrowserImport> {
  if (file.size > MAX_JSON_BACKUP_BYTES) throw new TypeError('JSON backup is too large')
  let value: unknown
  try {
    value = JSON.parse(textDecoder.decode(await file.arrayBuffer())) as unknown
  } catch {
    throw new TypeError('JSON backup is invalid')
  }
  if (!isRecord(value) || value.product !== PRODUCT_ID) {
    throw new TypeError('Backup format is unsupported')
  }
  const parsed = parseJsonBackup(value, browser.runtime.getManifest().version)
  return {
    ...parsed,
    source: 'json-v1',
    scope: inferImportScope(parsed.snapshot),
  }
}

export async function applyPreparedBrowserImport(
  input: PreparedBrowserImport,
  merge = false,
): Promise<void> {
  return withNotesLock(() =>
    withSyncWriteLock(async () => {
      const snapshot = merge
        ? mergeImportedSnapshot(
            (await captureBrowserSyncSnapshotResult(input.scope, undefined, true)).snapshot,
            input.snapshot,
          )
        : input.snapshot
      await applyPreparedBrowserSnapshot(
        await prepareBrowserApply(
          crypto.randomUUID(),
          crypto.randomUUID(),
          snapshot,
          input.scope,
          undefined,
          'import',
        ),
      )
    }),
  )
}

function inferImportScope(snapshot: SyncSnapshotV1): SyncScopePreferences {
  return {
    settings: Boolean(snapshot.settings),
    quickLinks: Boolean(snapshot.quickLinks),
    notes: Boolean(snapshot.notes),
    customSearchEngines: Boolean(snapshot.customSearchEngines),
    uiPreferences: Boolean(snapshot.ui),
    blockedTopSites: Boolean(snapshot.optional?.blockedTopSites),
    wallpapers: false,
    onlineWallpaperUrl: snapshot.optional?.onlineWallpaperUrl !== undefined,
    userIcons: Boolean(snapshot.inlineImages),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}