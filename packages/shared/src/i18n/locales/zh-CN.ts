import type { LocaleMessages } from '../types'

export const zhCN: LocaleMessages = {
  validation: {
    required: '{field}是必填项',
    minLength: '{field}至少需要{min}个字符',
    maxLength: '{field}最多{max}个字符',
    pattern: '{field}格式无效',
    email: '{field}必须是有效的邮箱地址',
    min: '{field}不能小于{min}',
    max: '{field}不能大于{max}'
  },
  form: {
    submit: '提交',
    reset: '重置',
    cancel: '取消'
  }
}
