# 创想设计平台｜通用 AI 产品设计工作台

一个本地优先的通用 AI 产品设计 MVP。平台把产品库、设计项目、模型连接、行业模板、素材和导出拆成独立模块；帐篷设计作为第一个行业模板运行在通用设计引擎之上。

## 核心能力

1. 从空白、上传参考图或产品库 SKU 发起设计
2. 文生图、图生图和多图融合任务切换
3. 可切换 OpenAI 与千问；首次生成时输入对应密钥，当前标签页临时使用
4. 产品库、素材库、设计版本和导出记录分离
5. 帐篷设计、通用商品图、场景换图和电商白底图模板
6. 本地状态保存与 Windows EXE 构建

默认生成模式为“精细成片”。“当地背景”选项会把地标、住宅、自然光与当地生活方式转成不抢产品主体的环境规则；“产品配色”只调整帐篷面料，不给整张图片套色。所有成片默认要求真实商业摄影、广告级后期、自然空间尺度与清晰材质纹理。

## 启动

在项目目录运行：

```powershell
.\start.ps1
```

浏览器会自动打开本地工作台。开发版数据保存在 `data/state.json`。

也可以运行 `dist/DesignFlow Studio.exe`。EXE 版本把数据保存在当前 Windows 用户的 `%LOCALAPPDATA%/DesignFlow Studio/data/`。

## 配置 OpenAI 与千问图像模型

线上支持 OpenAI `gpt-image-2` / `gpt-image-2.5-sunburst` 与阿里千问 `qwen-image-3.0` / `qwen-image-3.0-pro`，通过 Cloudflare Worker 无状态转发。首次点击生成时，页面会弹窗要求输入当前通道的 API Key；密钥只保存在当前浏览器标签页的 `sessionStorage`，关闭标签页后自动清除。密钥不会写入 GitHub、Cloudflare Secret、`.env` 或应用长期状态。

浏览器在每次生成与任务查询时通过 HTTPS 把对应密钥发送给 Worker，Worker 只负责转发，不持久化、不返回密钥。模型连接页可分别更换或清除两个平台在本标签页中的密钥。

批量创作会把 SKU 产品图作为参考图。OpenAI 同步返回图片，千问通过异步任务生成并轮询结果；系统会按各平台的节奏分批提交。阿里返回的图片 URL 仅在 24 小时内有效，OpenAI 返回的图片只在当前标签页保留，因此两种通道都应在生成后及时下载。

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

Cloudflare 的 Git 构建继续以 `app/` 作为静态资源目录，`worker.js` 负责无状态转发 OpenAI 与千问接口；`app/assets/studio/` 保存线上工作台图片。不需要配置 Cloudflare Access 或模型密钥 Secret。

## 目录

- `app/`：界面与交互逻辑
- `assets/studio/`：设计工作台使用的真实图片素材
- `data/`：运行时本地状态
- `docs/`：产品审计、设计依据与需求文档
- `server.py`：本地静态服务、状态与配置接口

## 生产化前必须完成

- 长期图片对象存储与自动备份
- 多用户角色、用量账单和审计日志
- 更完整的图片编辑能力与批量导出
- Windows 安装包、代码签名与自动更新
