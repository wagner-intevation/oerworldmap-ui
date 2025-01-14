import dotenv from 'dotenv'
import getenv from 'getenv'

// load env file
dotenv.config()

export const mapboxConfig = getenv.multi({
  token: 'MAPBOX_ACCESS_TOKEN',
  style: 'MAPBOX_STYLE',
  miniMapStyle: 'MAPBOX_MINIMAP_STYLE',
})

export const elasticsearchConfig = getenv.multi({
  index: 'ELASTICSEARCH_INDEX',
  url: 'ELASTICSEARCH_URL',
})

export const apiConfig = getenv.multi({
  host: 'API_HOST',
  port: ['API_PORT', ''],
  scheme: ['API_SCHEME', 'http'],
})

export const uiConfig = getenv.multi({
  host: 'UI_SERVER_HOST',
  port: ['UI_SERVER_PORT', ''],
})

export const piwikConfig = getenv.multi({
  id: ['PIWIK_ID', ''],
  url: ['PIWIK_URL', ''],
})

export const i18nConfig = getenv.multi({
  supportedLanguages: ['LANG_SUPPORTED', 'en'],
  defaultLanguage: ['LANG_DEFAULT', 'en'],
})

// export server configuration
export default getenv.multi({
  env: 'NODE_ENV',
  host: 'SERVER_HOST',
  port: 'SERVER_PORT',
})
