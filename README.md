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

## 配置千问图像模型

线上使用阿里千问 `qwen-image-3.0-pro`，通过 Cloudflare Worker 服务端代理调用。API Key 只能保存为 Worker Secret：

```powershell
wrangler secret put QWEN_API_KEY
```

生成接口为 `/api/qwen/*`，必须由 Cloudflare Access 保护，并在 Worker 中再次校验 Access JWT。Access 应用创建后，将团队域名前缀和应用 Audience 写入 `ACCESS_TEAM_DOMAIN`、`ACCESS_AUD`。完整密钥不会发送到浏览器、状态文件或 GitHub。

批量创作会把 SKU 产品图作为参考图，通过异步任务生成并轮询结果。单批最多 24 张、提交并发为 2。阿里返回的图片 URL 仅在 24 小时内有效，生成后应及时下载。

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

Cloudflare 的 Git 构建继续以 `app/` 作为静态资源目录，`worker.js` 负责受保护的千问接口；`app/assets/studio/` 保存线上工作台图片。

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
