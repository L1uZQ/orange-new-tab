import { storage } from '#imports'

import { coordinateStorage } from '@/shared/storage/syncWrite'

import { type CURRENT_CONFIG_SCHEMA } from './current'
import { defaultSettings } from './default'
import { normalizeCurrentSettings } from './normalize'

/**
 * 全新项目：只维护当前结构，不保留任何历史版本迁移。
 * 读到结构不匹配的旧值时按当前模板重写，缺少的字段回落默认值。
 */
const rawSettingsStorage = storage.defineItem<CURRENT_CONFIG_SCHEMA>('local:settings', {
  fallback: structuredClone(defaultSettings) as CURRENT_CONFIG_SCHEMA,
})

const settingsStorageRaw = {
  ...rawSettingsStorage,
  async getValue(): Promise<CURRENT_CONFIG_SCHEMA> {
    const stored = await rawSettingsStorage.getValue()
    try {
      return normalizeCurrentSettings(stored)
    } catch (error) {
      console.warn('[settings] stored settings are unusable, falling back to defaults', error)
      const fallback = structuredClone(defaultSettings)
      await rawSettingsStorage.setValue(fallback)
      return fallback
    }
  },
}

export const settingsStorage = coordinateStorage(settingsStorageRaw)
