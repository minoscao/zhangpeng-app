# TentFlow Kids｜儿童帐篷设计与出图软件

一个本地优先的可运行 MVP，用于演示并验证以下业务闭环：

1. 儿童帐篷产品 / SKU 库
2. 按结构、年龄、原创主题生成童趣概念图并人工确认
3. 白底商品图输出
4. 全球化营销素材与资产归档
5. 网站、PPT、产品手册交付
6. 海外玩具、儿童家居、母婴与亲子户外门店发现
7. 三套本地化方案
8. WhatsApp 触达与跟进记录

## 启动

在项目目录运行：

```powershell
.\start.ps1
```

浏览器会自动打开 `http://127.0.0.1:8765`。所有数据保存在本机 `data/state.json`。

也可以直接运行已经构建的 `dist/TentFlow Studio.exe`。EXE 版本把数据保存在当前 Windows 用户的 `%LOCALAPPDATA%/TentFlow Studio/data/`，可从左侧“退出软件”安全关闭。

## 构建 Windows EXE

项目提供 `build_exe.ps1`。在安装了 PyInstaller 的项目虚拟环境中运行：

```powershell
.\build_exe.ps1
```

## 儿童帐篷核心类目

2026 年 9 月依据 Target、Walmart、Wayfair、IKEA 与 Etsy 的商品类目和在售款式，将设计生产所需的主要结构归并为：

1. Teepee 三角帐
2. 房屋 / 游戏屋帐篷
3. 主题弹开帐篷
4. 隧道 / 球池组合
5. 床帐 / 顶篷
6. 室内外露营帐
7. 婴幼儿防晒帐
8. 睡衣派对 A 字帐

第二层使用森林动物、恐龙、太空火箭、城堡童话、彩虹独角兽、海洋、车辆和咖啡小店等原创通用主题。平台研究参考：[Target Play Tents](https://www.target.com/c/play-tents-playground-sets-toys-games/-/N-5xt92)、[Walmart Kids Tents & Tunnels](https://www.walmart.com/c/kp/kids-tents-tunnels)、[Wayfair Play Tents](https://www.wayfair.com/baby-kids/sb0/play-tents-c490232.html)、[IKEA Play Tents](https://www.ikea.com/au/en/cat/play-tents-20484/)、[Etsy Kids Play Tents](https://www.etsy.com/market/kids_play_tents)。

## 当前版本说明

- 当前为 V0.3 儿童帐篷可交互原型，核心数据、生成任务、确认流程、交付导出和触达记录均可在本地保存。
- 款式、场景、材质、原创主题和视觉风格均提供原创矢量图片选择卡片；支持上传本地场景图片并生成融合预览。
- 概念生成按每张 12 积分演示计费，界面显示余额、单次扣分和最近生成时间；积分保存在本地状态中。
- 概念图、地图门店和 WhatsApp 使用明确标识的演示适配器，不会向外部平台发送数据。
- “网站素材包”可导出为独立 HTML；“PPT”当前导出可复制的演示提纲；“产品手册”提供浏览器打印/PDF版式。
- 接入真实 AI、地图数据与 WhatsApp Business Platform 时，应替换 `app/app.js` 中对应适配器，并补充服务端凭据托管、权限、合规和用量计费。

## 目录

- `app/`：产品界面与交互逻辑
- `assets/`：方案图与项目素材
- `data/`：运行时本地数据（首次启动后生成）
- `docs/`：会议纪要与产品需求
- `server.py`：本地静态服务与状态保存接口

## 生产化前必须完成

- Windows 安装包、代码签名与自动更新通道
- 真实 AI 模型服务端代理与密钥加密保管
- 官方地图/商户数据接口、授权与配额策略
- WhatsApp Business Platform 模板审批、用户同意、频控与退订
- 真正的 PPTX / PDF / 印刷文件生成器
- 账号、权限、备份、审计与计费
