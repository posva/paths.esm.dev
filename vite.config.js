// @ts-check
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// These build tools are imported by /unplugin but are not used by the tree.
const nodeOnlyExports = {
  unplugin: ['createUnplugin'],
  'local-pkg': ['isPackageExists'],
  'node:fs': ['promises'],
  tinyglobby: ['glob'],
  '@vue-macros/common': [
    'MagicString',
    'babelParse',
    'checkInvalidScopeReference',
    'generateTransform',
    'getLang',
    'isCallOf',
    'parseSFC',
    'walkAST',
  ],
  '@vue/compiler-sfc': ['parse'],
  chokidar: ['watch'],
  mlly: ['findStaticImports', 'parseStaticImport'],
}

const routerTree = {
  name: 'router-tree-browser',
  enforce: /** @type {const} */ ('pre'),
  resolveId(id) {
    if (Object.hasOwn(nodeOnlyExports, id)) return '\0router-tree-mock:' + id
  },
  load(id) {
    const name = id.replace('\0router-tree-mock:', '')
    if (!Object.hasOwn(nodeOnlyExports, name)) return
    const exports = nodeOnlyExports[name]
      .map((key) => `export const ${key} = () => undefined;`)
      .join('\n')
    return exports + '\nexport default {}'
  },
  transform(code, id) {
    if (!id.includes('vue-router/dist/')) return
    return code
      .replaceAll('process.cwd()', JSON.stringify('/'))
      .replaceAll('process.env.CI', 'false')
      .replace('= createUnplugin(', '= /*#__PURE__*/ createUnplugin(')
  },
}

export default defineConfig({
  optimizeDeps: {
    include: ['focus-trap', 'focus-trap-vue'],
    rolldownOptions: { plugins: [routerTree] },
  },
  plugins: [routerTree, Vue(), tailwindcss()],
})
