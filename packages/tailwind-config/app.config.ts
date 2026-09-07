export default defineAppConfig({
  elsfsComponents: {
    name: 'Hello from Nuxt layer'
  }
})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    elsfsComponents?: {
      /** Project name */
      name?: string
    }
  }
}
