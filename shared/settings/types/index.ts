import type { BgType, ClockWeight, DrawerDirection, SortMode } from '@/shared/enums'
import type { BuiltInSearchEngineKey } from '@/shared/searchEngines'
import type { SearchSuggestionProviderId } from '@/shared/searchSuggestionProviders'
import type { YiyanProviderKey } from '@newtab/shared/yiyan'

export type MainPositionType = 'center' | 'dvh' | 'px' | 'bottom-dvh' | 'bottom-px'
export type ActionBtnPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type BingWallpaperResolution = '1080p' | 'uhd'
export type BackgroundRotationOrder = 'random' | 'ordered'
export type SearchSuggestionApi = keyof typeof import('@newtab/shared/search').searchSuggestAPIs

export interface SettingsSchema {
  version: 1

  theme: {
    primaryColor: string
    colorfulMode: boolean
    monetColor: boolean
    idleHide: boolean
    keepClockVisibleOnIdle: boolean
  }

  clock: {
    enabled: boolean
    colorfulNum: boolean
    gradient: boolean
    newStyle: boolean
    hour12: boolean
    meridiem: { show: boolean; followSize: boolean }
    showDate: boolean
    showLunar: boolean
    showSeconds: boolean
    size: number
    dateSize: number
    weight: { time: ClockWeight; date: ClockWeight }
    style: {
      shadow: boolean
      blink: boolean
      transparency: number
      invertColor: { light: boolean; night: boolean }
    }
  }

  search: {
    enabled: boolean
    expandAlways: boolean
    showIconAlways: boolean
    suggestionsEnabled: boolean
    suggestionProviders: SearchSuggestionProviderId[]
    browserHistoryLimit: number
    suggestionAPI: SearchSuggestionApi
    engine: string
    builtInEngineOrder: BuiltInSearchEngineKey[]
    hiddenBuiltInEngines: BuiltInSearchEngineKey[]
    openInNewTab: boolean
    recordHistory: boolean
    leftAlignInput: boolean
    style: { shadow: boolean; border: boolean }
    placeholder: string
    expandWidth: number
    borderRadius: number
  }

  background: {
    bgType: BgType
    showDownloadBtn: boolean
    vignette: boolean
    parallax: boolean
    blur: number
    mask: { enabled: boolean; light: string; night: string }
    pauseOnBlur: boolean
    fastAnimation: boolean
    solid: { light: string; dark: string }
    rotation: { enabled: boolean; order: BackgroundRotationOrder }
    bing: {
      id: string
      url: string
      updateDate: string | number
      resolution: BingWallpaperResolution
      cachedResolution: BingWallpaperResolution | null
    }
    online: {
      url: string
      cache: { enabled: boolean; duration: number; noExpires: boolean }
    }
  }

  quickLinks: {
    enabled: boolean
    topSites: boolean
    pinnedIcon: boolean
    openInNewTab: boolean
    paging: boolean
    grouping: boolean
    useScroll: boolean
    pagingLoop: boolean
    showOnSearchFocus: boolean
    fallbackToTitleInitial: boolean
    iconSize: number
    iconRatio: number
    iconBorderRadius: number
    style: { shadow: boolean; border: boolean }
    layout: { rows: number; columns: number }
    marginTop: number
    spacing: { itemGapX: number; itemGapY: number; iconTitleGap: number }
    title: { show: boolean; extraWidth: number; whiteInLightMode: boolean }
  }

  dock: {
    enabled: boolean
    replaceQuickLinks: boolean
    groupId: string
    showOtherGroups: boolean
    folderCount: number
    topSites: boolean
    showOnSearchFocus: boolean
    openInNewTab: boolean
    limitCount: boolean
    maxCount: number
    gap: number
    iconSize: number
    iconRatio: number
    borderRadius: number
    launchpad: {
      enabled: boolean
      topSites: boolean
      openInNewTab: boolean
      iconSize: number
      rightClickToOpen: boolean
    }
  }

  yiyan: {
    enabled: boolean
    alwaysShow: boolean
    provider: YiyanProviderKey
    customLines: string
    borderRadius: number
    style: { shadow: boolean; invertColor: { light: boolean; night: boolean } }
  }

  perf: {
    bgSwitchAnim: boolean
    dockEnterAnim: boolean
    dockScale: boolean
    bookmark: { transparent: boolean; transparency: number; blur: boolean; blurIntensity: number }
    dialog: {
      transparent: boolean
      transparency: number
      blur: boolean
      blurIntensity: number
      animation: boolean
    }
    focus: { scale: boolean; blur: boolean }
    quickLinks: {
      transparent: boolean
      transparency: number
      blur: boolean
      blurIntensity: number
    }
    searchBar: {
      transparent: boolean
      transparency: number
      blur: boolean
      blurIntensity: number
      launchAnim: boolean
    }
    yiyan: {
      transparent: boolean
      transparency: number
      blur: boolean
      blurIntensity: number
      ripple: boolean
    }
    actionBtns: { blur: boolean; transparent: boolean; transparency: number; blurIntensity: number }
  }

  layout: {
    mainPosition: { type: MainPositionType; value: number }
    actionBtnPosition: ActionBtnPosition
    actionBtnBorderRadius: number
    globalBorderRadius: number
    minimalModeOnDoubleClick: boolean
  }

  bookmark: {
    direction: DrawerDirection
    rightClickToOpen: boolean
    showBtn: boolean
    defaultSortMode: SortMode
    drawerWidth: number
  }

  hideMajorChangelog: boolean
  greetingEnabled: boolean
  disableSettingsScrollRestore: boolean
  readChangeLog: boolean
  faviconCacheEnabled: boolean

  pluginVersion: string
}
