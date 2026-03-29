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

    <div class="section">
      <h3 class="section-title">Payment Method → Disabled Toggle</h3>
      <p class="section-desc">Card fields are disabled unless "Bank Card" is selected</p>
      <div class="form-card">
        <DForm
          ref="paymentFormRef"
          :schema="paymentSchema"
          :initial-values="{ paymentMethod: 'cash', cardNumber: '', cardHolder: '' }"
          @submit="(values: any) => console.warn('Payment:', values)"
        />
        <pre class="state-preview">{{
          JSON.stringify(
            paymentFormRef?.values ?? { paymentMethod: 'cash', cardNumber: '', cardHolder: '' },
            null,
            2
          )
        }}</pre>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Invoice Type → Required + Visible</h3>
      <p class="section-desc">
        "No Invoice" hides all fields; "Personal" shows invoice title; "Company" also requires tax
        ID
      </p>
      <div class="form-card">
        <DForm
          ref="invoiceFormRef"
          :schema="invoiceSchema"
          :initial-values="{ invoiceType: 'none', invoiceTitle: '', taxId: '' }"
          @submit="(values: any) => console.warn('Invoice:', values)"
        />
        <pre class="state-preview">{{
          JSON.stringify(
            invoiceFormRef?.values ?? { invoiceType: 'none', invoiceTitle: '', taxId: '' },
            null,
            2
          )
        }}</pre>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">ID Type → Dynamic Title / Placeholder</h3>
      <p class="section-desc">
        Selecting an ID type changes the label and placeholder of the number field
      </p>
      <div class="form-card">
        <DForm
          ref="idTypeFormRef"
          :schema="idTypeSchema"
          :initial-values="{ idType: 'id_card', idNumber: '' }"
          @submit="(values: any) => console.warn('ID Type:', values)"
        />
        <pre class="state-preview">{{
          JSON.stringify(idTypeFormRef?.values ?? { idType: 'id_card', idNumber: '' }, null, 2)
        }}</pre>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Province → City → District (3-Level Cascading)</h3>
      <p class="section-desc">
        Changing a parent level resets all child selections and updates their options
      </p>
      <div class="form-card">
        <DForm
          ref="regionFormRef"
          :schema="regionSchema"
          :initial-values="{ province: '', city: '', district: '' }"
          @submit="(values: any) => console.warn('Region:', values)"
        />
        <pre class="state-preview">{{
          JSON.stringify(regionFormRef?.values ?? { province: '', city: '', district: '' }, null, 2)
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

// --- Section 4: Payment Method → Disabled ---

const paymentFormRef = ref()

const paymentSchema: FormSchema = {
  type: 'object',
  properties: {
    paymentMethod: {
      type: 'string',
      component: 'radio',
      title: 'Payment Method',
      componentProps: {
        options: [
          { label: 'Cash', value: 'cash' },
          { label: 'Bank Card', value: 'bank_card' },
          { label: 'PayPal', value: 'paypal' },
        ],
      },
    },
    cardNumber: {
      type: 'string',
      component: 'input',
      title: 'Card Number',
      placeholder: 'Enter card number',
      disabled: true,
    },
    cardHolder: {
      type: 'string',
      component: 'input',
      title: 'Card Holder',
      placeholder: 'Name on card',
      disabled: true,
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
    {
      dependencies: ['paymentMethod'],
      target: 'cardHolder',
      when: '{{$deps[0] === "bank_card"}}',
      fulfill: { state: { disabled: false } },
      otherwise: { state: { disabled: true } },
    },
  ],
}

// --- Section 5: Invoice Type → Required + Visible ---

const invoiceFormRef = ref()

const invoiceSchema: FormSchema = {
  type: 'object',
  properties: {
    invoiceType: {
      type: 'string',
      component: 'radio',
      title: 'Invoice Type',
      componentProps: {
        options: [
          { label: 'No Invoice', value: 'none' },
          { label: 'Personal', value: 'personal' },
          { label: 'Company', value: 'company' },
        ],
      },
    },
    invoiceTitle: {
      type: 'string',
      component: 'input',
      title: 'Invoice Title',
      placeholder: 'Enter invoice title',
      visible: false,
      required: false,
      reactions: [
        {
          dependencies: ['invoiceType'],
          when: '{{$deps[0] !== "none"}}',
          fulfill: {
            state: { visible: true },
            schema: { required: true },
          },
          otherwise: {
            state: { visible: false },
            schema: { required: false },
          },
        },
      ],
    },
    taxId: {
      type: 'string',
      component: 'input',
      title: 'Tax ID',
      placeholder: 'Enter taxpayer ID',
      visible: false,
      required: false,
      reactions: [
        {
          dependencies: ['invoiceType'],
          when: '{{$deps[0] === "company"}}',
          fulfill: {
            state: { visible: true },
            schema: { required: true },
          },
          otherwise: {
            state: { visible: false },
            schema: { required: false },
          },
        },
      ],
    },
  },
}

// --- Section 6: ID Type → Dynamic Title / Placeholder ---

const idTypeFormRef = ref()

const idTypeMap: Record<string, { title: string; placeholder: string }> = {
  id_card: { title: 'ID Card Number', placeholder: '18-digit ID card number' },
  passport: { title: 'Passport Number', placeholder: 'Passport number (e.g. E12345678)' },
  military: { title: 'Military ID', placeholder: 'Military ID number' },
}

const idTypeSchema: FormSchema = {
  type: 'object',
  scope: { idTypeMap },
  properties: {
    idType: {
      type: 'string',
      component: 'select',
      title: 'ID Type',
      componentProps: {
        options: [
          { label: 'ID Card', value: 'id_card' },
          { label: 'Passport', value: 'passport' },
          { label: 'Military ID', value: 'military' },
        ],
      },
    },
    idNumber: {
      type: 'string',
      component: 'input',
      title: 'ID Card Number',
      placeholder: '18-digit ID card number',
      reactions: [
        {
          dependencies: ['idType'],
          target: 'idNumber',
          fulfill: {
            schema: {
              title: '{{idTypeMap[$deps[0]]?.title || "ID Number"}}',
              placeholder: '{{idTypeMap[$deps[0]]?.placeholder || "Enter ID number"}}',
            },
          },
          run: '{{$form.setFieldValue("idNumber", "")}}',
        },
      ],
    },
  },
}

// --- Section 7: Province → City → District (3-Level) ---

const regionFormRef = ref()

const regionData: Record<
  string,
  {
    cities: Record<string, { label: string; value: string }[]>
  }
> = {
  guangdong: {
    cities: {
      shenzhen: [
        { label: 'Nanshan', value: 'nanshan' },
        { label: 'Futian', value: 'futian' },
        { label: 'Luohu', value: 'luohu' },
      ],
      guangzhou: [
        { label: 'Tianhe', value: 'tianhe' },
        { label: 'Yuexiu', value: 'yuexiu' },
        { label: 'Haizhu', value: 'haizhu' },
      ],
    },
  },
  zhejiang: {
    cities: {
      hangzhou: [
        { label: 'Xihu', value: 'xihu' },
        { label: 'Gongshu', value: 'gongshu' },
        { label: 'Binjiang', value: 'binjiang' },
      ],
      ningbo: [
        { label: 'Haishu', value: 'haishu' },
        { label: 'Jiangbei', value: 'jiangbei' },
      ],
    },
  },
  jiangsu: {
    cities: {
      nanjing: [
        { label: 'Gulou', value: 'gulou' },
        { label: 'Xuanwu', value: 'xuanwu' },
        { label: 'Jianye', value: 'jianye' },
      ],
      suzhou: [
        { label: 'Gusu', value: 'gusu' },
        { label: 'Huqiu', value: 'huqiu' },
        { label: 'Kunshan', value: 'kunshan' },
      ],
    },
  },
}

const provinceToCities: Record<string, { label: string; value: string }[]> = {}
for (const [province, data] of Object.entries(regionData)) {
  provinceToCities[province] = Object.keys(data.cities).map((city) => ({
    label: city.charAt(0).toUpperCase() + city.slice(1),
    value: city,
  }))
}

const cityToDistricts: Record<string, { label: string; value: string }[]> = {}
for (const data of Object.values(regionData)) {
  for (const [city, districts] of Object.entries(data.cities)) {
    cityToDistricts[city] = districts
  }
}

const regionSchema: FormSchema = {
  type: 'object',
  scope: { provinceToCities, cityToDistricts },
  properties: {
    province: {
      type: 'string',
      component: 'select',
      title: 'Province',
      placeholder: 'Select province',
      componentProps: {
        options: [
          { label: 'Guangdong', value: 'guangdong' },
          { label: 'Zhejiang', value: 'zhejiang' },
          { label: 'Jiangsu', value: 'jiangsu' },
        ],
      },
    },
    city: {
      type: 'string',
      component: 'select',
      title: 'City',
      placeholder: 'Select city',
      componentProps: {
        options: [],
      },
      reactions: [
        {
          dependencies: ['province'],
          target: 'city',
          fulfill: {
            schema: {
              componentProps: {
                options: '{{provinceToCities[$deps[0]] || []}}',
              },
            },
          },
          run: '{{$form.setFieldValue("city", ""); $form.setFieldValue("district", "")}}',
        },
      ],
    },
    district: {
      type: 'string',
      component: 'select',
      title: 'District',
      placeholder: 'Select district',
      componentProps: {
        options: [],
      },
      reactions: [
        {
          dependencies: ['city'],
          target: 'district',
          fulfill: {
            schema: {
              componentProps: {
                options: '{{cityToDistricts[$deps[0]] || []}}',
              },
            },
          },
          run: '{{$form.setFieldValue("district", "")}}',
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
  margin-bottom: 4px;
  color: #303133;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}
.section-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px 10px;
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
