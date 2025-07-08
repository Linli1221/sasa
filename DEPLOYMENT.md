# AI小说生成器部署指南

本指南提供将AI小说生成器应用程序部署到腾讯云EdgeOne Pages的说明。

## 先决条件

* 启用了EdgeOne的腾讯云账户。
* GitHub账户。
* 托管在GitHub仓库中的AI小说生成器项目代码。

## 部署步骤

### 1. 连接到GitHub

1.  登录腾讯云控制台并导航到EdgeOne Pages仪表板。
2.  点击"创建项目"并选择"连接到GitHub"。
3.  授权EdgeOne访问你的GitHub仓库。

### 2. 配置项目设置

1.  **选择仓库：** 选择包含AI小说生成器项目的GitHub仓库。
2.  **框架预设：** EdgeOne可能会自动检测框架。如果没有，请选择"Vanilla JS"或类似的基本预设。
3.  **根目录：** 保留默认值(`./`)。
4.  **输出目录：** 设置为`public`。
5.  **构建命令：** 保留为空，因为这是一个静态HTML/JS/CSS项目，不需要构建步骤。
6.  **安装命令：** 保留为空。
7.  **Node.js版本：** 选择最新版本（例如18.x或20.x）。

### 3. 配置`edgeone.json`（可选）

为了进行更高级的配置，你可以在项目根目录中创建一个`edgeone.json`文件。以下是此项目的推荐配置：

```json
{
  "name": "ai-novel-generator",
  "outputDirectory": "public",
  "headers": [
    {
      "source": "/*",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Cache-Control", "value": "max-age=7200" }
      ]
    },
    {
      "source": "/assets/*",
      "headers": [{ "key": "Cache-control", "value": "max-age=31536000" }]
    }
  ]
}
```

### 4. 部署

1.  点击"部署"开始部署过程。
2.  EdgeOne将克隆你的仓库，应用设置，并部署你的应用程序。
3.  部署完成后，你将获得一个访问AI小说生成器的唯一URL。

## 更新应用程序

要更新应用程序，只需将更改推送到连接的GitHub仓库。EdgeOne将自动检测更改并重新部署应用程序。
