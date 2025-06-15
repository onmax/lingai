import { defineConfig, presetIcons, presetWind4, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons(),
    presetTypography(),
  ],
})
