# 创想设计平台｜通用 AI 产品设计工作台

一个本地优先的通用 AI 产品设计 MVP。平台把产品库、设计项目、模型连接、行业模板、素材和导出拆成独立模块；帐篷设计作为第一个行业模板运行在通用设计引擎之上。

## 核心能力

1. 从空白、上传参考图或产品库 SKU 发起设计
2. 文生图、图生图和多图融合任务切换
3. 可切换 OpenAI 与千问；首次生成时输入对应密钥，当前标签页临时使用
4. 产品库、素材库、批次记录与验收结果分离
5. 帐篷批量创作、通用商品白底图和场景换图模板会真实应用到当前配方
6. 按全部素材、SKU 或批次导出 ZIP，并保留提示词与验收清单
7. 本地状态保存与 Windows EXE 构建

默认生成模式为“精细成片”。“当地背景”会为每座城市指定一个可辨认的主地标、合理机位和量化画面占比，并要求图生图时彻底替换参考图原有白底或旧场景；普通草坪、无名住宅和不可辨认的背景虚化不算完成地域要求。千问的长提示词关闭二次自动改写，避免地域硬约束被模型重写稀释；精细模式采用 2048 像素长边输出，并约束单一透视、连续地面、统一光向、真实产品尺度和人物焦平面。“产品配色”只调整帐篷面料，不给整张图片套色。

## 启动

在项目目录运行：

```powershell
.\start.ps1
```

浏览器会自动打开本地工作台。开发版会把状态写入 `data/state.json`；模型请求由本地服务转发到同一套线上无状态 Worker，因此本地与线上使用相同的模型契约。

也可以运行 `dist/DesignFlow Studio.exe`。EXE 版本把数据保存在当前 Windows 用户的 `%LOCALAPPDATA%/DesignFlow Studio/data/`。

## 配置 OpenAI 与千问图像模型

线上支持 OpenAI `gpt-image-2` / `gpt-image-2.5-sunburst` 与阿里千问 `qwen-image-3.0` / `qwen-image-3.0-pro`，通过 Cloudflare Worker 无状态转发。首次点击生成时，页面会弹窗要求输入当前通道的 API Key；密钥只保存在当前浏览器标签页的 `sessionStorage`，关闭标签页后自动清除。密钥不会写入 GitHub、Cloudflare Secret、`.env` 或应用长期状态。

浏览器在每次生成与任务查询时通过 HTTPS 把对应密钥发送给 Worker，Worker 只负责转发，不持久化、不返回密钥。模型连接页可分别更换或清除两个平台在本标签页中的密钥。

批量创作会把 SKU 产品图作为参考图。OpenAI 同步返回图片，千问通过异步任务生成并轮询结果；系统会按各平台的节奏分批提交。阿里返回的图片 URL 仅在 24 小时内有效，OpenAI 返回的图片只在当前标签页保留，因此两种通道都应在生成后及时下载。

## 核心数据对象

- `Product`：同时持有可追溯的产品参考图与基础资料
- `Recipe`：模板、提示词组、组合、变体和最终提示词确认指纹
- `GenerationJob`：模型调用、请求编号、状态、积分、错误和验收结果
- `Asset`：已通过验收并写回 SKU 的生成图片

纯组合、提示词编译、模板应用和验收判定集中在 `app/core.js`；供应商转发集中在 `worker.js`；ZIP 导出集中在 `app/export.js`。

## 帐篷模板

模板是可执行的 `Recipe` 预设：会切换公共场景并启用或停用对应提示词组。用户继续修改配方后，需要重新确认最终提示词。

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
- 真正的 AI 超分辨率；当前“4K 尺寸版”仅做本地像素尺寸导出，不增加图像细节
- Windows 安装包、代码签名与自动更新
