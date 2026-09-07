# 创想设计平台｜通用 AI 产品设计工作台

一个本地优先的通用 AI 产品设计 MVP。平台把产品库、设计项目、模型连接、行业模板、素材和导出拆成独立模块；帐篷设计作为第一个行业模板运行在通用设计引擎之上。

## 核心能力

1. 从空白、上传参考图或产品库 SKU 发起设计
2. 文生图、图生图和多图融合任务切换
3. 多模型连接与服务端密钥托管
4. 产品库、素材库、设计版本和导出记录分离
5. 帐篷设计、通用商品图、场景换图和电商白底图模板
6. 本地状态保存与 Windows EXE 构建

## 启动

在项目目录运行：

```powershell
.\start.ps1
```

浏览器会自动打开本地工作台。开发版数据保存在 `data/state.json`。

也可以运行 `dist/DesignFlow Studio.exe`。EXE 版本把数据保存在当前 Windows 用户的 `%LOCALAPPDATA%/DesignFlow Studio/data/`。

## 配置 Gemini API

把项目根目录的 `.env.example` 复制为 `.env`，再填写：

```text
GEMINI_API_KEY=你的_Google_AI_Studio_密钥
```

“模型连接”页面只显示连接状态和密钥末四位；完整密钥不会发送到浏览器或写入状态文件。当前演示生成仍使用本地适配器，正式调用需在服务端增加统一模型任务接口。

## 数据对象

- `Product`：SKU 与基础产品资料
- `Asset`：参考图、生成图和可复用素材
- `DesignProject`：一次设计工作的容器，可选关联产品
- `GenerationJob`：模型调用、状态、费用和错误
- `DesignVersion`：已保留的设计结果
- `Template`：动态字段、提示词和输出预设
- `ProviderConnection`：模型服务商与能力配置
- `ExportPreset`：尺寸、格式与交付规范

关键约束：`DesignProject.productId` 是可选字段，因此用户既能独立创作，也能基于 SKU 设计并把结果写回产品版本。

## 帐篷模板

帐篷模板提供结构、材质、年龄、场景、装饰元素、安全要求和输出预设，但这些字段不进入通用设计页面。未来可用同样方式增加家具、服装、包装等模板。

## 构建 Windows EXE

```powershell
.\build_exe.ps1
```

## 部署 Cloudflare Worker

线上 Worker 名称为 `zhangpeng-app`。部署前运行：

```powershell
.\build_cloudflare.ps1
wrangler deploy --dry-run
wrangler deploy --keep-vars
```

Cloudflare 的 Git 构建继续以 `app/` 作为静态资源目录；`app/assets/studio/` 保存线上工作台图片。

## 目录

- `app/`：界面与交互逻辑
- `assets/studio/`：设计工作台使用的真实图片素材
- `data/`：运行时本地状态
- `docs/`：产品审计、设计依据与需求文档
- `server.py`：本地静态服务、状态与配置接口

## 生产化前必须完成

- 服务端多模型适配层与异步任务队列
- 真实生成进度、失败重试、取消和用量计费
- 账号权限、云端同步、备份和审计
- 更完整的图片编辑能力与批量导出
- Windows 安装包、代码签名与自动更新
