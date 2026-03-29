import type {
  FormSchema,
  FormState,
  FormOptions,
  FieldSchema,
  FieldState,
  ValidationResult,
  FormValidationResult,
  ReactionConfig,
} from '@d-form/shared'
import { Field } from './field'
import { Reaction, createReaction } from './reaction'
import { validateForm, validateFieldAsync } from '../validation'

type AnyObject = Record<string, any>

interface InternalFormOptions {
  initialValues?: AnyObject
  schema?: FormSchema
  zodSchema?: any
  onSubmit?: (values: AnyObject) => Promise<void> | void
  onValuesChange?: (values: AnyObject, changedPath: string) => void
  validateOnBlur?: boolean
  validateOnChange?: boolean
}

export class Form {
  private _values: AnyObject
  private _initialValues: AnyObject
  private _fields: Map<string, Field> = new Map()
  private _state: FormState<AnyObject>
  private _options: InternalFormOptions
  private _zodSchema?: any
  private _reactions: Reaction[] = []

  constructor(options?: InternalFormOptions) {
    this._options = options || {}
    this._zodSchema = options?.zodSchema

    const initialValues = options?.initialValues || {}
    const schemaDefaults = this._extractSchemaDefaults(options?.schema)

    this._initialValues = { ...schemaDefaults, ...initialValues }
    this._values = { ...this._initialValues }

    this._state = {
      values: this._values,
      errors: {},
      touched: {},
      dirty: false,
      submitting: false,
      isValid: true,
      validating: false,
      submitted: false,
      submitCount: 0,
    }

    if (options?.schema) {
      this._registerSchemaFields(options.schema)
      this._setupSchemaReactions(options.schema)
    }
  }

  /** Get expression scope from schema.scope */
  getContext(): Record<string, any> {
    return this._options.schema?.scope || {}
  }

  private _extractSchemaDefaults(schema?: FormSchema): AnyObject {
    if (!schema?.properties) return {}

    const defaults: AnyObject = {}
    for (const [key, fieldSchema] of Object.entries(schema.properties)) {
      if (fieldSchema.default !== undefined) {
        defaults[key] = fieldSchema.default
      }
    }
    return defaults
  }

  private _registerSchemaFields(schema: FormSchema): void {
    if (!schema.properties) return

    for (const [key, fieldSchema] of Object.entries(schema.properties)) {
      this.registerField(key, fieldSchema)
    }
  }

  private _setupSchemaReactions(schema: FormSchema): void {
    if (!schema.properties) return

    // Field-level reactions
    for (const [key, fieldSchema] of Object.entries(schema.properties)) {
      if (fieldSchema.reactions?.length) {
        for (const reactionConfig of fieldSchema.reactions) {
          const reaction = this._createReactionFromConfig(key, reactionConfig)
          if (reaction) {
            this._reactions.push(reaction)
          }
        }
      }
    }

    // Form-level reactions
    if (schema.reactions?.length) {
      for (const reactionSchema of schema.reactions) {
        // Form-level reactions without a source field use first dependency as source
        const sourceField = reactionSchema.dependencies?.[0] || ''
        if (!sourceField) continue
        const reaction = this._createReactionFromConfig(sourceField, reactionSchema)
        if (reaction) {
          this._reactions.push(reaction)
        }
      }
    }
  }

  private _createReactionFromConfig(sourceField: string, config: ReactionConfig): Reaction | null {
    // Ensure source field exists
    if (!this._fields.has(sourceField)) {
      this.registerField(sourceField)
    }
    try {
      return createReaction(this, sourceField, config)
    } catch (e) {
      console.warn(`Failed to create reaction for "${sourceField}":`, e)
      return null
    }
  }

  /** Dispose all reactions (cleanup) */
  dispose(): void {
    for (const reaction of this._reactions) {
      reaction.dispose()
    }
    this._reactions = []
  }

  getState(): FormState<AnyObject> {
    return { ...this._state }
  }

  setState(partial: Partial<FormState<AnyObject>>): void {
    Object.assign(this._state, partial)
  }

  getValues(): AnyObject {
    return { ...this._values }
  }

  setValues(values: AnyObject): void {
    this._values = { ...values }
    this._state.values = this._values
    this._updateDirtyState()
  }

  getFieldValue(path: string): any {
    return this._getValueByPath(this._values, path)
  }

  setFieldValue(path: string, value: any): void {
    const oldValue = this.getFieldValue(path)
    if (oldValue === value) return

    this._setValueByPath(this._values, path, value)
    this._state.values = this._values

    const field = this._fields.get(path)
    if (field) {
      field.setValue(value)
    }

    this._updateDirtyState()

    if (this._options.onValuesChange) {
      this._options.onValuesChange(this.getValues(), path)
    }
  }

  getFieldState(path: string): FieldState | undefined {
    const field = this._fields.get(path)
    return field?.getState()
  }

  setFieldState(path: string, state: Partial<FieldState>): void {
    const field = this._fields.get(path)
    if (field) {
      field.setState(state)
      if (state.value !== undefined) {
        this._setValueByPath(this._values, path, state.value)
        this._state.values = this._values
      }
      this._updateDirtyState()
    }
  }

  getFieldError(path: string): string | undefined {
    return this._state.errors[path]
  }

  setFieldError(path: string, error: string | undefined): void {
    if (error === undefined) {
      delete this._state.errors[path]
    } else {
      this._state.errors[path] = error
    }
    this._updateValidState()
  }

  getErrors(): Record<string, string> {
    const errors: Record<string, string> = {}
    for (const [key, value] of Object.entries(this._state.errors)) {
      if (value !== undefined) {
        errors[key] = value
      }
    }
    return errors
  }

  setFieldTouched(path: string, touched: boolean): void {
    this._state.touched[path] = touched

    const field = this._fields.get(path)
    if (field) {
      field.setTouched(touched)
    }
  }

  clearErrors(): void {
    this._state.errors = {}
    this._updateValidState()

    this._fields.forEach((field) => {
      field.setError(undefined)
    })
  }

  registerField(path: string, schema?: FieldSchema): Field {
    let field = this._fields.get(path)

    if (!field) {
      field = new Field(this, path, schema)
      this._fields.set(path, field)

      const currentValue = this.getFieldValue(path)
      if (currentValue === undefined && schema?.default !== undefined) {
        this._setValueByPath(this._values, path, schema.default)
        this._state.values = this._values
      }
    }

    return field
  }

  unregisterField(path: string): void {
    this._fields.delete(path)
  }

  hasField(path: string): boolean {
    return this._fields.has(path)
  }

  getField(path: string): Field | undefined {
    return this._fields.get(path)
  }

  getFieldNames(): string[] {
    return Array.from(this._fields.keys())
  }

  getInitialValue(path: string): any {
    return this._getValueByPath(this._initialValues, path)
  }

  async submit(onSubmit?: () => Promise<void>): Promise<void> {
    this._state.submitting = true

    this._fields.forEach((field) => field.setTouched(true))

    const validationResult = await this.validate()

    if (!validationResult.valid) {
      this._state.submitting = false
      return
    }

    try {
      if (onSubmit) {
        await onSubmit()
      } else if (this._options.onSubmit) {
        await this._options.onSubmit(this.getValues())
      }

      this._state.submitCount++
      this._state.submitted = true
    } finally {
      this._state.submitting = false
    }
  }

  reset(): void {
    this._values = { ...this._initialValues }
    this._state.values = this._values
    this._state.errors = {}
    this._state.touched = {}
    this._state.dirty = false
    this._state.submitting = false
    this._state.validating = false
    this._state.isValid = true

    this._fields.forEach((field) => {
      field._setInitialValue(this._getValueByPath(this._initialValues, field.meta.path))
      field.reset()
    })
  }

  async validate(): Promise<FormValidationResult> {
    if (this._zodSchema) {
      return this._validateWithZod()
    }

    this._state.validating = true

    const fieldResults: Record<string, ValidationResult> = {}
    const allErrors: string[] = []
    let isValid = true

    for (const [path, field] of this._fields) {
      if (
        field.getState().visible === false &&
        field.meta.schema?.validation?.validateVisibleOnly
      ) {
        continue
      }

      const result = await validateFieldAsync(field, path)
      fieldResults[path] = result

      if (!result.valid) {
        isValid = false
        allErrors.push(...result.errors)
      }

      this.setFieldError(path, result.valid ? undefined : result.errors[0])
    }

    this._state.isValid = isValid
    this._state.validating = false

    return {
      valid: isValid,
      fields: fieldResults,
      errors: allErrors,
    }
  }

  async validateField(path: string): Promise<ValidationResult> {
    const field = this._fields.get(path)
    if (!field) {
      return { valid: true, errors: [] }
    }

    if (this._zodSchema) {
      return this._validateFieldWithZod(path)
    }

    return validateFieldAsync(field, path)
  }

  private async _validateWithZod(): Promise<FormValidationResult> {
    const fieldResults: Record<string, ValidationResult> = {}
    const allErrors: string[] = []
    let isValid = true

    for (const [path, field] of this._fields) {
      fieldResults[path] = { valid: true, errors: [] }
      field.setError(undefined)
    }

    try {
      await this._zodSchema.parseAsync(this._values)
    } catch (error: any) {
      isValid = false

      const zodErrors = error.issues || error.errors || []
      for (const zodError of zodErrors) {
        const path = zodError.path.join('.')
        allErrors.push(zodError.message)

        if (!fieldResults[path]) {
          fieldResults[path] = { valid: false, errors: [] }
        }
        fieldResults[path].errors.push(zodError.message)
        fieldResults[path].valid = false

        const field = this._fields.get(path)
        if (field) {
          field.setError(zodError.message)
        }
      }
    }

    this._state.isValid = isValid

    return {
      valid: isValid,
      fields: fieldResults,
      errors: allErrors,
    }
  }

  private async _validateFieldWithZod(path: string): Promise<ValidationResult> {
    try {
      const value = this.getFieldValue(path)
      const partialSchema = this._zodSchema.shape[path]

      if (partialSchema) {
        await partialSchema.parseAsync(value)
      }

      const field = this._fields.get(path)
      if (field) {
        field.setError(undefined)
      }

      return { valid: true, errors: [] }
    } catch (error: any) {
      const messages = error.errors?.map((e: any) => e.message) || ['Validation failed']

      const field = this._fields.get(path)
      if (field) {
        field.setError(messages[0])
      }

      return { valid: false, errors: messages }
    }
  }

  _notifyFieldValueChange(path: string, value: any): void {
    if (this._options.onValuesChange) {
      this._options.onValuesChange(this.getValues(), path)
    }
  }

  private _getValueByPath(obj: any, path: string): any {
    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined
      }
      current = current[part]
    }

    return current
  }

  private _setValueByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.')
    let current = obj

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (current[part] === undefined || current[part] === null) {
        current[part] = {}
      }
      current = current[part]
    }

    current[parts[parts.length - 1]] = value
  }

  private _updateDirtyState(): void {
    let isDirty = false

    for (const [path, field] of this._fields) {
      if (field.getState().dirty) {
        isDirty = true
        break
      }
    }

    this._state.dirty = isDirty
  }

  private _updateValidState(): void {
    this._state.isValid = Object.keys(this._state.errors).length === 0
  }
}

export function createForm(options?: FormOptions<AnyObject> & { zodSchema?: any }): Form {
  return new Form({
    initialValues: options?.initialValues,
    schema: options?.schema,
    zodSchema: (options as any)?.zodSchema,
    onSubmit: options?.onSubmit,
    onValuesChange: options?.onValuesChange,
    validateOnBlur: options?.validateOnBlur,
    validateOnChange: options?.validateOnChange,
  })
}
