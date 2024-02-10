import path from 'path'
import {type ManifestData} from '../../types'

export default function browserActionThemeIcon(
  manifestPath: string,
  manifest: ManifestData
): Array<{light: string; dark: string}> | undefined {
  if (
    !manifest ||
    !manifest.browser_action ||
    !manifest.browser_action.theme_icons
  ) {
    return undefined
  }

  const context = path.dirname(manifestPath)
  for (const themeIcon of manifest.browser_action.theme_icons) {
    if (themeIcon.light) {
      const lightThemeIconAbsolutePath = path.resolve(context, themeIcon.light)
      themeIcon.light = lightThemeIconAbsolutePath
    }

    if (themeIcon.dark) {
      const darkThemeIconAbsolutePath = path.resolve(context, themeIcon.dark)
      themeIcon.dark = darkThemeIconAbsolutePath
    }

    if (themeIcon.size) delete themeIcon.size
  }

  return manifest.browser_action.theme_icons
}
