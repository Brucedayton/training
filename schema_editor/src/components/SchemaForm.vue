<template>
  <div class="schema-form">
    <el-form
      :model="formData"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <!-- Common Properties -->
      <el-form-item label="Name">
        <el-input v-model="formData.name" />
      </el-form-item>

      <el-form-item label="Color">
        <el-color-picker v-model="formData.color" />
      </el-form-item>

      <el-form-item label="Description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
        />
      </el-form-item>

      <!-- Schema Properties -->
      <template v-if="formData.type === 'schema'">
        <el-form-item label="Database">
          <el-input v-model="formData.database" />
        </el-form-item>
        <el-form-item label="Table Name">
          <el-input v-model="formData.tableName" />
        </el-form-item>
      </template>

      <!-- Column Properties -->
      <template v-if="formData.type === 'column'">
        <el-form-item label="Data Type">
          <el-select v-model="formData.dataType" style="width: 100%">
            <el-option label="String" value="string" />
            <el-option label="Boolean" value="boolean" />
            <el-option label="Integer" value="integer" />
            <el-option label="Formula" value="formula" />
            <el-option label="Select" value="select" />
          </el-select>
        </el-form-item>

        <!-- String Type Properties -->
        <template v-if="formData.dataType === 'string'">
          <el-form-item label="Max Length">
            <el-input-number v-model="formData.maxLength" :min="1" />
          </el-form-item>
        </template>

        <!-- Integer Type Properties -->
        <template v-if="formData.dataType === 'integer'">
          <el-form-item label="Min Value">
            <el-input-number v-model="formData.minValue" />
          </el-form-item>
          <el-form-item label="Max Value">
            <el-input-number v-model="formData.maxValue" />
          </el-form-item>
        </template>

        <!-- Formula Type Properties -->
        <template v-if="formData.dataType === 'formula'">
          <el-form-item label="Formula">
            <el-input
              v-model="formData.formula"
              type="textarea"
              :rows="3"
              placeholder="Enter calculation formula"
            />
          </el-form-item>
        </template>

        <!-- Select Type Properties -->
        <template v-if="formData.dataType === 'select'">
          <el-form-item label="Options">
            <div v-for="(option, index) in formData.options" :key="index" class="option-item">
              <el-input
                v-model="option.value"
                placeholder="Option value"
                class="option-input"
              />
              <el-button
                type="danger"
                circle
                @click="removeOption(index)"
                class="option-delete"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" plain @click="addOption" class="add-option">
              Add Option
            </el-button>
          </el-form-item>
        </template>

        <el-form-item label="Required">
          <el-switch v-model="formData.required" />
        </el-form-item>

        <el-form-item label="Default Value">
          <template v-if="formData.dataType === 'boolean'">
            <el-switch v-model="formData.defaultValue" />
          </template>
          <template v-else-if="formData.dataType === 'select'">
            <el-select v-model="formData.defaultValue" style="width: 100%">
              <el-option
                v-for="option in formData.options"
                :key="option.value"
                :label="option.value"
                :value="option.value"
              />
            </el-select>
          </template>
          <template v-else>
            <el-input v-model="formData.defaultValue" />
          </template>
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">Save</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// 初始化表单数据，确保所有可能的字段都有默认值
const initFormData = (node) => {
  const baseData = { ...node }
  if (node.type === 'column') {
    baseData.dataType = baseData.dataType || 'string'
    baseData.required = baseData.required ?? false
    baseData.maxLength = baseData.maxLength || 255
    baseData.minValue = baseData.minValue || 0
    baseData.maxValue = baseData.maxValue || 999999
    baseData.formula = baseData.formula || ''
    baseData.options = baseData.options || []
    baseData.defaultValue = baseData.defaultValue || ''
  }
  baseData.color = baseData.color || '#409EFF'
  baseData.description = baseData.description || ''
  return baseData
}

const formData = ref(initFormData(props.node))

// 监听节点变化，更新表单数据
watch(() => props.node, (newVal) => {
  formData.value = initFormData(newVal)
}, { deep: true })

const addOption = () => {
  if (!formData.value.options) {
    formData.value.options = []
  }
  formData.value.options.push({
    label: `选项${formData.value.options.length + 1}`,
    value: `option${formData.value.options.length + 1}`
  })
}

const removeOption = (index) => {
  formData.value.options.splice(index, 1)
}

const handleSubmit = () => {
  emit('update', { ...formData.value })
}
</script>

<style scoped>
.schema-form {
  padding: 20px;
}

.option-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.option-input {
  flex: 1;
}

.option-delete {
  flex-shrink: 0;
}

.add-option {
  width: 100%;
  margin-top: 10px;
}
</style> 