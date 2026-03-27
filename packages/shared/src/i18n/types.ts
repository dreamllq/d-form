export interface LocaleMessages {
  [key: string]: string | LocaleMessages
}

export interface I18nOptions {
  locale?: string
  fallbackLocale?: string
  messages?: Record<string, LocaleMessages>
}

export interface II18n {
  locale: string
  t: (key: string, params?: Record<string, any>) => string
  setLocale: (locale: string) => void
  addMessages: (locale: string, messages: LocaleMessages) => void
}
