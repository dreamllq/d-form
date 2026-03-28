<template>
  <div class="page">
    <h2 class="page-title">Field Linkage</h2>
    <p class="page-desc">Reactions and computed fields with field dependencies</p>

    <div class="section">
      <h3 class="section-title">Country-City Cascading</h3>
      <div class="form-card">
        <DForm
          ref="cascadingFormRef"
          :schema="cascadingSchema"
          :initial-values="{ country: '', city: '' }"
          @submit="handleCascadingSubmit"
        >
          <DFormItem name="country" :schema="cascadingSchema.properties.country" />
          <DFormItem name="city" :schema="cityFieldSchema" />
        </DForm>
        <pre class="state-preview">{{
          JSON.stringify(cascadingFormRef?.values ?? { country: '', city: '' }, null, 2)
        }}</pre>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Computed Total (Price x Quantity)</h3>
      <div class="form-card">
        <DForm
          ref="computedFormRef"
          :schema="computedSchema"
          :initial-values="{ price: 0, quantity: 1, total: 0 }"
          @submit="handleComputedSubmit"
        >
          <DFormItem name="price" :schema="computedSchema.properties.price" />
          <DFormItem name="quantity" :schema="computedSchema.properties.quantity" />
          <DFormItem name="total" :schema="computedSchema.properties.total" />
        </DForm>
        <pre class="state-preview">{{
          JSON.stringify(computedFormRef?.values ?? { price: 0, quantity: 1, total: 0 }, null, 2)
        }}</pre>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Show/Hide Conditional Fields</h3>
      <div class="form-card">
        <DForm
          ref="condFormRef"
          :schema="conditionalSchema"
          :initial-values="{ accountType: 'personal', companyName: '', companySize: '' }"
          @submit="handleCondSubmit"
        >
          <DFormItem name="accountType" :schema="conditionalSchema.properties.accountType" />
          <DFormItem
            v-if="condFormRef?.values?.accountType === 'business'"
            name="companyName"
            :schema="conditionalSchema.properties.companyName"
          />
          <DFormItem
            v-if="condFormRef?.values?.accountType === 'business'"
            name="companySize"
            :schema="conditionalSchema.properties.companySize"
          />
        </DForm>
        <pre class="state-preview">{{
          JSON.stringify(
            condFormRef?.values ?? { accountType: 'personal', companyName: '', companySize: '' },
            null,
            2
          )
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DForm, DFormItem } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'

// --- Section 1: Country-City Cascading ---

const cascadingFormRef = ref()
const selectedCountry = ref('')

const cityMap: Record<string, { label: string; value: string }[]> = {
  US: [
    { label: 'New York', value: 'new_york' },
    { label: 'Los Angeles', value: 'los_angeles' },
    { label: 'Chicago', value: 'chicago' },
  ],
  UK: [
    { label: 'London', value: 'london' },
    { label: 'Manchester', value: 'manchester' },
    { label: 'Birmingham', value: 'birmingham' },
  ],
  CN: [
    { label: 'Beijing', value: 'beijing' },
    { label: 'Shanghai', value: 'shanghai' },
    { label: 'Shenzhen', value: 'shenzhen' },
  ],
  JP: [
    { label: 'Tokyo', value: 'tokyo' },
    { label: 'Osaka', value: 'osaka' },
    { label: 'Kyoto', value: 'kyoto' },
  ],
}

const cascadingSchema: FormSchema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      component: 'select',
      title: 'Country',
      componentProps: {
        options: [
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'China', value: 'CN' },
          { label: 'Japan', value: 'JP' },
        ],
      },
    },
  },
}

const cityFieldSchema = computed(() => ({
  type: 'string',
  component: 'select',
  title: 'City',
  componentProps: {
    options: cityMap[selectedCountry.value] || [],
  },
}))

watch(
  () => cascadingFormRef.value?.values?.country,
  (newCountry) => {
    if (newCountry !== selectedCountry.value) {
      selectedCountry.value = newCountry
      cascadingFormRef.value?.setFieldValue('city', '')
    }
  }
)

const handleCascadingSubmit = (values: Record<string, unknown>) => {
  console.warn('Cascading:', values)
}

// --- Section 2: Computed Total ---

const computedFormRef = ref()

const computedSchema: FormSchema = {
  type: 'object',
  properties: {
    price: { type: 'number', component: 'input-number', title: 'Price' },
    quantity: { type: 'number', component: 'input-number', title: 'Quantity' },
    total: { type: 'number', component: 'input', title: 'Total', disabled: true },
  },
}

watch(
  () => ({
    price: computedFormRef.value?.values?.price,
    qty: computedFormRef.value?.values?.quantity,
  }),
  ({ price, qty }) => {
    const total = (price || 0) * (qty || 0)
    computedFormRef.value?.setFieldValue('total', total)
  }
)

const handleComputedSubmit = (values: Record<string, unknown>) => {
  console.warn('Computed:', values)
}

// --- Section 3: Conditional Fields ---

const condFormRef = ref()

const conditionalSchema: FormSchema = {
  type: 'object',
  properties: {
    accountType: {
      type: 'string',
      component: 'radio',
      title: 'Account Type',
      componentProps: {
        options: [
          { label: 'Personal', value: 'personal' },
          { label: 'Business', value: 'business' },
        ],
      },
    },
    companyName: {
      type: 'string',
      component: 'input',
      title: 'Company Name',
      placeholder: 'Enter company name',
    },
    companySize: {
      type: 'string',
      component: 'select',
      title: 'Company Size',
      placeholder: 'Select size',
      componentProps: {
        options: [
          { label: '1-10', value: 'small' },
          { label: '11-50', value: 'medium' },
          { label: '50+', value: 'large' },
        ],
      },
    },
  },
}

const handleCondSubmit = (values: Record<string, unknown>) => {
  console.warn('Conditional:', values)
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
.section {
  margin-bottom: 28px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}
.form-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.state-preview {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0;
}
</style>
