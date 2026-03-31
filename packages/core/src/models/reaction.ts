import type { ReactionConfig, ReactionEffect, FieldState } from '@d-form/shared'
import { compile, isExpression } from '../expression'
import type { Form } from './form'

type Unsubscribe = () => void

export class Reaction {
  private form: Form
  private config: ReactionConfig
  private sourceField: string
  private disposed = false
  private unsubscribers: Unsubscribe[] = []

  constructor(form: Form, sourceField: string, config: ReactionConfig) {
    this.form = form
    this.sourceField = sourceField
    this.config = config
    this._checkCircularDependencies()
    this.setup()
  }

  private _checkCircularDependencies(): void {
    const targets = this.getTargets()
    const deps = this.config.dependencies || []

    for (const target of targets) {
      if (deps.includes(target)) {
        throw new Error(
          `Circular dependency detected: field "${target}" is both a dependency and a target of reaction on "${this.sourceField}"`
        )
      }
    }

    if (targets.includes(this.sourceField) && deps.includes(this.sourceField)) {
      throw new Error(`Circular dependency detected: field "${this.sourceField}" depends on itself`)
    }
  }

  private setup(): void {
    if (this.config.dependencies) {
      for (const dep of this.config.dependencies) {
        const field = this.form.getField(dep)
        if (field) {
          const unsub = field.on('valueChange', () => this.run())
          this.unsubscribers.push(unsub)
        }
      }
    }

    const targets = this.getTargets()
    const selfIsTarget = targets.includes(this.sourceField)
    const hasWhen = this.config.when !== undefined

    if (!selfIsTarget || hasWhen) {
      const source = this.form.getField(this.sourceField)
      if (source) {
        const unsub = source.on('valueChange', () => this.run())
        this.unsubscribers.push(unsub)
      }
    }

    if (hasWhen) {
      this.run()
    }
  }

  run(): void {
    if (this.disposed) return

    const scope = this.createScope()
    const shouldFulfill = this.evaluateCondition(scope)

    if (shouldFulfill) {
      this.applyEffect(this.config.fulfill, scope)
    } else if (this.config.otherwise) {
      this.applyEffect(this.config.otherwise, scope)
    }
  }

  private createScope(): Record<string, any> {
    const sourceField = this.form.getField(this.sourceField)
    const $self = sourceField?.getState() || {}
    const $values = this.form.getValues()
    const $form = this.form

    const $deps = this.config.dependencies?.map((dep) => this.form.getFieldValue(dep)) || []

    return {
      $self,
      $values,
      $form,
      $deps,
      $dependencies:
        this.config.dependencies?.reduce(
          (acc, dep) => {
            acc[dep] = this.form.getFieldValue(dep)
            return acc
          },
          {} as Record<string, any>
        ) || {},
      ...this.form.getContext(),
    }
  }

  private evaluateCondition(scope: Record<string, any>): boolean {
    if (!this.config.when) return true

    if (isExpression(this.config.when)) {
      const result = compile(this.config.when, scope)
      return Boolean(result)
    }

    return Boolean(this.config.when)
  }

  private applyEffect(effect: ReactionEffect | undefined, scope: Record<string, any>): void {
    if (!effect) return

    const targets = this.getTargets()

    for (const targetPath of targets) {
      const field = this.form.getField(targetPath)
      if (!field) continue

      if (effect.state) {
        const stateChanges: Partial<FieldState> = {}
        for (const [key, value] of Object.entries(effect.state)) {
          const resolvedValue = this.resolveValue(value, scope)
          stateChanges[key as keyof FieldState] = resolvedValue
        }
        this.form.setFieldState(targetPath, stateChanges)
      }

      if (effect.schema && field.meta.schema) {
        const resolved = this.resolveSchema(effect.schema, scope)
        field.updateSchema(resolved)
      }

      if (effect.run) {
        compile(effect.run, scope)
      }
    }
  }

  private getTargets(): string[] {
    if (this.config.target) {
      return Array.isArray(this.config.target) ? this.config.target : [this.config.target]
    }
    return [this.sourceField]
  }

  private resolveValue(value: any, scope: Record<string, any>): any {
    if (typeof value === 'string' && isExpression(value)) {
      return compile(value, scope)
    }
    return value
  }

  private resolveSchema(schema: any, scope: Record<string, any>): any {
    if (typeof schema === 'string') {
      return isExpression(schema) ? compile(schema, scope) : schema
    }
    if (Array.isArray(schema)) {
      return schema.map((item) => this.resolveSchema(item, scope))
    }
    if (typeof schema === 'object' && schema !== null) {
      const result: Record<string, any> = {}
      for (const [key, value] of Object.entries(schema)) {
        result[key] = this.resolveSchema(value, scope)
      }
      return result
    }
    return schema
  }

  dispose(): void {
    this.disposed = true
    for (const unsub of this.unsubscribers) {
      try {
        unsub()
      } catch {}
    }
    this.unsubscribers = []
  }

  isDisposed(): boolean {
    return this.disposed
  }
}

export function createReaction(form: Form, sourceField: string, config: ReactionConfig): Reaction {
  return new Reaction(form, sourceField, config)
}
