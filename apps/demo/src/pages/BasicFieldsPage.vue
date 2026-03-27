<template>
  <div class="page">
    <h2 class="page-title">Basic Fields</h2>
    <p class="page-desc">All 8 Element Plus field types rendered via DForm</p>

    <div class="form-card">
      <DForm :schema="schema" :initial-values="initialValues" @submit="handleSubmit">
        <div class="field-group">
          <div class="field-row">
            <label class="field-label">Name (Input)</label>
            <DField name="name" :schema="schema.properties.name" />
          </div>
          <div class="field-row">
            <label class="field-label">Category (Select)</label>
            <DField name="category" :schema="schema.properties.category" />
          </div>
          <div class="field-row">
            <label class="field-label">Birthday (DatePicker)</label>
            <DField name="birthday" :schema="schema.properties.birthday" />
          </div>
          <div class="field-row">
            <label class="field-label">Notes (Textarea)</label>
            <DField name="notes" :schema="schema.properties.notes" />
          </div>
          <div class="field-row">
            <label class="field-label">Quantity (InputNumber)</label>
            <DField name="quantity" :schema="schema.properties.quantity" />
          </div>
          <div class="field-row">
            <label class="field-label">Gender (Radio)</label>
            <DField name="gender" :schema="schema.properties.gender" />
          </div>
          <div class="field-row">
            <label class="field-label">Active (Switch)</label>
            <DField name="active" :schema="schema.properties.active" />
          </div>
          <div class="field-row">
            <label class="field-label">Agree (Checkbox)</label>
            <DField name="agree" :schema="schema.properties.agree" />
          </div>
        </div>
        <el-button type="primary" native-type="submit">Submit</el-button>
      </DForm>
    </div>

    <div v-if="submittedValues" class="result-card">
      <h3>Submitted Values</h3>
      <pre>{{ JSON.stringify(submittedValues, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DForm, DField } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'
import { ElButton } from 'element-plus'

const schema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name', placeholder: 'Enter your name' },
    category: {
      type: 'string',
      component: 'select',
      title: 'Category',
      placeholder: 'Select category',
      componentProps: {
        options: [
          { label: 'Technology', value: 'tech' },
          { label: 'Science', value: 'science' },
          { label: 'Art', value: 'art' },
        ],
      },
    },
    birthday: {
      type: 'string',
      component: 'date-picker',
      title: 'Birthday',
      placeholder: 'Pick a date',
    },
    notes: { type: 'string', component: 'textarea', title: 'Notes', placeholder: 'Enter notes...' },
    quantity: { type: 'number', component: 'input-number', title: 'Quantity' },
    gender: {
      type: 'string',
      component: 'radio',
      title: 'Gender',
      componentProps: {
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
        ],
      },
    },
    active: { type: 'boolean', component: 'switch', title: 'Active' },
    agree: { type: 'boolean', component: 'checkbox', title: 'Agree' },
  },
}

const initialValues = {
  name: '',
  category: '',
  birthday: '',
  notes: '',
  quantity: 1,
  gender: '',
  active: false,
  agree: false,
}

const submittedValues = ref<Record<string, any> | null>(null)

const handleSubmit = (values: any) => {
  submittedValues.value = values
}
</script>

<style scoped>
.page {
  max-width: 800px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}
.page-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}
.form-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 20px;
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}
.result-card {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.result-card h3 {
  font-size: 15px;
  margin-bottom: 12px;
  color: #303133;
}
.result-card pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  overflow-x: auto;
}
</style>
