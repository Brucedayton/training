<template>
  <div class="schema-form">
    <el-form
      :model="formData"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <!-- Common Properties -->
      <el-form-item label="Name">
        <el-input v-model="formData.name" @change="handleChange" />
      </el-form-item>

      <el-form-item label="Color">
        <el-color-picker v-model="formData.color" @change="handleChange" />
      </el-form-item>

      <el-form-item label="Description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          @change="handleChange"
        />
      </el-form-item>

      <!-- Schema Properties -->
      <template v-if="formData.type === 'schema'">
        <el-form-item label="Database">
          <el-input v-model="formData.database" @change="handleChange" />
        </el-form-item>
        <el-form-item label="Table Name">
          <el-input v-model="formData.tableName" @change="handleChange" />
        </el-form-item>
      </template>

      <!-- Column Properties -->
      <template v-if="formData.type === 'column'">
        <el-form-item label="Data Type">
          <el-select v-model="formData.dataType" @change="handleChange" style="width: 100%">
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
            <el-input-number v-model="formData.maxLength" :min="1" @change="handleChange" />
          </el-form-item>
        </template>

        <!-- Integer Type Properties -->
        <template v-if="formData.dataType === 'integer'">
          <el-form-item label="Min Value">
            <el-input-number v-model="formData.minValue" @change="handleChange" />
          </el-form-item>
          <el-form-item label="Max Value">
            <el-input-number v-model="formData.maxValue" @change="handleChange" />
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
              @change="handleChange"
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
                @change="handleChange"
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
            <el-button type="primary" plain @click="addOption" class="add-option" @change="handleChange">
              Add Option
            </el-button>
          </el-form-item>
        </template>

        <el-form-item label="Required">
          <el-switch v-model="formData.required" @change="handleChange" />
        </el-form-item>

        <el-form-item label="Default Value">
          <template v-if="formData.dataType === 'boolean'">
            <el-switch v-model="formData.defaultValue" @change="handleChange" />
          </template>
          <template v-else-if="formData.dataType === 'select'">
            <el-select v-model="formData.defaultValue" style="width: 100%" @change="handleChange">
              <el-option
                v-for="option in formData.options"
                :key="option.value"
                :label="option.value"
                :value="option.value"
              />
            </el-select>
          </template>
          <template v-else>
            <el-input
              v-model="formData.defaultValue"
              :placeholder="getDefaultValuePlaceholder(formData.dataType)"
              @change="handleChange"
            />
          </template>
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">Save</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, defineComponent, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'SchemaForm',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const formData = ref({ ...props.node })

    // 监听 node 属性的变化
    watch(() => props.node, (newVal) => {
      formData.value = { ...newVal }
    }, { deep: true })

    const handleChange = () => {
      emit('update', { ...formData.value })
    }

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

    const getDefaultValuePlaceholder = (dataType) => {
      switch (dataType) {
        case 'string':
          return 'Enter text value'
        case 'number':
          return 'Enter numeric value'
        case 'boolean':
          return 'true or false'
        case 'date':
          return 'YYYY-MM-DD'
        case 'object':
          return '{ "key": "value" }'
        case 'array':
          return '["item1", "item2"]'
        default:
          return 'Enter value'
      }
    }

    return {
      formData,
      handleChange,
      addOption,
      removeOption,
      handleSubmit,
      getDefaultValuePlaceholder
    }
  }
})
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