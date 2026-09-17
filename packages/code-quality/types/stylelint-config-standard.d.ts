/**
 * stylelint-config-standard@40 未随包提供类型声明，这里补一份最小声明。
 */
declare module 'stylelint-config-standard' {
  import type { Config } from 'stylelint'

  const config: Config
  export default config
}
