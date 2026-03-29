<template>
  <div class="page">
    <h2 class="page-title">Field Linkage</h2>
    <p class="page-desc">Pure schema-driven reactions — zero imperative code</p>

    <div class="section">
      <h3 class="section-title">Country-City Cascading</h3>
      <div class="form-card">
        <DForm
          ref="cascadingFormRef"
          :schema="cascadingSchema"
          :initial-values="{ country: '', city: '' }"
          @submit="(values: any) => console.warn('Cascading:', values)"
        />
        <pre class="state-preview">{{
          JSON.stringify(cascadingFormRef?.values ?? { country: '', city: '' }, null, 2)
        }}</pre>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Computed Total (Price × Quantity)</h3>
      <div class="form-card">
        <DForm
          ref="computedFormRef"
          :schema="computedSchema"
          :initial-values="{ price: 0, quantity: 1, total: 0 }"
          @submit="(values: any) => console.warn('Computed:', values)"
        />
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
          @submit="(values: any) => console.warn('Conditional:', values)"
        />
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
import { ref } from 'vue'
import { DForm } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'

// --- Data: city map for cascading select ---

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

// --- Section 1: Country-City Cascading (pure schema) ---

const cascadingFormRef = ref()

const cascadingSchema: FormSchema = {
  type: 'object',
  scope: { cityMap },
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
    city: {
      type: 'string',
      component: 'select',
      title: 'City',
      componentProps: {
        options: [],
      },
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
            run: '{{$form.setFieldValue("city", "")}}',
          },
        },
      ],
    },
  },
}

// --- Section 2: Computed Total (pure schema) ---

const computedFormRef = ref()

const computedSchema: FormSchema = {
  type: 'object',
  properties: {
    price: {
      type: 'number',
      component: 'input-number',
      title: 'Price',
    },
    quantity: {
      type: 'number',
      component: 'input-number',
      title: 'Quantity',
    },
    total: {
      type: 'number',
      component: 'input',
      title: 'Total',
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
    },
  },
}

// --- Section 3: Conditional Fields (pure schema) ---

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
      visible: false,
      reactions: [
        {
          dependencies: ['accountType'],
          when: '{{$deps[0] === "business"}}',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    companySize: {
      type: 'string',
      component: 'select',
      title: 'Company Size',
      placeholder: 'Select size',
      visible: false,
      componentProps: {
        options: [
          { label: '1-10', value: 'small' },
          { label: '11-50', value: 'medium' },
          { label: '50+', value: 'large' },
        ],
      },
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
