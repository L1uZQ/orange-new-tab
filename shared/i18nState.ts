import { ref } from 'vue'

/** 当前语言是否为中文。与 i18n 运行时分离，避免与 Vue chunk 形成循环依赖。 */
export const isChinese = ref(false)
