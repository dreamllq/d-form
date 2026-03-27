import { describe, it, expect } from 'vitest'
import { createI18n } from '../i18n'
import { en } from '../i18n/locales/en'
import { zhCN } from '../i18n/locales/zh-CN'

describe('createI18n', () => {
  describe('basic translation', () => {
    it('should return translated message for existing key', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en }
      })
      
      expect(i18n.t('form.submit')).toBe('Submit')
      expect(i18n.t('form.reset')).toBe('Reset')
      expect(i18n.t('form.cancel')).toBe('Cancel')
    })

    it('should return key itself when message not found', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en }
      })
      
      expect(i18n.t('nonexistent.key')).toBe('nonexistent.key')
    })
  })

  describe('interpolation', () => {
    it('should interpolate parameters into message', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en }
      })
      
      expect(i18n.t('validation.required', { field: 'Username' }))
        .toBe('Username is required')
      
      expect(i18n.t('validation.minLength', { field: 'Password', min: '8' }))
        .toBe('Password must be at least 8 characters')
    })

    it('should handle multiple interpolation parameters', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en }
      })
      
      expect(i18n.t('validation.maxLength', { field: 'Bio', max: '500' }))
        .toBe('Bio must be at most 500 characters')
    })

    it('should keep placeholder when parameter is missing', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en }
      })
      
      expect(i18n.t('validation.required', {}))
        .toBe('{field} is required')
    })
  })

  describe('fallback locale', () => {
    it('should use fallback locale when key not found in current locale', () => {
      const i18n = createI18n({
        locale: 'zh-CN',
        fallbackLocale: 'en',
        messages: { 'zh-CN': zhCN, en }
      })
      
      // Chinese translation exists
      expect(i18n.t('form.submit')).toBe('提交')
      
      // Switch to a locale without the key, should fallback to en
      i18n.setLocale('fr')
      expect(i18n.t('form.submit')).toBe('Submit')
    })
  })

  describe('locale switching', () => {
    it('should switch locale dynamically', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en, 'zh-CN': zhCN }
      })
      
      expect(i18n.locale).toBe('en')
      expect(i18n.t('form.submit')).toBe('Submit')
      
      i18n.setLocale('zh-CN')
      
      expect(i18n.locale).toBe('zh-CN')
      expect(i18n.t('form.submit')).toBe('提交')
    })
  })

  describe('addMessages', () => {
    it('should add new messages dynamically', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en }
      })
      
      i18n.addMessages('en', {
        custom: {
          hello: 'Hello, {name}!'
        }
      })
      
      expect(i18n.t('custom.hello', { name: 'World' }))
        .toBe('Hello, World!')
    })

    it('should add messages for new locale', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en }
      })
      
      i18n.addMessages('ja', {
        form: {
          submit: '送信'
        }
      })
      
      i18n.setLocale('ja')
      expect(i18n.t('form.submit')).toBe('送信')
    })

    it('should merge messages with existing ones', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: { en }
      })
      
      // First addition
      i18n.addMessages('en', {
        custom: {
          key1: 'Value 1'
        }
      })
      
      // Second addition - should merge
      i18n.addMessages('en', {
        custom: {
          key2: 'Value 2'
        }
      })
      
      expect(i18n.t('custom.key1')).toBe('Value 1')
      expect(i18n.t('custom.key2')).toBe('Value 2')
    })
  })

  describe('default options', () => {
    it('should use default locale "en" when not specified', () => {
      const i18n = createI18n()
      
      expect(i18n.locale).toBe('en')
    })

    it('should use default fallback locale "en" when not specified', () => {
      const i18n = createI18n({
        locale: 'fr'
      })
      
      i18n.addMessages('en', {
        test: 'Test message'
      })
      
      expect(i18n.t('test')).toBe('Test message')
    })
  })
})
