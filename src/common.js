export const formatURL = (url) =>  {
  const re = /^(?:https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/\n]+)/
  return re.exec(url)[1] || url
}

export const getEntryByLocales = (locales, key) => {
  if (Array.isArray(key)) {
    let localesString = false
    for (const i in locales) {
      localesString = key.find(value =>
        value['@language'] === locales[i]
      )
      if (localesString) {
        return localesString['@value']
      }
    }
    return key[0]['@value']
  }
}

export const getTitle = (data, locales=['en']) => (
  data.about && (data.about.name || data.about['@id'])
    ? getEntryByLocales(locales, data.about.name) || data.about['@id']
    : data.totalItems + " Entries"
)

export const getParams = (qstring) => {
  const params = {}
  if (qstring) {
    const q = qstring.replace('?', '').split('&')
    for (let i = 0; i < q.length; ++i) {
      const [param, val] = q[i].split('=', 2).map(
        s => decodeURIComponent(s).replace(/\+/g, " ")
      )
      if (!val) {
        params[param] = ""
      } else if (params[param] instanceof Array) {
        params[param].push(val)
      } else if (params[param]) {
        params[param] = [params[param], val]
      } else {
        params[param] = val
      }
    }
  }
  return params
}

export const getURL = (route) => {
  let url = route.path
  let params = []
  for (const param in route.params) {
    const value = encodeURIComponent(route.params[param])
    if (Array.isArray(value)) {
      value && (params = params.concat(value.map(value => `${param}=${value}`)))
    } else {
      value && params.push(`${param}=${value}`)
    }
  }
  if (params) {
    url += `?${params.join('&')}`
  }
  if (route.hash) {
    url += `#${route.hash}`
  }
  return url
}

export const triggerClick = (e) => {
  if (e.keyCode === 32) {
    e.target.click()
  }
}

export default {
  getTitle, formatURL, getParams, getURL, getEntryByLocales, triggerClick
}