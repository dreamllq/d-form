<script setup lang="ts">
import { ref } from 'vue'
import { SchemaEditor } from '@d-form/schema-editor'
import type { FormSchema } from '@d-form/shared'

const schema = ref<FormSchema>({
  type: 'object',
  properties: {
    name: { type: 'string', title: '姓名', component: 'input', placeholder: '请输入姓名' },
    email: { type: 'string', title: '邮箱', component: 'input', placeholder: '请输入邮箱' },
    role: { type: 'string', title: '角色', component: 'select', enum: ['admin', 'user', 'guest'] },
    active: { type: 'boolean', title: '启用', component: 'switch' },
  },
})
</script>

<template>
  <div style="padding: 20px">
    <h2>Schema Editor</h2>
    <div style="height: 600px">
      <SchemaEditor :schema="schema" @update:schema="(s: any) => (schema = s)" />
    </div>
  </div>
</template>
