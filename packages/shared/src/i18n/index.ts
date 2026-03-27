import type { II18n, I18nOptions, LocaleMessages } from './types'

function deepMerge(target: LocaleMessages, source: LocaleMessages): LocaleMessages {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = result[key]
    if (
      typeof sourceValue === 'object' && 
      sourceValue !== null && 
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' && 
      targetValue !== null && 
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue)
    } else {
      result[key] = sourceValue
    }
  }
  return result
}

export function createI18n(options: I18nOptions = {}): II18n {
  const {
    locale = 'en',
    fallbackLocale = 'en',
    messages = {}
  } = options

  const _messages: Record<string, LocaleMessages> = { ...messages }
  let _locale = locale

  function t(key: string, params?: Record<string, any>): string {
    const message = getMessage(_messages[_locale], key) 
      || getMessage(_messages[fallbackLocale], key) 
      || key
    
    return interpolate(message, params)
  }

  function getMessage(messages: LocaleMessages | undefined, key: string): string | undefined {
    if (!messages) return undefined
    const keys = key.split('.')
    let result: any = messages
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return undefined
      }
    }
    
    return typeof result === 'string' ? result : undefined
  }

  function interpolate(message: string, params?: Record<string, any>): string {
    if (!params) return message
    return message.replace(/\{(\w+)\}/g, (_, key) => 
      params[key] !== undefined ? String(params[key]) : `{${key}}`
    )
  }

  return {
    get locale() { return _locale },
    t,
    setLocale: (newLocale: string) => { _locale = newLocale },
    addMessages: (locale: string, messages: LocaleMessages) => {
      _messages[locale] = _messages[locale] 
        ? deepMerge(_messages[locale], messages) 
        : messages
    }
  }
}

export * from './types'
export * from './locales/en'
export * from './locales/zh-CN'
