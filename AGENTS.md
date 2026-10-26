# AGENTS.md

基于 WXT + Vue 3 + TypeScript 的浏览器新标签页扩展，是 [lemon-new-tab](https://github.com/Redlnn/lemon-new-tab) 的二次开发版本。

## 定位

- 入口：[entrypoints/background](entrypoints/background)（Service Worker）、[entrypoints/newtab](entrypoints/newtab)（主界面）、[entrypoints/popup](entrypoints/popup)（弹窗）；启动链 [init.ts](entrypoints/newtab/init.ts) → [main.ts](entrypoints/newtab/main.ts) → [App.vue](entrypoints/newtab/App.vue)。
- 别名：`@/` → 仓库根（[shared](shared) 为跨入口共享），`@newtab/` → `entrypoints/newtab`（页面专用代码）。
- 设置：[shared/settings](shared/settings)；i18n：[shared/i18n.ts](shared/i18n.ts) + [locales](locales)；Manifest：[wxt.config.ts](wxt.config.ts)。
- [types/auto-imports.d.ts](types/auto-imports.d.ts)、[types/components.d.ts](types/components.d.ts) 是生成文件，禁止手改。

## 约定

- 用 Vue `script setup` + TypeScript；优先新增文件并在少量注册点挂载，慎改核心目录（[shared/webdavSync](shared/webdavSync)、[shared/settings](shared/settings)）。
- 变更小而聚焦，保留不属于当前任务的改动；避免过度设计。
- 样式用 class 选择器与现代 CSS，避免 `scoped`、标签与 ID 选择器。
- 设置项：在 [default.ts](shared/settings/default.ts)、[types](shared/settings/types)、[normalize.ts](shared/settings/normalize.ts) 与 [projection.ts](shared/settings/projection.ts) 同步登记。本项目只维护当前结构，不写历史版本迁移；`CURRENT_CONFIG_VERSION` 仅在需要作废旧数据时递增。
- 新增或修改 i18n 键时同步 `locales` 下全部语言，命名空间保持一致。
- 后台同步以最新快照为准，保持 [entrypoints/background/index.ts](entrypoints/background/index.ts) 现有合并行为。

## 验证

- TS/Vue 改动跑 `pnpm type-check`；静态检查跑 `pnpm lint:check`，用 `pnpm lint` 自动修复后复查附带改动。
- Manifest、构建或浏览器差异改动跑 `pnpm build`，产物在 `.output/chrome-mv3`。
- 验证真实扩展 UI、Service Worker、`chrome.storage`、IndexedDB 时用 [.agents/skills/extension-browser-debugging](.agents/skills/extension-browser-debugging)。

## 提交

- 遵循 Conventional Commits：`<type>(<scope>): <描述>`。
- type 使用 `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`。
- 描述用中文、祈使语气；一个功能一个提交，不混入格式化或无关改动。
- 示例：`fix(wallpaper): 放宽 Bing 壁纸请求超时`、`feat(newtab): 新增天气组件`。
- 同步上游：`git fetch upstream && git merge upstream/master`。
