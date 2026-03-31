# d-form

Schema 驱动的动态表单库。用一个 JSON 对象描述整个表单，自动渲染、自动校验、自动联动。

## 特性

- **Schema 驱动** — 表单即数据，可序列化、可存储、可由后端动态下发
- **18 种组件** — 开箱即用的 Element Plus 适配器（Input、Select、DatePicker、Cascader、Upload...）
- **字段联动** — 声明式 Reactions，一个 JSON 配置搞定显隐、禁用、级联、计算
- **表达式 DSL** — `{{expression}}` 语法，在 Schema 中写逻辑，无需写回调
- **校验** — 内置 7 种规则 + Zod 集成，支持异步校验
- **框架无关核心** — `@d-form/core` 零 UI 依赖，可对接任何框架

## 安装

```bash
# Vue 3 + Element Plus 项目（推荐）
pnpm add @d-form/element-plus

# 仅 Vue 3，自定义组件库
pnpm add @d-form/vue
```

## 快速开始

### 1. 注册组件

在应用入口调用一次：

```ts
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { registerElementPlusComponents } from '@d-form/element-plus'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)

registerElementPlusComponents() // 一行注册全部 18 个适配器

app.mount('#app')
```

### 2. 定义 Schema

用纯 JS 对象描述你的表单：

```ts
const schema = {
  type: 'object' as const,
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      component: 'input',
      placeholder: '请输入用户名',
      validation: {
        rules: [
          { type: 'required', message: '用户名不能为空' },
          { type: 'minLength', value: 3, message: '至少 3 个字符' },
        ],
        trigger: 'blur',
      },
    },
    role: {
      type: 'string',
      title: '角色',
      component: 'select',
      componentProps: {
        options: [
          { label: '管理员', value: 'admin' },
          { label: '编辑者', value: 'editor' },
          { label: '观察者', value: 'viewer' },
        ],
      },
    },
    birthday: {
      type: 'string',
      title: '生日',
      component: 'date-picker',
      placeholder: '选择日期',
    },
    active: {
      type: 'boolean',
      title: '启用',
      component: 'switch',
    },
  },
}
```

### 3. 使用组件渲染

**最简用法 — 自动渲染所有字段：**

```vue
<template>
  <DForm :schema="schema" @submit="handleSubmit">
    <el-button type="primary" native-type="submit">提交</el-button>
  </DForm>
</template>

<script setup lang="ts">
import { DForm } from '@d-form/vue'
import { ElButton } from 'element-plus'

const handleSubmit = (values: any) => {
  console.log('提交数据:', values)
  // { username: '...', role: '...', birthday: '...', active: true/false }
}
</script>
```

**Composable API — 获取表单状态：**

```vue
<script setup lang="ts">
import { useForm } from '@d-form/vue'

const { values, errors, setFieldValue, submit, reset, isValid } = useForm({
  schema,
  initialValues: { username: '张三' },
  onSubmit: async (values) => {
    console.log('提交:', values)
  },
})
</script>
```

---

## Schema 配置详解

### 顶层结构

```ts
interface FormSchema {
  type: 'object' // 固定为 'object'
  properties: Record<string, FieldSchema> // 字段定义
  uiSchema?: UISchema // 全局 UI 配置
  reactions?: ReactionConfig[] // 表单级联动
  scope?: Record<string, any> // 表达式可访问的外部数据
  title?: string // 表单标题
  description?: string // 表单描述
  default?: Record<string, any> // 默认值
}
```

### UISchema — 全局 UI 配置

控制表单整体布局和显示：

```ts
uiSchema: {
  layout: 'horizontal',        // 'horizontal' | 'vertical' | 'inline'
  labelWidth: '120px',         // 标签宽度
  labelPosition: 'right',      // 'left' | 'right' | 'top'
  gutter: 16,                  // 字段间距（px）
  columns: 2,                  // 栅格列数
  size: 'default',             // 'small' | 'default' | 'large'
  colon: true,                 // 标签后显示冒号
  showRequiredAsterisk: true,  // 必填字段显示 *
}
```

标签位置/宽度的优先级链：**DFormItem prop > FieldSchema > DForm prop > uiSchema > 默认值**

### FieldSchema — 字段定义

```ts
interface FieldSchema {
  type: FieldType | string // 数据类型
  title?: string // 标签文本
  description?: string // 帮助文本
  default?: any // 默认值
  component?: string // 渲染组件名
  componentProps?: Record<string, any> // 组件额外 props
  placeholder?: string // 占位文本
  required?: boolean // 显示必填标记 *
  disabled?: boolean // 初始禁用
  visible?: boolean // 初始可见（默认 true）
  labelPosition?: 'left' | 'right' | 'top' // 单字段标签位置覆盖
  labelWidth?: string | number // 单字段标签宽度覆盖
  validation?: ValidationConfig // 校验规则
  reactions?: ReactionConfig[] // 字段联动
  enum?: Array<{ label: string; value: any }> // 选项列表
  properties?: Record<string, FieldSchema> // 嵌套字段（object 类型）
  items?: FieldSchema // 数组项 schema（array 类型）
}
```

### 字段类型

| type        | 值类型                | 说明                 |
| ----------- | --------------------- | -------------------- |
| `'string'`  | `string`              | 文本                 |
| `'number'`  | `number`              | 数字                 |
| `'boolean'` | `boolean`             | 布尔                 |
| `'object'`  | `Record<string, any>` | 嵌套对象             |
| `'array'`   | `any[]`               | 数组                 |
| `'date'`    | `Date`                | 日期                 |
| `'void'`    | `undefined`           | 非数据字段（纯展示） |

---

## 可用组件

`registerElementPlusComponents()` 注册以下 18 个组件：

| 组件名             | Element Plus 组件          | 说明     |
| ------------------ | -------------------------- | -------- |
| `'input'`          | `ElInput`                  | 文本输入 |
| `'textarea'`       | `ElInput` (textarea)       | 多行文本 |
| `'select'`         | `ElSelect` + `ElOption`    | 下拉选择 |
| `'radio'`          | `ElRadioGroup` + `ElRadio` | 单选     |
| `'checkbox'`       | `ElCheckbox`               | 复选     |
| `'checkbox-group'` | `ElCheckboxGroup`          | 多选组   |
| `'switch'`         | `ElSwitch`                 | 开关     |
| `'input-number'`   | `ElInputNumber`            | 数字输入 |
| `'date-picker'`    | `ElDatePicker`             | 日期选择 |
| `'time-picker'`    | `ElTimePicker`             | 时间选择 |
| `'time-select'`    | `ElTimeSelect`             | 时间下拉 |
| `'cascader'`       | `ElCascader`               | 级联选择 |
| `'tree-select'`    | `ElTreeSelect`             | 树形选择 |
| `'slider'`         | `ElSlider`                 | 滑块     |
| `'rate'`           | `ElRate`                   | 评分     |
| `'color-picker'`   | `ElColorPicker`            | 颜色选择 |
| `'autocomplete'`   | `ElAutocomplete`           | 自动补全 |
| `'upload'`         | `ElUpload`                 | 文件上传 |

### 组件传参

通过 `componentProps` 传递额外 props：

```ts
{
  type: 'string',
  component: 'select',
  componentProps: {
    options: [
      { label: '选项 A', value: 'a' },
      { label: '选项 B', value: 'b' },
    ],
    clearable: true,
  },
}
```

```ts
{
  type: 'number',
  component: 'slider',
  componentProps: {
    min: 0,
    max: 100,
    step: 5,
  },
}
```

```ts
{
  type: 'array',
  component: 'cascader',
  componentProps: {
    options: [
      {
        value: 'china',
        label: '中国',
        children: [
          { value: 'beijing', label: '北京' },
          { value: 'shanghai', label: '上海' },
        ],
      },
    ],
  },
}
```

---

## Vue 组件

### `<DForm>`

表单根组件，创建表单上下文并注入给子组件。

**Props：**

| Prop            | 类型                                     | 说明             |
| --------------- | ---------------------------------------- | ---------------- |
| `schema`        | `FormSchema`                             | 表单 Schema 定义 |
| `initialValues` | `Record<string, any>`                    | 初始值           |
| `onSubmit`      | `(values: any) => void \| Promise<void>` | 提交回调         |
| `labelPosition` | `'left' \| 'right' \| 'top'`             | 默认标签位置     |
| `labelWidth`    | `string \| number`                       | 默认标签宽度     |

```vue
<DForm :schema="schema" :initial-values="{ name: '张三' }" @submit="onSubmit">
  <!-- 子组件自动获取表单上下文 -->
</DForm>
```

### `<DFormItem>`

包装单个字段，自动渲染标签、必填标记、错误信息和帮助文本。

**Props：**

| Prop            | 类型                         | 说明                              |
| --------------- | ---------------------------- | --------------------------------- |
| `name`          | `string`                     | 字段路径（必填）                  |
| `schema`        | `FieldSchema`                | 字段 Schema（未传则从上下文获取） |
| `label`         | `string`                     | 覆盖 `schema.title`               |
| `required`      | `boolean`                    | 覆盖 `schema.required`            |
| `component`     | `string \| Component`        | 覆盖渲染组件                      |
| `disabled`      | `boolean`                    | 禁用字段                          |
| `labelPosition` | `'left' \| 'right' \| 'top'` | 标签位置（最高优先级）            |
| `labelWidth`    | `string \| number`           | 标签宽度（最高优先级）            |

**手动布局用法：**

```vue
<DForm :schema="schema" @submit="onSubmit">
  <DFormItem name="username" :schema="schema.properties.username" />
  <DFormItem name="email" :schema="schema.properties.email" />
  <DFormItem name="role" :schema="schema.properties.role" />
  <button type="submit">提交</button>
</DForm>
```

### `<DField>`

渲染单个表单控件，从组件注册表中查找对应组件。

| Prop        | 类型                  | 说明        |
| ----------- | --------------------- | ----------- |
| `name`      | `string`              | 字段路径    |
| `schema`    | `FieldSchema`         | 字段 Schema |
| `component` | `string \| Component` | 覆盖组件    |
| `disabled`  | `boolean`             | 禁用        |

### `<DFormItems>`

自动遍历 `schema.properties` 并为每个非 `void` 字段渲染 `<DFormItem>`。

```vue
<DForm :schema="schema" @submit="onSubmit">
  <DFormItems />
  <button type="submit">提交</button>
</DForm>
```

### Composable API

#### `useForm()`

```ts
const {
  form, // Form 实例
  values, // 当前表单值（响应式）
  errors, // 字段错误（响应式）
  touched, // 字段触碰状态（响应式）
  dirty, // 是否修改过
  submitting, // 是否提交中
  isValid, // 是否校验通过
  setFieldValue, // (path, value) => void
  setValues, // (values) => void
  submit, // () => Promise<void>
  reset, // () => void
  validate, // () => Promise<FormValidationResult>
  clearErrors, // () => void
} = useForm({
  schema,
  initialValues: { name: '张三' },
  onSubmit: async (values) => {
    /* ... */
  },
  validateOnBlur: true,
  validateOnChange: true,
})
```

#### `useField()`

```ts
const { value, error, touched, setValue, setTouched, validate } = useField('email', form.form)
```

---

## 校验

### 内置规则

```ts
validation: {
  rules: [
    { type: 'required', message: '必填' },
    { type: 'min', value: 0, message: '不能小于 0' },
    { type: 'max', value: 100, message: '不能大于 100' },
    { type: 'minLength', value: 8, message: '至少 8 个字符' },
    { type: 'maxLength', value: 140, message: '最多 140 个字符' },
    { type: 'pattern', value: /^[a-z]+$/, message: '只能小写字母' },
    {
      type: 'custom',
      message: '用户名已存在',
      validator: async (value) => {
        const res = await fetch(`/api/check?name=${value}`)
        return res.ok
      },
    },
  ],
  trigger: 'blur', // 'blur' | 'change' | 'submit' | 数组
  validateVisibleOnly: true, // 隐藏字段跳过校验
}
```

### Zod 集成

```ts
import { z } from 'zod'

const zodSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '至少 8 个字符'),
  age: z.number().min(18, '必须年满 18 岁'),
})

const form = useForm({ schema, zodSchema })
```

---

## 字段联动（Reactions）

联动让字段之间产生动态响应。在 Schema 中声明，无需写回调函数。

### 联动配置

```ts
interface ReactionConfig {
  dependencies?: string[] // 监听的字段路径
  target?: string | string[] // 要修改的目标字段
  when?: string // 条件表达式
  fulfill?: ReactionEffect // 条件为 true 时执行
  otherwise?: ReactionEffect // 条件为 false 时执行
}
```

### 表达式变量

在 `when`、`fulfill.run`、`fulfill.state` 中可以使用：

| 变量             | 说明                                   |
| ---------------- | -------------------------------------- |
| `$self`          | 当前字段的 state 对象                  |
| `$deps`          | 依赖字段值数组（按 dependencies 顺序） |
| `$values`        | 所有表单值                             |
| `$form`          | Form 实例                              |
| `$dependencies`  | 命名依赖映射                           |
| `scope` 中的变量 | FormSchema.scope 中定义的外部数据      |

### 示例 1：条件显隐

选择"企业"时显示公司名称字段：

```ts
const schema = {
  type: 'object',
  properties: {
    accountType: {
      type: 'string',
      component: 'radio',
      title: '账户类型',
      componentProps: {
        options: [
          { label: '个人', value: 'personal' },
          { label: '企业', value: 'business' },
        ],
      },
    },
    companyName: {
      type: 'string',
      component: 'input',
      title: '公司名称',
      visible: false, // 默认隐藏
      reactions: [
        {
          dependencies: ['accountType'],
          when: '{{$deps[0] === "business"}}',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
  },
}
```

### 示例 2：级联选择

国家变化时，自动更新城市选项并清空已选值：

```ts
const cityMap = {
  US: [{ label: 'New York', value: 'new_york' }],
  UK: [{ label: 'London', value: 'london' }],
  CN: [{ label: 'Beijing', value: 'beijing' }],
}

const schema = {
  type: 'object',
  scope: { cityMap }, // 注入到表达式作用域
  properties: {
    country: {
      type: 'string',
      component: 'select',
      title: '国家',
      componentProps: {
        options: [
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'China', value: 'CN' },
        ],
      },
    },
    city: {
      type: 'string',
      component: 'select',
      title: '城市',
      componentProps: { options: [] },
      reactions: [
        {
          dependencies: ['country'],
          target: 'city',
          fulfill: {
            schema: {
              componentProps: {
                options: '{{cityMap[$deps[0]] || []}}',
              },
            },
          },
          run: '{{$form.setFieldValue("city", "")}}',
        },
      ],
    },
  },
}
```

### 示例 3：计算字段

价格 × 数量 = 总计：

```ts
total: {
  type: 'number',
  component: 'input',
  title: '总计',
  disabled: true,
  reactions: [
    {
      dependencies: ['price', 'quantity'],
      target: 'total',
      fulfill: {
        state: {
          value: '{{($deps[0] || 0) * ($deps[1] || 0)}}',
        },
      },
    },
  ],
}
```

### 示例 4：禁用切换

选择"银行卡"时才启用卡号字段：

```ts
const schema = {
  type: 'object',
  properties: {
    paymentMethod: {
      /* radio: cash / bank_card / paypal */
    },
    cardNumber: {
      type: 'string',
      component: 'input',
      title: '卡号',
      disabled: true, // 默认禁用
    },
  },
  reactions: [
    {
      dependencies: ['paymentMethod'],
      target: 'cardNumber',
      when: '{{$deps[0] === "bank_card"}}',
      fulfill: { state: { disabled: false } },
      otherwise: { state: { disabled: true } },
    },
  ],
}
```

### 示例 5：动态标签和占位符

根据证件类型修改字段标题和占位文本：

```ts
const idTypeMap = {
  id_card: { title: '身份证号', placeholder: '18 位身份证号' },
  passport: { title: '护照号', placeholder: '护照号码（如 E12345678）' },
}

const schema = {
  type: 'object',
  scope: { idTypeMap },
  properties: {
    idType: {
      /* select: 身份证 / 护照 */
    },
    idNumber: {
      type: 'string',
      component: 'input',
      title: '证件号码',
      reactions: [
        {
          dependencies: ['idType'],
          target: 'idNumber',
          fulfill: {
            schema: {
              title: '{{idTypeMap[$deps[0]]?.title || "证件号码"}}',
              placeholder: '{{idTypeMap[$deps[0]]?.placeholder || "请输入证件号码"}}',
            },
          },
          run: '{{$form.setFieldValue("idNumber", "")}}',
        },
      ],
    },
  },
}
```

---

## 自定义组件适配器

### 编写适配器

创建一个 Vue 组件，遵循统一的 props/emits 契约：

```vue
<!-- CustomInputAdapter.vue -->
<template>
  <input
    :value="modelValue"
    :disabled="disabled"
    :placeholder="schema?.placeholder"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @blur="$emit('blur')"
  />
</template>

<script setup lang="ts">
import type { FieldSchema } from '@d-form/shared'

defineProps<{
  name: string
  modelValue: any
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: any]
  blur: []
}>()
</script>
```

**适配器契约：**

| Props        | 类型          | 说明        |
| ------------ | ------------- | ----------- |
| `name`       | `string`      | 字段名      |
| `modelValue` | `any`         | 当前值      |
| `schema`     | `FieldSchema` | 字段 Schema |
| `error`      | `string`      | 校验错误    |
| `touched`    | `boolean`     | 是否触碰    |
| `disabled`   | `boolean`     | 禁用状态    |

| Emits               | 说明   |
| ------------------- | ------ |
| `update:modelValue` | 值变更 |
| `blur`              | 失焦   |

### 注册适配器

```ts
import { registerComponent } from '@d-form/vue'
import CustomInputAdapter from './CustomInputAdapter.vue'

registerComponent('my-input', CustomInputAdapter)
```

### 在 Schema 中使用

```ts
{
  type: 'string',
  title: '自定义字段',
  component: 'my-input',
  componentProps: { /* 你的自定义 props */ }
}
```

---

## 布局

### 表单级布局

通过 `labelPosition` 和 `labelWidth` 控制全局布局：

```vue
<DForm :schema="schema" label-position="top" label-width="120px" />
```

或通过 `uiSchema`：

```ts
const schema = {
  type: 'object',
  uiSchema: {
    labelPosition: 'top',
    labelWidth: '120px',
  },
  properties: {
    /* ... */
  },
}
```

### 单字段布局覆盖

在 FieldSchema 中为特定字段设置不同的标签位置和宽度：

```ts
properties: {
  name: {
    type: 'string',
    component: 'input',
    title: '名称',
    labelWidth: '200px',       // 这个字段用 200px
  },
  email: {
    type: 'string',
    component: 'input',
    title: '邮箱',
    labelPosition: 'top',     // 这个字段标签在上方
  },
}
```

**优先级**：DFormItem prop > FieldSchema > DForm prop > uiSchema > 默认值（`right` / `100px`）

---

## 包结构

```
@d-form/shared        # 类型、工具函数、国际化（零依赖）
       ↓
@d-form/core          # 表单引擎、校验、响应式、表达式、联动
       ↓
@d-form/vue           # Vue 3 composables、组件、渲染器
       ↓
@d-form/element-plus  # Element Plus 适配器（18 个组件）
```

核心包 `@d-form/core` 框架无关，未来可对接 React 等其他框架。

## 开发

```bash
pnpm install       # 安装依赖
pnpm build         # 构建所有包
pnpm test          # 运行测试
pnpm type-check    # 类型检查
pnpm lint          # ESLint
pnpm dev           # 启动 Demo
```

## License

MIT
