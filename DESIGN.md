---
name: 创想设计平台
description: 面向产品 SKU 的克制、清晰、高密度 AI 设计工作台
colors:
  brand-deep: "#302b68"
  brand-primary: "#5145b4"
  brand-active: "#6658d6"
  brand-soft: "#f4f2ff"
  text-primary: "#272441"
  text-secondary: "#6d6982"
  canvas: "#f4f3f9"
  surface: "#ffffff"
  border: "#e5e2ef"
  success: "#278765"
  warning: "#9a620d"
typography:
  headline:
    fontFamily: 'Aptos, "Segoe UI", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "clamp(26px, 3vw, 36px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  body:
    fontFamily: 'Aptos, "Segoe UI", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Aptos, "Segoe UI", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "11px"
    fontWeight: 700
rounded:
  sm: "10px"
  md: "15px"
  lg: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "42px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: 创想设计平台

## Overview

**Creative North Star: "安静的生产控制台"**

界面服务于频繁、批量的设计生产：高信息密度，但通过稳定网格、浅色分区和单一紫色动作色保持秩序。图片是内容核心，装饰退居其后；状态、配方和 SKU 关系必须能被快速扫读。

**Key Characteristics:**

- 深紫导航锚定全局位置，冷白工作区承载任务。
- 卡片轻边框、低阴影，避免浮夸层叠。
- 关键数字使用等宽数字特性，批量关系用明确公式表达。

## Colors

紫色只用于导航、焦点和主要动作；绿色与琥珀分别表达完成与待处理，不能单靠颜色传达含义。

**The One Primary Action Rule.** 每个视图只保留一个最高强调的下一步动作。

## Typography

标题依靠 700–800 字重与紧凑字距建立层级；正文保持中性、易扫读；SKU、积分和数量使用稳定的表格数字。

## Layout

桌面使用 210px 固定侧栏和自适应主区；批量工作台在宽屏为“配方 + 结果”双列，1040px 以下改为单列。产品表在 760px 以下压缩为 SKU、底图、名称和进入动作四列，不产生横向滚动。间距以 4px / 8px 为基础节奏。

## Elevation & Depth

深度采用冷色低透明环境阴影；常规内容优先用边框分层，抽屉和弹窗才使用较明显的中层阴影。

## Shapes

输入和小控件使用 10px 圆角，内容容器使用 15px，重要大面板最多 20px。状态胶囊只用于短标签，不用于大面积容器。

## Components

### Buttons

- 主按钮为品牌紫底白字、42px 高；次级按钮为白底细边框。
- 图标按钮必须有可读名称，并保持可见焦点环。

### Chips

- 提示词与状态使用浅底短标签；选中态同时包含文字或图标反馈。

### Cards / Containers

- 白色表面、1px 冷灰边框、10–15px 圆角；同一层级不叠加重阴影。

### Inputs / Fields

- 白底、细边框、10px 圆角；键盘焦点使用品牌紫色外环。

### Navigation

- 桌面维持左侧深紫导航；900px 以下折叠为菜单按钮，当前页面同时使用背景块和文字强调。

### SKU Result Group

- 批量结果始终按 SKU 分组，产品底图与编号作为组头；单张重做与删除紧邻对应结果卡。

## Do's and Don'ts

### Do:

- **Do** 使用真实白底产品图作为产品库和规格区的视觉事实。
- **Do** 让批量公式、进度和保存状态在首屏可定位。
- **Do** 在手机端优先展示完成任务所需的核心字段。

### Don't:

- **Don't** 用场景效果图代替产品底图。
- **Don't** 把复杂提示词选项全部铺在主页面；使用摘要与编辑弹窗渐进展示。
- **Don't** 让生成历史脱离 SKU 归属或丢失提示词标签。
