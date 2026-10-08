# Dependency upgrade

Reviewed on 2026-10-08. Updates were installed and checked in three groups.

| Group       | Versions                                                                              | Checks                                                              |
| ----------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Runtime     | Vue and compiler-sfc 3.5.43, Vue Router 5.4.0, focus-trap 8.2.3, focus-trap-vue 4.1.0 | Build, formatting, route results, share URL, dialog keyboard focus  |
| Build tools | Vite 8.3.4, plugin-vue 6.0.9, cross-env 10.1.0, Prettier 3.9.9                        | Build, formatting, development server, saved share URL              |
| Styles      | Tailwind CSS and its Vite plugin 4.3.3                                                | Build, formatting, browser styles, complete route and dialog checks |

TypeScript is constrained to `~6.0.3`. clipboard-text 2.0.0, json5 2.2.3,
lz-string 1.5.0, and shapify 1.1.0 were already current.

## Release notes and migration decisions

- [Vue changelog](https://github.com/vuejs/core/blob/main/CHANGELOG.md): no source migration needed for the APIs used here. The runtime and compiler versions match.
- [Vue Router 5 migration](https://router.vuejs.org/guide/migration/v4-to-v5.html) and [changelog](https://github.com/vuejs/router/blob/main/packages/router/CHANGELOG.md): the existing router and matcher APIs remain supported. The experimental router query changes do not apply here.
- [focus-trap changelog](https://github.com/focus-trap/focus-trap/blob/master/CHANGELOG.md) and [Vue wrapper changelog](https://github.com/posva/focus-trap-vue/blob/main/CHANGELOG.md): version 8 changes activation hook timing. The app does not use the affected hook. The wrapper still declares a version 7 peer. A scoped `peerDependencyRules.allowedVersions` entry accepts version 8.2.3 and later version 8 releases. Browser checks verified initial focus, keyboard trapping, Escape, and focus restoration.
- Vite migration guides for [5](https://v5.vite.dev/guide/migration), [6](https://v6.vite.dev/guide/migration), [7](https://v7.vite.dev/guide/migration), and [8](https://vite.dev/guide/migration), plus the [Vue plugin changelog](https://github.com/vitejs/vite-plugin-vue/blob/main/packages/plugin-vue/CHANGELOG.md): use ESM configuration and Node.js 20.19+ or 22.12+. CI now uses Node.js 24. Vite 8 uses Rolldown and Oxc.
- [cross-env 10 release](https://github.com/kentcdodds/cross-env/releases/tag/v10.0.0): ESM and Node.js 20+ are required. The existing CLI command remains supported.
- [Prettier 3 release](https://prettier.io/blog/2023/07/05/3.0.0) and [changelog](https://github.com/prettier/prettier/blob/3.9.9/CHANGELOG.md): retain the explicit formatting options and apply the new nested-conditional layout in `safe64.ts`.
- [Tailwind 4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide) and [changelog](https://github.com/tailwindlabs/tailwindcss/blob/main/CHANGELOG.md): use the Vite plugin and CSS import. Remove the old PostCSS and empty Tailwind configurations, autoprefixer, and direct postcss dependency. Preserve the previous default borders, placeholders, button cursors, shadow scale, font stack, and color palette. Replace `w-100` with `w-full`: Tailwind 4 defines `w-100` as 400 px, which collapsed the layout. Tailwind 4 requires Safari 16.4+, Chrome 111+, and Firefox 128+.
- [TypeScript 6 release](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/): remove deprecated `baseUrl`, use relative path mappings, and select `moduleResolution: bundler`. Remove the uninstalled legacy Vue editor plugin.
- Remove `@types/lz-string`: its deprecation notice states that lz-string supplies its own types.

## Final validation

- `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run typecheck`, and `pnpm run build` pass.
- `pnpm outdated` lists only TypeScript 6.0.3 versus version 7.0.2.
- Browser checks cover static ranking, dynamic/optional/repeated parameters, invalid patterns, strict and case-sensitive highlights, URL state restoration, import, and dialog focus.
- Type errors in TypeScript sources and Vue templates are fixed. `pnpm run typecheck` uses vue-tsc 3.3.12 with TypeScript 6 and runs in CI. The [Vue language-tools changelog](https://github.com/vuejs/language-tools/blob/master/CHANGELOG.md) was reviewed before adding the checker.
- Encoding checks cover empty strings, padding, Unicode, and UTF-16 surrogate code units. Browser checks verify route hot reload and removal, plus valid and invalid matcher rendering.
- Compared geometry and computed styles against `https://paths.esm.dev` at widths of 390, 768, 1024, 1280, and 1440 px. All 88 default-page elements match. Dialogs match at mobile, tablet, and desktop widths; import errors, matching/error cards, and hover states also match. The comparison covers geometry, fonts, spacing, borders, colors, and outlines.

## Behavior change

Vue Router 5 omits absent optional parameters. For `/optional/:id?` matched
against `/optional`, version 4.2.4 returned `{ id: '' }`; version 5.4.0 returns
`{}`. The app now displays that no parameters were found. Dynamic parameters
and repeated parameter arrays retain their values. This was verified with
both installed router versions.

## Package manager

The project now pins pnpm 12.10.1. Release notes for pnpm 9, 10, 11, and 12
were reviewed before regenerating the lockfile in format 9. The generated
lockfile also records the package manager dependencies.

- Move the scoped focus-trap peer rule from `package.json` to
  `pnpm-workspace.yaml`, as required by pnpm 11 and newer.
- Use `pnpm/action-setup@v6` in CI. Its version 6.1 release adds pnpm 12
  support; it reads the pinned version from `package.json`.
- pnpm added exact release-age exceptions for the already tested Vite 8.3.4
  and Vue Router 5.4.0 releases. Other packages retain the default 24-hour
  release-age check. No dependency build scripts needed approval.
- Frozen install, peer checks, Vue type checking, formatting, and production
  build pass with pnpm 12.10.1. TypeScript remains at 6.0.3.

Sources: [pnpm 9](https://github.com/pnpm/pnpm/releases/tag/v9.0.0),
[pnpm 10](https://github.com/pnpm/pnpm/releases/tag/v10.0.0),
[pnpm 11](https://github.com/pnpm/pnpm/releases/tag/v11.0.0),
[pnpm 12](https://github.com/pnpm/pnpm/releases/tag/v12.0.0),
[pnpm 12.10.1](https://github.com/pnpm/pnpm/releases/tag/v12.10.1), and
[pnpm/action-setup 6.1](https://github.com/pnpm/action-setup/releases/tag/v6.1.0).
