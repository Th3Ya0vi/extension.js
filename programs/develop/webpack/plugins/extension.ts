// ██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗
// ██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗
// ██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝
// ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔═══╝
// ██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║
// ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝

import path from 'path'
import webpack from 'webpack'
import type {DevOptions} from '../../extensionDev'

// Plugins
import ResolvePlugin from 'webpack-browser-extension-resolve-plugin'
import ManifestPlugin from 'webpack-browser-extension-manifest-plugin'
import HtmlPlugin from 'webpack-browser-extension-html-plugin'
import ScriptsPlugin from 'webpack-browser-extension-scripts-plugin'
import LocalesPlugin from 'webpack-browser-extension-locales-plugin'
import JsonPlugin from 'webpack-browser-extension-json-plugin'
import IconsPlugin from 'webpack-browser-extension-icons-plugin'
import ResourcesPlugin from 'webpack-browser-extension-resources-plugin'

// Config
import {
  getStaticFolderPath,
  getPagesFolderPath,
  getScriptsFolderPath
} from '../config/userOptions'

export default function extensionPlugins(
  projectPath: string,
  {polyfill, browser}: DevOptions
) {
  const manifestPath = path.resolve(projectPath, 'manifest.json')

  return {
    name: 'extensionPlugins',
    apply: (compiler: webpack.Compiler) => {
      new ResolvePlugin({
        manifestPath,
        exclude: [getStaticFolderPath(projectPath)]
      }).apply(compiler)

      // Generate a manifest file with all the assets we need
      new ManifestPlugin({
        browser,
        manifestPath,
        exclude: [getStaticFolderPath(projectPath)]
      }).apply(compiler)

      // Get every field in manifest that allows an .html file
      new HtmlPlugin({
        manifestPath,
        // TODO: cezaraugusto
        // include: [...getPagesFolderPath(projectPath)],
        exclude: [getStaticFolderPath(projectPath)]
      }).apply(compiler)

      // Get all scripts (bg, content, sw) declared in manifest
      new ScriptsPlugin({
        manifestPath,
        include: [...getScriptsFolderPath(projectPath)],
        exclude: [getStaticFolderPath(projectPath)]
      }).apply(compiler)

      // Get locales
      new LocalesPlugin({manifestPath}).apply(compiler)

      // Grab all JSON assets from manifest except _locales
      new JsonPlugin({
        manifestPath,
        exclude: [getStaticFolderPath(projectPath)]
      }).apply(compiler)

      // Grab all icon assets from manifest including popup icons
      new IconsPlugin({
        manifestPath,
        exclude: [getStaticFolderPath(projectPath)]
      }).apply(compiler)

      // Grab all resources from script files
      // (background, content_scripts, service_worker)
      // and add them to the assets bundle.
      new ResourcesPlugin({
        manifestPath
        // exclude: [getStaticFolderPath(projectPath)]
      }).apply(compiler)

      // Allow browser polyfill as needed
      // TODO: move this to webpack-browser-extension-polyfill plugin.
      if (polyfill) {
        if (browser !== 'firefox') {
          new webpack.ProvidePlugin({
            browser: require.resolve('webextension-polyfill')
          }).apply(compiler)
        }
      }
    }
  }
}
