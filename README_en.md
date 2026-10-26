<p align="center">
  <img src="./assets/readme-banner.png" alt="orange-new-tab" width="100%" />
</p>

<div align="center">

[Simplified Chinese](README.md) | English  
[Terms of Service](docs/TERMS_OF_SERVICE_en.md) | [Privacy Policy](docs/PRIVACY_POLICY_en.md)

</div>

> [!IMPORTANT]
> This project (orange-new-tab) is a derivative work based on
> [lemon-new-tab](https://github.com/Redlnn/lemon-new-tab), created by
> [Red_lnn](https://github.com/Redlnn) and released under the AGPL-3.0 license.
> The upstream license and copyright notices are preserved; the page name, icon,
> and contact details have been replaced with this derivative's own branding.
> Upstream repository: <https://github.com/Redlnn/lemon-new-tab>

## Installation

This is a personal derivative build and is not published to any extension store. Clone and build it manually:

```sh
git clone https://github.com/L1uZQ/orange-new-tab.git
cd orange-new-tab
pnpm install
pnpm build
```

Then load `.output/chrome-mv3` via "Load unpacked" in your browser's extension page.

## Features

Make every new tab feel fast, effortless, and enjoyable.

Orange New Tab is a local-first, open-source browser extension with no additional account required. Your core settings and personalized content stay in your browser, giving you fast loading, a clean interface, and no distracting news feed or ads.

**🔍 Flexible Search**  
&emsp;&ensp;Use Bing, Google, Baidu, DuckDuckGo, Yandex, and other search engines. Search suggestions, search history, and custom search engines help you quickly find what you need using a familiar workflow.

**🧭 Quick Links**  
&emsp;&ensp;Automatically display your most-visited sites, or add, pin, and rearrange your own links. Organize them into groups, browse with pages or scrolling, and switch to Dock or Launchpad layouts to keep favorite sites within easy reach.

**🔖 Browser Bookmarks**  
&emsp;&ensp;Search, open, edit, delete, and rearrange your browser bookmarks without leaving the new tab page.

**🖼️ Rich Wallpaper Options**  
&emsp;&ensp;Use Bing's daily image, an online image API, or local images and videos as your wallpaper. Extensive customization options help bring your background to life.

**🎨 Highly Customizable**  
&emsp;&ensp;A wide range of options lets you customize the layout, theme colors, and the position and appearance of individual components. Dynamic theme colors can even be extracted from your wallpaper to create a naturally coordinated page.

**🕒 Useful Without Distractions**  
&emsp;&ensp;Display the time, date, seconds, and lunar calendar. Enjoy a daily poem, motivational quote, or your own custom text, with one-click copying whenever you want to save it.

**⚡ Fast and Easy to Use**  
&emsp;&ensp;Continuously optimized for faster loading and lower resource usage, with responsive layouts and independent controls for performance and visual effects.

**🔄 Easy Backup**  
&emsp;&ensp;Import or export extension settings to back up your current data or move it to another device.

**⚛️ Built for Trust**  
&emsp;&ensp;Orange New Tab makes all of its source code available under the AGPL-3.0 license and does not actively collect or send private data. It supports Chrome, Edge, and Firefox, providing a consistent experience across browsers.

> [!NOTE]  
> Contributions via PRs are welcome. Issues may not always be implemented.

## Changelog

[English](./docs/CHANGELOG_en.md) | [Chinese](./docs/CHANGELOG.md)

## Browser Compatibility

|                 Browser                  | Supported |              Notes               |
| :--------------------------------------: | :-------: | :------------------------------: |
|                  Chrome                  |    ✅     |       Chrome 116 and above       |
|                   Edge                   |    ✅     |        Edge 116 and above        |
|                 Firefox                  |    ✅     |      Firefox 128 and above       |
|              Firefox Mobile              |    ❌     | Unable to replace native new tab |
|               Edge Mobile                |    ❌     | Unable to replace native new tab |
| Other Chromium-based<br/>Mobile Browsers |    ❓     |             untested             |

> Lemon Start Page adapts to both landscape and portrait modes,
> but has not been tested or published on mobile browsers, so compatibility is not guaranteed.

## Preview

<details>
<summary>Click to expand screenshots</summary>

![Standard homepage](./preview/1.webp)  
![Solid-color background homepage](./preview/2.webp)  
![Homepage with Dock and large clock](./preview/3.webp)  
![Launchpad](./preview/4.webp)  
![Search page](./preview/5.webp)  
![Settings page](./preview/6.webp)

</details>

## Development

This project is built with Vue 3 (TypeScript) + Element Plus.

> [!WARNING]
>
> 1. I have not systematically studied HTML / CSS / JS / TS / Vue,
>    so the code quality may not be very high.
> 2. This project contains a large amount of AI-generated code.
>    Only basic reviews were performed to ensure the functionality works
>    and that no malicious code is included.
>    The overall quality/performance may still have issues to some extent —
>    thank you for your understanding.
> 3. PRs are welcome.

### Build

#### For Chrome

```sh
git clone https://github.com/L1uZQ/orange-new-tab.git
cd orange-new-tab
pnpm install
# pnpm dev  # Run development mode, opens in a standalone browser
# Build
pnpm build  # Build as (unminified) Chrome extension
pnpm zip    # Package Chrome extension
```

#### For Firefox

```sh
git clone https://github.com/L1uZQ/orange-new-tab.git
cd orange-new-tab
pnpm install
# pnpm dev  # Run development mode, opens in a standalone browser
# Build
pnpm build:firefox  # Build as (unpacked & unsigned) Firefox extension
pnpm zip:firefox    # Package Firefox extension
```

#### Syncing with upstream

This repository is derived from [lemon-new-tab](https://github.com/Redlnn/lemon-new-tab); the `upstream`
remote points at the original repository:

```sh
git fetch upstream          # Fetch upstream changes
git merge upstream/master   # Merge upstream changes into the current branch
git push origin master      # Push to this repository
```

## Known Issues

1. Some Chromium-based browsers on Windows may freeze at startup.
   Disabling **GPU hardware acceleration** or switching  
   **Choose ANGLE graphics backend** to `OpenGL` in
   [Experiments](chrome://flags/#use-angle) can help.
   > - Likely caused by GPU driver or system issues.
   > - Chromium discourages rendering via OpenGL API, but other settings may also help (might reduce stutter but risk frame drops).

## Credits

- [Lemon Start Page (lemon-new-tab)](https://github.com/Redlnn/lemon-new-tab): The upstream project this
  repository is derived from.
- [Lime Start Page](https://limestart.cn/): Inspiration for Lemon Start Page.
  Layout, animations, and some CSS were referenced.
- [Light Tab Page](https://github.com/Devifish/light-tab-page):
  Source of custom wallpaper storage implementation.

## License

This project is open-sourced under the AGPL-3.0 License, except for trademark-related images in `entrypoints/newtab/assets`.

### Modification Notice

**This work was modified by [L1uZQ](https://github.com/L1uZQ) on 2026-10-26.**
The upstream [lemon-new-tab](https://github.com/Redlnn/lemon-new-tab) is copyright
[Red_lnn](https://github.com/Redlnn).

In accordance with section 5 of the AGPL-3.0, this derivative keeps all upstream copyright notices and the
license while modifying the following: product name and UI copy, application icon, author and homepage in
`wxt.config.ts`, developer links and contact details in the About/Help dialogs, and the default directory and
product identifier used for WebDAV sync vaults and backups. The complete modification history is in this
repository's Git log.

> This project has been open-sourced under the AGPL-3.0 License since version v3.2.3 (commit 65a894c0d8009d274618c5004a634d7359b2b0a6). Previous versions were open-sourced under the MIT License.
