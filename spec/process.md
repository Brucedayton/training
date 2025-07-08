📘 步骤总览
### 第 1 步：读取 Excel 文件
使用 openpyxl 加载 workbook
遍历每个 sheet，进行逐页分析

### 第 2 步：识别 Comment 区（符号解释）
* 2.1	在前若干行中查找连续的两列（如 A-B、B-C、C-D）构成的 KV 对
* 2.2	符号位于左列，说明在右列，遇空行停止
* 2.3	构建 comment_map 用于后续替换

### 第 3 步：识别 Table 区域（外框边界）
* 3.1	遍历所有 cell，识别那些四周都有边框线的矩形区域
* 3.2	每个矩形作为一个 Table 区块
* 3.3	Table 范围记录为 min_row:max_row, min_col:max_col

### 第 4 步：解析每个 Table
* 4.1 提取 Header 区域（Group + Column）
* 4.1.1	在 Table 最顶部，查找连续带背景色的行作为表头区
* 4.1.2	表头中最后一行为 Column，往上是 Group，每行一层
* 4.1.3	记录 header 层级，如：Group[0] = Module，Group[1] = Block，Column = [Name, Voltage]

#### 4.2 分割 Schema 区块（字段块）
* 4.2.1	从 Column 行以下开始，到 Table 底部为数据区域
* 4.2.2	按字段列（column 区）中字段名为空或空列作为分隔点
* 4.2.3	每一组连续的字段列构成一个 schema

### 第 5 步：提取 Schema 内容
* 5.1	提取每个 schema 的字段（来自 column 行）
* 5.2	提取每一行数据，对照字段名组成字典
* 5.3	若数据中出现特殊字符（✔ ✘ ∅），用 comment_map 替换值

### 第 6 步：构建结构化结果
每个 table 最终构造成如下结构：

```json
{
  "table_range": "A10:F20",
  "groups": [
    ["功能模块"],   // 第1层
    ["子模块"]     // 第2层
  ],
  "schemas": [
    {
      "columns": ["电压", "电流"],
      "range": "A12:B20",
      "data": [
        { "电压": "1.2V", "电流": "✔" },
        ...
      ]
    },
    ...
  ]
}
```
### 第 7 步：导出
