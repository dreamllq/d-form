<template>
  <div class="page">
    <h2 class="page-title">Field Linkage</h2>
    <p class="page-desc">Reactions and computed fields with field dependencies</p>

    <div class="section">
      <h3 class="section-title">Country-City Cascading</h3>
      <div class="form-card">
        <div class="field-group">
          <div class="field-row">
            <label class="field-label">Country</label>
            <el-select v-model="cascadingValues.country" @change="onCountryChange">
              <el-option label="United States" value="US" />
              <el-option label="United Kingdom" value="UK" />
              <el-option label="China" value="CN" />
              <el-option label="Japan" value="JP" />
            </el-select>
          </div>
          <div class="field-row">
            <label class="field-label">City</label>
            <el-select v-model="cascadingValues.city">
              <el-option
                v-for="opt in cityOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>
        </div>
        <pre class="state-preview">{{ JSON.stringify(cascadingValues, null, 2) }}</pre>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Computed Total (Price x Quantity)</h3>
      <div class="form-card">
        <div class="field-group">
          <div class="field-row">
            <label class="field-label">Price</label>
            <el-input-number v-model="computedValues.price" @change="onComputedChange" />
          </div>
          <div class="field-row">
            <label class="field-label">Quantity</label>
            <el-input-number v-model="computedValues.quantity" @change="onComputedChange" />
          </div>
          <div class="field-row">
            <label class="field-label">Total</label>
            <el-input :model-value="computedValues.total" disabled />
          </div>
        </div>
        <pre class="state-preview">{{ JSON.stringify(computedValues, null, 2) }}</pre>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Show/Hide Conditional Fields</h3>
      <div class="form-card">
        <div class="field-group">
          <div class="field-row">
            <label class="field-label">Account Type</label>
            <el-radio-group v-model="conditionalValues.accountType" @change="onAccountTypeChange">
              <el-radio value="personal">Personal</el-radio>
              <el-radio value="business">Business</el-radio>
            </el-radio-group>
          </div>
          <div v-if="conditionalValues.accountType === 'business'" class="field-row">
            <label class="field-label">Company Name</label>
            <el-input v-model="conditionalValues.companyName" placeholder="Enter company name" />
          </div>
          <div v-if="conditionalValues.accountType === 'business'" class="field-row">
            <label class="field-label">Company Size</label>
            <el-select v-model="conditionalValues.companySize" placeholder="Select size">
              <el-option label="1-10" value="small" />
              <el-option label="11-50" value="medium" />
              <el-option label="50+" value="large" />
            </el-select>
          </div>
        </div>
        <pre class="state-preview">{{ JSON.stringify(conditionalValues, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ElSelect, ElOption, ElInput, ElInputNumber, ElRadioGroup, ElRadio } from 'element-plus'

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

const cascadingValues = reactive({ country: '', city: '' })

const cityOptions = computed(() => {
  return cityMap[cascadingValues.country] || []
})

const onCountryChange = () => {
  cascadingValues.city = ''
}

const computedValues = reactive({ price: 0, quantity: 1, total: 0 })

const onComputedChange = () => {
  computedValues.total = (computedValues.price || 0) * (computedValues.quantity || 0)
}
onComputedChange()

const conditionalValues = reactive({
  accountType: 'personal' as string,
  companyName: '',
  companySize: '',
})

const onAccountTypeChange = () => {
  conditionalValues.companyName = ''
  conditionalValues.companySize = ''
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
.field-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 16px;
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
.state-preview {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0;
}
</style>
