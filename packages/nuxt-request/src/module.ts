import {defineNuxtModule, addPlugin, createResolver, addImportsDir} from '@nuxt/kit'

// Module options TypeScript interface definition
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-request',
    configKey: 'nuxtRequest',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.js` after `npm run prepack`
    addImportsDir(resolver.resolve('./runtime/plugin'))
  },
})
