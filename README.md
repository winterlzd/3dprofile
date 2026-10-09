# 刘振冬的三维个人主页

一个使用 Three.js 的个人空间，支持中文、英文、日文和系统深浅色主题。姓名、简介、项目、技能、学习经历与社交链接由真实的三维文字和实体组成，可独立摆放。

## 本地运行

```sh
npm install
npm run dev
```

开发地址通常为 `http://127.0.0.1:5173/`。`npm run build` 生成可直接部署的 `dist/` 静态网站，`npm run preview` 可预览构建结果。

## 操作

- 左键拖动物件：移动该实体；拖动空白处：平移视图。
- 中键拖动：围绕按下位置对应的三维点旋转相机。Shift + 左键也可旋转。
- 滚轮：围绕鼠标所在位置缩放。
- Alt + 拖动物件：沿相机视线调整远近；选中物件后，右下方面板可调整深度、旋转和恢复位置。
- 顶部「空间 / 项目 / 关于」导航定位重点内容；项目和关于区域的箭头可逐个聚焦物件。
- 手机单指拖动物件或平移空白，双指拖动旋转，双指捏合缩放。空间区域的箭头依次聚焦姓名、简介、GitHub 和 YouTube。
- 方向键平移相机，`+` / `-` 缩放，`0` 回到主页。选中实体时，Alt + 方向键移动实体。
- 底部菱形按钮查看空间总览；圆形箭头恢复所有实体的默认布局。

摆放结果保存在当前浏览器的 `localStorage` 中。语言和主题选择也会保存；首次访问使用系统语言和主题。不同访客的摆放互不影响。

## 内容与来源

- 个人简介依据用户提供的信息整理。学校信息按「中国矿业大学（北京）2026 级本科生」呈现。
- [GitHub 资料与仓库](https://github.com/winterlzd)于 2026-10-09 检查；项目列表仅包含 GitHub API 标记为 `fork: false` 的六个仓库。
- openSolid 文案依据仓库描述及 `docs/features-expansion.md`，其余文案依据各项目 README。网页的立体示意图不代表实物照片或软件截图。
- [YouTube 频道](https://www.youtube.com/@%E5%88%98%E6%8C%AF%E5%86%AC-x7w)作为用户提供的社交入口。

修改文案：`src/i18n.js`；项目列表与无障碍 / 回退内容：`src/content.js`；默认位置与朝向：`src/spatial-layout.js`；三维实体和交互：`src/scene.js`。

## 三维文字

可见文字使用 `TextGeometry` 挤出，含正面、背面和侧面，字体为 SIL OFL 1.1 许可的 [Noto Sans CJK](https://github.com/notofonts/noto-cjk)。仅分发所需字符的轮廓子集，许可附在 `public/fonts/OFL.txt`。

增加新字符时，需要从 Noto Sans CJK 的官方仓库取得 OTF 文件，准备包含新文案的字符文本，并安装 Python 的 `fonttools`，再运行：

```sh
python scripts/convert-font.py NotoSansCJKsc-Regular.otf characters.txt public/fonts/noto-cjk-subset.json
```

`scripts/convert-font.py` 会调整 CFF 轮廓方向，使挤出后字面与内部孔洞保持正确。没有 WebGL 或字体加载失败时，网站自动显示可阅读的 HTML 回退内容；三维版本也保留屏幕阅读器内容。

## 验证

```sh
npm test
npm run build
```

测试覆盖旋转中心保持、平移方向、字体轮廓与实体厚度、三语字符和换行、非 fork 项目筛选、空间分布、布局存储及无效数据恢复。浏览器中另验证拖动与刷新恢复、三语切换、主题、小屏与项目聚焦。

## 发布

这是纯静态网站，可部署至 GitHub Pages、Cloudflare Pages、Netlify 或任意静态服务器。`dist/` 内含本地三维字形数据；3D 主内容无需第三方字体服务。

`.openai/hosting.json` 保留当前 Sites 身份与静态输出设置。新的 Sites 预览按默认规则保持私有。
