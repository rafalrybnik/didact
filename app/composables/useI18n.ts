import pl from '~/lang/pl.json'

type TranslationKeys = typeof pl
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never

type TranslationKey = NestedKeyOf<TranslationKeys>

export function useI18n() {
  const locale = ref('pl')
  const translations = { pl }

  function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.')
    let value: unknown = translations[locale.value as keyof typeof translations]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key is not a string: ${key}`)
      return key
    }

    // Replace params like {name} with actual values
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return String(params[paramKey] ?? `{${paramKey}}`)
      })
    }

    return value
  }

  return {
    locale,
    t,
  }
}
