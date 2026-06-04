# Demo调试记录 v0.1

日期：2026-06-03  
状态：本地 Demo 可运行

## 1. 实现内容

- React + TypeScript + Vite 项目骨架。
- 50 只宠物数据。
- 30 个属性技能。
- 5 张地图数据与暗雷生态。
- 初始宠物选择。
- 2D Tile 地图移动。
- 暗雷遇敌。
- 回合制战斗弹层。
- AP 技能消耗。
- 捕获按钮与捕获概率。
- 队伍、仓库、图鉴、地图、合成面板。
- 同 Lv 合成规则：同属性锁定同属性升阶，不同属性全池随机。
- 五地图解锁规则。
- localStorage 本地保存。

## 2. 构建检查

已执行：

```text
npm run build
```

结果：

```text
TypeScript 检查通过
Vite production build 通过
```

## 3. 浏览器检查

已在本地浏览器打开：

```text
http://127.0.0.1:5173/
```

已检查：

- 页面标题正常。
- 首屏显示初始宠物选择。
- 选择初始宠物后进入青芽草原。
- 主界面、地图、资源栏、队伍信息正常显示。
- 方向移动正常。
- 队伍、合成、图鉴等面板可切换。
- 暗雷可触发。
- 战斗弹层可显示技能、AP、捕获按钮。
- 技能点击与回合结算没有控制台错误。

## 4. 环境说明

当前 Codex 环境没有系统 npm，因此本项目使用临时下载的 npm 安装依赖。  
新版 Vite 所依赖的 Rollup 原生包在当前 macOS 沙箱中会被签名策略拦截，因此 Demo 使用 Vite 4.x 稳定线运行。

当前依赖仍然满足：

- React
- TypeScript
- Vite
- lucide-react

## 5. 待后续加强

- 更细的速度行动顺序。
- 更完整的战斗动画。
- 宠物正式头像/像素图。
- 更明确的新手引导。
- 首领战平衡。
- 捕获、合成、地图解锁的长流程自动化测试。

## 6. UI/UX升级记录 v0.2

已完成：

- 新增程序化像素宠物精灵，覆盖全部宠物。
- 新增像素主角精灵，并接入地图玩家位置。
- 地图 Tile 改为像素纹理，包括草地、道路、水面、危险区、稀有区、营地、祭坛。
- 宠物卡、图鉴、初始宠物选择接入像素头像。
- 战斗界面改为像素 RPG 风格战场。
- 战斗单位加入大号像素立绘、选中态、行动态。
- 技能释放加入属性短特效，覆盖火、水、森、土、风、捕获、治疗/辅助/防御类表现。
- UI 改为更强的像素边框、硬阴影和游戏面板质感。
- 手机尺寸适配优化：地图缩放、按钮高度、面板标签、战斗弹层、技能按钮、资源栏。

已检查：

- 桌面尺寸页面加载正常。
- 手机宽度 390px 页面加载正常。
- 方向键、面板文本、地图信息在手机视口下存在。
- 浏览器控制台无错误。
- `npm run build` 通过。

## 7. 规则与战斗体验调整 v0.3

已完成：

- 同属性宠物只要成长 Lv 相同也可以合成。
- 同属性合成结果锁定为下一成长 Lv 的同属性宠物，具体物种随机。
- 不同属性合成结果仍从下一成长 Lv 全池随机。
- 合成面板提示已同步更新。
- 战斗界面从卡片式列表改为专属像素战场。
- 我方和敌方宠物使用独立站位、平台和小状态牌。
- 攻击方会有前冲动作，受击方会抖动并显示打击火花。
- 技能特效支持我方到敌方、敌方到我方两个方向。
- 敌方回合加入反向攻击动画。

## 8. 战斗行动状态修复 v0.4

已修复：

- 第三只宠物释放技能后，技能按钮没有立即进入不可用状态的问题。
- 战斗界面新增本回合本地行动记录，技能点击后立即标记该宠物为“已行动”。
- 宠物战斗位新增“已行动”标签和灰化状态。
- 技能按钮禁用样式增强，避免已行动状态不明显。

已检查：

- `npm run build` 通过。

## 9. 战斗操作优化 v0.5

已完成：

- 宠物释放技能后，自动切换到下一只能行动的宠物。
- 宠物选择防御后，也会自动切换到下一只能行动的宠物。
- 战斗命令区新增明确的“逃跑”按钮，普通暗雷战可直接脱离，首领战不可逃跑。
- 所有宠物新增“防御”行动。
- 防御后该宠物本回合不会攻击，并获得“防御中”状态。
- 防御中的宠物受到直接伤害时，伤害降低到原来的 1/3，最低仍为 1 点。

已检查：

- `npm run build` 通过。

## 10. 技能命中修复 v0.6

已修复：

- 我方宠物释放技能后，敌方 HP 没有减少的问题。
- 根因是自动切换宠物后，单体敌方目标 ID 可能仍指向已被移除或不再有效的敌人，导致技能没有可用目标。
- UI 层现在会自动校验当前选中的敌方目标；目标失效时，会改为第一个存活敌人。
- 战斗逻辑层也增加兜底：传入目标 ID 无效时，单体攻击会自动命中第一个存活敌人，避免空放技能。

已检查：

- `npm run build` 通过。

## 11. 技能目标选择 v0.7

已完成：

- 单体攻击技能在存在多个敌方单位时，会先弹出目标 Sub 面板。
- 玩家可以在 Sub 面板中选择要攻击的敌方宠物。
- 单体治疗、护盾、辅助技能在存在多个我方单位时，会弹出我方目标 Sub 面板。
- Sub 面板目标按钮显示属性、名称和当前 HP。
- 群体技能和自身技能仍直接释放，不额外打断操作节奏。

已检查：

- `npm run build` 通过。

## 12. 捕获规则调整 v0.8

已完成：

- 战斗中不再限制每场只能捕获一只宠物。
- 捕获成功后只移除被捕获的目标；如果敌方仍有其他宠物，战斗继续并可以继续捕获。
- 捕获成功日志会提示仍可继续捕获剩余野生宠物。
- 捕获成功率改为 HP 比例曲线：满 HP 成功率较低，HP 越低成功率越高。
- 捕获成功率最高封顶 80%。
- 捕获按钮在动画忙碌中暂时不可点击，避免重复触发。

已检查：

- `npm run build` 通过。

## 13. 战斗结算道具掉落 v0.9

已完成：

- 每次战斗胜利结算时，独立判定 30% 概率获得治疗果 x1。
- 每次战斗胜利结算时，独立判定 30% 概率获得捕获石 x1。
- 两种道具可以在同一场战斗中同时掉落。
- 治疗果和捕获石数量直接累加，不设置持有上限。

待检查：

- 当前环境缺少 Node/npm 运行入口，本次修改尚未执行 `npm run build`。

## 14. 本地 Node/npm 工具链恢复 v1.0

已完成：

- 找到 Codex 应用内置 Node：`/Applications/Codex.app/Contents/Resources/node`。
- 将 npm CLI `11.16.0` 安装到项目目录 `.tools/npm-11.16.0`。
- 新增项目内运行入口：`.tools/bin/node`、`.tools/bin/npm`、`.tools/bin/npx`。
- 修正 npm wrapper，使 npm scripts 内部也能通过 `.tools/bin` 找到 Node。
- 重新执行最新版构建，战斗结算道具掉落改动已进入 `dist`。
- 启动 Vite 开发服务：`http://127.0.0.1:5173/`。

已检查：

- `.tools/bin/node -v`：v24.14.0。
- `.tools/bin/npm -v`：11.16.0。
- `.tools/bin/npx -v`：11.16.0。
- `.tools/bin/npm run build` 通过。
- `http://127.0.0.1:5173/` 返回 `200 OK`。

## 15. 宠物等级与合成规则重构 v1.1

已完成：

- 合成阶段名称从 `Lv1/Lv2/Lv3` 改为 `初始体/进化体/完全体`。
- 宠物个体等级改为 Lv1-Lv10。
- 升级经验公式改为：当前 Lv * 10。
- Lv10 不再获得经验，经验固定为 0。
- 战斗胜利时，所有存活出战宠物获得经验。
- 被击败与被捕获的敌方宠物都会计入本场经验池，多敌人累加。
- 合成要求两只宠物同阶段且都达到 Lv10。
- 合成结果从下一阶段宠物池随机产生，并从 Lv1、0 经验开始。
- 野外敌方个体 Lv 按当前位置离营地距离生成。
- Boss 队伍固定为当前地图属性完全体 Lv10 一只 + 进化体 Lv10 两只，三只均不可捕获。
- 捕获率加入进化阶段与个体 Lv 难度权重，阶段影响大于个体 Lv，个体 Lv 影响大于 HP。

已检查：

- `./.tools/bin/node node_modules/typescript/bin/tsc --noEmit` 通过。
- `./.tools/bin/npm run build` 通过。
- `http://127.0.0.1:5173/` 返回 `200 OK`。

## 16. 公网测试链接部署 v1.2

已完成：

- 使用 `./.tools/bin/npm run build` 生成最新版静态包。
- 使用 Python 静态服务托管 `dist`。
- 使用 Cloudflare Quick Tunnel 创建公网测试链接。
- 公网链接已返回 `200 OK`，并确认返回 `原野契约 Demo` 页面资源。

公网测试链接：

```text
https://healthcare-actively-platforms-ranger.trycloudflare.com
```

限制：

- 当前链接依赖本机静态服务与 Cloudflare Tunnel 进程持续运行。
- Quick Tunnel 无长期在线保证，适合临时多人测试。
- 需要长期 24/7 访问时，应部署到 Vercel、Netlify、Cloudflare Pages 或 GitHub Pages 等静态托管平台。

## 17. 像素 UI 精细化升级 v1.3

已完成：

- 宠物精灵从 12x12 升级为 18x18 程序化像素，加入体型、角、翼、甲壳、水栖、元素特征与高光阴影。
- 主角精灵升级为 14x16，移动地图中的角色读图辨识度更高。
- 地图 Tile 增加草叶、石块、水纹、稀有地貌与危险地貌细节。
- 营地 Tile 改为小城镇/帐篷结构，首领 Tile 改为祭坛结构。
- 战斗背景加入远景树线、云层、地面碎片与分侧站位地形。
- 保持现有响应式布局逻辑，让新版精灵和地图细节继续兼容桌面与手机尺寸。

已检查：

- 宠物与主角像素矩阵行列数检查通过。
- `./.tools/bin/node node_modules/typescript/bin/tsc --noEmit` 通过。
- `./.tools/bin/npm run build` 通过。
- 桌面端截图检查通过，画面文件：`demo-visual-desktop.png`。
- 公网链接已返回新版资源：`index-e6b1fc2e.js`、`index-24a327b2.css`。

## 18. 宠物独立像素设计升级 v1.4

已完成：

- 新增 `src/data/petSpriteDesigns.ts`，为当前 50 只宠物逐一配置独立体型、纹理和专属特征。
- 宠物像素精灵从 18x18 升级到 24x24，增加轮廓、花纹、器官、羽翼、角、尾、甲壳、水泡、符文等表现空间。
- `PixelSprite.tsx` 重构为“固定宠物蓝图 + 专属特征叠加”的绘制系统，减少同类宠物外观相似问题。
- 调整宠物精灵在图鉴、队伍卡、初始选择和战斗界面的缩放倍率，避免 24x24 精灵撑开移动端布局。

已检查：

- 当前宠物总数 50，只数与精灵设计条目覆盖检查通过，缺失数为 0。
- `./.tools/bin/node node_modules/typescript/bin/tsc --noEmit` 通过。
- `./.tools/bin/npm run build` 通过。
- 公网链接已返回新版资源：`index-e0291db0.js`、`index-37593815.css`。

## 19. Boss 强度调整 v1.5

已完成：

- Boss 队伍从“当前地图属性完全体 Lv10 一只 + 进化体 Lv10 两只”改为“当前地图属性完全体 Lv10 三只”。
- 新增战斗单位属性倍率字段 `statMultiplier`，用于 Boss 战专属属性修正。
- Boss 完全体 Lv10 属性修正会影响 HP、攻击、防御、速度、暴击。
- 当前 Demo 最终采用 Boss 属性倍率 1.4。
- 新增 `scripts/bossBalanceSimulation.ts`，用于模拟完全体 Lv10 队伍挑战 Boss 的胜率区间。

平衡测试：

- 2.0 倍：5 张地图 300 次/地图模拟均接近或等于 0% 胜率，过强。
- 1.5 倍：草原可打，但后期地图即使搜索完全体组合也明显偏难。
- 1.3 倍：多张地图最佳组合接近稳定获胜，偏松。
- 1.4 倍：后期地图需要混合阵容、集火、治疗与防御策略，胜率落在更接近挑战 Boss 的区间。

已检查：

- `./.tools/bin/node node_modules/typescript/bin/tsc --noEmit` 通过。
- `./.tools/bin/npm run build` 通过。
- Boss 组合搜索模拟已执行。
- 公网链接已返回新版资源：`index-a5e16101.js`、`index-37593815.css`。

## 20. 回城、合成与 48x48 像素升级 v1.6

已完成：

- 地图操作栏新增“一键回城”按钮，非战斗状态下点击后传送回当前地图营地并恢复队伍。
- 移除合成时“至少保留一只出战宠物”的隐性阻挡；合成结果会立刻补入队伍或仓库，因此不会造成无宠可用。
- 合成失败时现在会写入日志，避免按钮看起来没有反应。
- 新增 `scripts/fusionValidation.ts`，用于检查所有初始体/进化体 Lv10 宠物两两合成。
- 宠物精灵输出矩阵从 24x24 升级为 48x48，并保留每只宠物独立蓝图与二级高光/阴影细节。
- 主角精灵输出矩阵升级为 48x48。
- 地图视窗调整为 15x11，Tile 桌面表现以 48px 为上限，并增加树丛、水纹、石块、火星、营地窗户、祭坛核心等环境细节。

已检查：

- 合成覆盖检查：295 组同阶段 Lv10 组合全部通过，失败数 0；验证中包含 HP 为 0 的合成素材。
- `./.tools/bin/node node_modules/typescript/bin/tsc --noEmit` 通过。
- `./.tools/bin/npm run build` 通过。
- 公网链接已返回新版资源：`index-49895c0f.js`、`index-95d79ad0.css`。

## 21. 中日语言切换 v1.7

已完成：

- 顶部操作区新增语言切换按钮，默认中文，点击可在中文与日本語之间随时切换。
- 语言偏好保存到 `wildbond-demo-language`，刷新页面后会保留上一次选择。
- UI 面板、地图、宠物名、属性、成长阶段、技能名、技能说明、状态名、战斗标题、按钮、资源栏、图鉴与地图列表已接入语言包。
- 游戏日志保留内部中文事件源，显示层按当前语言转换，避免改动旧存档结构。
- 切换语言时同步更新页面 `lang` 与浏览器标题。
- 语言按钮已接入当前像素风按钮样式，并保持桌面与手机布局兼容。

已检查：

- `./.tools/bin/node node_modules/typescript/bin/tsc --noEmit` 通过。
- `./.tools/bin/npm run build` 通过。
- 公网链接已返回新版资源：`index-43645de2.js`、`index-ea739a88.css`。

## 22. Boss 防御战败确认与 64x64 像素升级 v1.8

已完成：

- 修复 Boss 战中连续防御数回合后，如果队伍被击败，战斗界面会直接关闭导致看起来像“自动弹出/退出战斗”的问题。
- 战败时现在保留战斗界面并显示“队伍战败”确认面板，玩家点击“返回营地”后才会结算撤退与回血。
- 战败确认状态下会禁用技能、防御、捕获、逃跑与结束回合按钮，避免结果状态继续触发战斗指令。
- 新增 `scripts/bossDefenseRegression.ts`，用于验证 Boss 纯防御循环不会出现敌方仍在或我方仍存活时误判胜负。
- 宠物精灵输出矩阵从 48x48 升级为 64x64，并继续保留每只宠物的独立蓝图、纹理与元素细节。
- 主角精灵输出矩阵从 48x48 升级为 64x64。
- 地图 Tile 桌面表现上限调整到 64px 级别，环境纹理同步使用 64px 细节周期。
- 调整宠物/主角精灵 CSS 像素倍率，让 64x64 精灵提升细节但保持桌面和手机布局稳定。

已检查：

- `./.tools/bin/node node_modules/typescript/bin/tsc --noEmit` 通过。
- `scripts/bossDefenseRegression.ts` 回归通过；高地 Boss 纯防御到第 8 回合为真实战败，其它地图仍在战斗中，无胜负误判。
- `./.tools/bin/npm run build` 通过。
- 公网链接已返回最新版资源：`index-e27bd842.js`、`index-b0774c68.css`。

## 23. 属性相克伤害规则 v1.9

已完成：

- 属性优势伤害从旧的 125% 调整为 120%。
- 属性劣势伤害保持 80%。
- 同属性伤害从旧的 90% 调整为 100%。
- 无明确相克关系伤害保持 100%。
- 新增 `calculateElementalAttackDamage`，让相克倍率作用在“技能基础伤害 + 攻击方攻击贡献 - 目标防御减免”之后，确保攻击、防御、Boss 属性倍率和状态修正等基础数值都会参与相克收益。
- `scripts/bossBalanceSimulation.ts` 的技能估算同步改用正式属性倍率函数，避免模拟仍沿用旧倍率。
- 新增 `scripts/elementMatchupRegression.ts`，用于验证 120% / 80% / 100% 与攻击、防御参与计算。

已检查：

- `./.tools/bin/node node_modules/typescript/bin/tsc --noEmit` 通过。
- `scripts/elementMatchupRegression.ts` 回归通过；中立 40，优势 48，劣势 32，同属性 40。
- `./.tools/bin/npm run build` 通过。
- 公网链接已返回最新版资源：`index-21a345fd.js`、`index-b0774c68.css`。

## 24. 速度行动、暴击、图鉴详情与分解强化 v2.0

已完成：

- 战斗行动顺序从“我方从左到右行动后手动结束回合”改为全单位速度排序；包括敌方在内，速度高者先行动，同速时我方优先。
- 战斗面板改为当前行动者驱动：我方行动后自动推进到下一单位，敌方行动时自动播放动作并执行 AI。
- `灵` 属性正式替换为 `暴击`，暴击率范围 10%-50%；攻击触发暴击时本次伤害变为 1.5 倍。
- 重新配置元素属性倾向：火偏攻击/暴击，水偏 HP/暴击，森偏防御/速度，土偏 HP/防御，风偏攻击/速度。
- 所有技能标签与战斗技能按钮追加 hover 说明，展示 AP、目标、伤害公式、治疗比例、护盾、状态概率等信息。
- 图鉴卡片可点击打开详情面板，展示宠物名称、属性、阶段、定位、Lv1/Lv10 基础数值与技能列表。
- 新增分解水晶资源；仓库宠物可分解，出战宠物分解按钮灰色不可点击。
- 新增完全体强化：+1/+2/+3 分别消耗 3/6/10 分解水晶，每次强化提高基础属性并在名称后显示 +N。
- 强化后的完全体分解返还基础 3 点 + 已投入的强化水晶。
- 新增 `scripts/gameplaySystemsRegression.ts`，用于检查暴击范围、元素属性倾向、强化经济与速度行动顺序。
- Boss 完全体属性倍率从 1.4 调整到 1.25；倍率影响 HP、攻击、防御、速度，暴击不吃 Boss 倍率以避免后期地图不可战胜。

已检查：

- `scripts/gameplaySystemsRegression.ts` 回归通过。
- `scripts/bossDefenseRegression.ts` 回归通过，纯防御不会误判胜负或自动弹出战斗。
- `scripts/bossBalanceSimulation.ts 80 recommended` 已执行；未强化推荐队伍中前期地图可胜，后期地图需要混合阵容、治疗、防御与强化培养。
- `./.tools/bin/npm run build` 通过。
- 旧 Quick Tunnel 链接返回 Cloudflare 1033，已重新启动本地预览服务与 Cloudflare Quick Tunnel。
- 当前公网链接已返回新版资源：`https://pool-plants-machinery-manitoba.trycloudflare.com`，JS `index-cca58946.js`，CSS `index-7144b6db.css`。

## 25. PC 快捷键操作优化 v2.1

已完成：

- 非战斗状态下新增 PC 键盘快捷键：`Q` 一键回城，`W` 营地恢复，`1-5` 分别打开队伍、仓库、合成、图鉴、地图面板。
- 处理按键冲突：`W` 原本用于向上移动，现按需求改为营地恢复；向上移动保留方向键，`A/S/D` 仍可用于左/下/右移动。
- 战斗状态下新增快捷键：`1-3` 对应当前行动宠物的技能槽，`4` 防御。
- 技能需要选择目标时，数字 `1-3` 会按当前目标按钮从左到右选择对象，支持 `1 -> 1`、`3 -> 2` 等连续操作。
- 捕获保持鼠标点击，无快捷键。
- 所有快捷键按钮右上角显示按键提示；触控设备与手机宽度下隐藏提示，避免改变智能机操作界面。
- 初始选宠遮罩、图鉴详情弹窗、战斗结算状态、不可用技能或 AP 不足时，快捷键不会触发后台动作。

已检查：

- `./.tools/bin/npm run build` 通过。
- `scripts/gameplaySystemsRegression.ts` 回归通过。
- `scripts/bossDefenseRegression.ts` 回归通过。
- 本地预览与公网链接均返回新版资源：JS `index-d4c49a48.js`，CSS `index-e97c87a6.css`。

## 26. 野外遇敌距离分段优化 v2.2

已完成：

- 普通暗雷生成不再直接从整张地图完整遇敌池抽取，而是根据当前位置到己方营地的距离比例分段筛选。
- 营地周边 0%-28% 距离带只出现初始体 Lv1-Lv2，且固定单敌人，作为安全练级区。
- 28%-50% 距离带仍只出现初始体，等级提高到 Lv2-Lv4，并少量出现双敌人。
- 50% 以后才开始少量出现进化体；越接近地图深处，进化体权重、野怪等级和多敌数量越高。
- 普通暗雷仍不出现完全体，完全体主要保留给合成和首领战。
- 新增 `wildEncounterProfileForPosition` 与 `wildEncounterCandidatesForPosition`，方便后续继续调试不同地图的暗雷强度。
- `scripts/gameplaySystemsRegression.ts` 新增 `wildEncounterDistanceBands` 检查，覆盖 5 张地图近营地和远端区域的阶段、等级与敌方数量。

已检查：

- `./.tools/bin/npm run build` 通过，生成 JS `index-613b238a.js`、CSS `index-e97c87a6.css`。
- `scripts/gameplaySystemsRegression.ts` 回归通过，包含近营地 20 次抽样不出现进化体、不超过 Lv2、敌人数量固定 1 只。
- `scripts/bossDefenseRegression.ts` 回归通过。

## 27. 开局与暗雷频率优化 v2.3

已完成：

- 每张地图基础遇敌率提高：普通草地约 10%-12%，稀有/危险地形约 13%-16%。
- 新增连续可遇敌地形移动计数；连续未遇敌时概率逐步提高，第 10 步左右明显提高，第 15 步必定触发普通暗雷。
- 普通暗雷或 Boss 战触发后，连续移动计数归零；营地、道路、水域等安全地形不推进保底计数。
- 捕获石胜利掉落率从 30% 提高到 60%，治疗果仍保持 30%。
- 开局选择任意初始宠物时，宠物个体等级统一为 Lv3。
- 初始宠物选择界面显示 `Lv3`，避免玩家误以为仍从 Lv1 开始。
- `scripts/gameplaySystemsRegression.ts` 新增遇敌保底曲线、初始宠物 Lv3、捕获石 60% 掉落配置检查。

已检查：

- `./.tools/bin/npm run build` 通过，生成 JS `index-75a89595.js`、CSS `index-e97c87a6.css`。
- `GITHUB_PAGES=true ./.tools/bin/npm run build` 通过，确认 GitHub Pages 子路径构建正常。
- `scripts/gameplaySystemsRegression.ts` 回归通过，包含遇敌保底曲线、初始宠物 Lv3、捕获石 60% 掉落配置检查。
- `scripts/bossDefenseRegression.ts` 回归通过。

## 28. 移动端技能说明与属性技能重构 v2.4

已完成：

- 新增 `SkillInfo` 长按说明组件；手机端长按技能标签/战斗技能按钮可显示完整技能说明，点击说明浮层可关闭，数秒后自动消失。
- 队伍卡、图鉴详情、战斗技能按钮均接入长按说明；桌面端仍保留 hover/title 说明。
- 战斗中 AP 不足的灰色技能按钮也能长按查看说明，但点击仍不会释放技能。
- 每个属性新增 0AP 基础攻击：火苗击、水花击、叶芽击、砾石击、微风击。
- 所有宠物技能栏重排为最多 3 个技能槽，第一格固定为对应属性 0AP 基础攻击，便于每回合基础攻击并积攒 AP。
- 火系重调为单体/群体高伤害与灼烧；火山号令调整为敌方全体火焰伤害。
- 火系群体技能二次降温，降低 Boss 火系三完全体队伍连续群攻造成的不可控爆发。
- 水系重调为单体治疗、群体治疗、单体守护与群体控速；深海静默改为 1AP 全体强控速，泡沫屏障改为 1AP 单体守护。
- 森系重调为再生、单体守护、群体治疗与缠绕/破甲。
- 土系重调为自身石甲、全体石甲、防御辅助与破甲控制。
- 风系保留速度、先手、轻护盾与终结输出定位。
- 治疗公式调整为受施放者攻击影响；守护护盾调整为受施放者防御影响。
- 修复风系全体攻击附带自身加速时可能把疾风错误施加给敌方目标的问题。
- Boss 完全体属性倍率从 1.25 调整为 1.15，开场 AP 与玩家一致为 1，保留后期压力但避免火山/高地出现推荐阵容近乎无法获胜的问题。
- `scripts/gameplaySystemsRegression.ts` 新增 `elementSkillKits`，检查每只宠物都有对应属性 0AP 基础攻击、最多 3 个技能槽，并覆盖火群攻、水/森治疗、土全体防御定位。

已检查：

- `./.tools/bin/npm run build` 通过，生成 JS `index-c957ecb2.js`、CSS `index-6b956433.css`。
- `GITHUB_PAGES=true ./.tools/bin/npm run build` 通过，确认 GitHub Pages 子路径构建正常。
- `scripts/gameplaySystemsRegression.ts` 回归通过，包含 `elementSkillKits`，确认 50 只宠物均拥有对应属性 0AP 基础攻击，且技能槽不超过 3 个。
- `scripts/bossDefenseRegression.ts` 回归通过，确认 Boss 战连续防御不会在胜负未成立时误退出。
- `scripts/elementMatchupRegression.ts` 回归通过，确认优势 120%、劣势 80%、同属性/无相克 100% 的伤害倍率仍作用在基础攻防结算之后。
- `scripts/bossBalanceSimulation.ts 80 recommended` 完成；推荐属性队在草原/海岸/峡谷保持可胜，火山/高地仍保留较高难度。
- `scripts/bossBalanceSimulation.ts 3 search` 完成；五张地图均找到可稳定胜利的混合完全体阵容。
- 本地预览 `http://127.0.0.1:5173/` 可正常返回页面入口。

## 29. 首领强化挑战 v2.5

已完成：

- 地图操作按钮从“挑战首领”调整为“首领强化挑战”。
- 普通首领仍通过首次靠近首领点自动触发，避免新玩家找不到首次通关入口。
- 当前地图普通首领首次通关后，首领强化挑战按钮解锁；强化挑战完成 3 次后进入完成状态并禁用。
- 新增每张地图独立的 `bossChallengeWins` 存档字段，旧存档会自动补齐为空记录。
- Boss 战新增 `bossChallengeLevel`，战斗标题和日志显示强化层级。
- 强化首领倍率设置为：普通首领 1.15，强化 +1 为 1.20，强化 +2 为 1.30，强化 +3 为 1.40。
- 强化胜利后只更新当前地图强化层级，不影响其它地图的普通首领通关与地图解锁逻辑。
- 新增 `scripts/bossChallengeSimulation.ts`，用于测试玩家完全体 Lv10 +1/+2/+3 强化队伍挑战对应强化首领的胜率。
- `scripts/gameplaySystemsRegression.ts` 新增 `bossChallengeProgression`，检查强化层级上限、倍率递增、胜利进度写入和超上限钳制。

平衡观察：

- 推荐克制队在 +1 到 +3 均有可胜空间；火山与高地依旧是压力较高的地图。
- 混合阵容搜索下，五张地图在 +1 到 +3 均能找到稳定可胜阵容，没有出现“属性相克与技能配合正确也完全打不过”的死局。

已检查：

- `./.tools/bin/npm run build` 通过，生成 JS `index-2e027c60.js`、CSS `index-6b956433.css`。
- `GITHUB_PAGES=true ./.tools/bin/npm run build` 通过，确认 GitHub Pages 子路径构建正常。
- `scripts/gameplaySystemsRegression.ts` 回归通过，包含 `bossChallengeProgression`。
- `scripts/bossDefenseRegression.ts` 回归通过，确认普通 Boss 防御循环旧问题未回归。
- `scripts/elementMatchupRegression.ts` 回归通过，确认属性相克伤害公式未受强化挑战改动影响。
- `scripts/bossChallengeSimulation.ts 80 recommended` 完成；玩家 3 只对应强化等级完全体队伍挑战 +1/+2/+3 强化首领均有可胜空间，其中火山与高地保留较高压力。
- `scripts/bossChallengeSimulation.ts 3 search` 完成；+1 到 +3、五张地图均找到稳定可胜混合阵容。

## 30. 战斗入场提示与游戏方式说明 v2.6

已完成：

- 战斗场景新增 2 秒入场提示，不写入战斗日志，避免打断原有战斗节奏。
- 普通暗雷显示“野生宠物出现了”，普通首领显示“地图首领出现了”，强化首领挑战显示“强化过的首领出现了”。
- 地图操作区新增“游戏方式说明”按钮，位置与一键回城、营地恢复、首领强化挑战保持同一操作区域。
- 游戏方式说明采用左侧类别、右侧详情结构；手机端自动改为顶部横向类别标签，详情区域滚动阅读。
- 说明内容覆盖冒险目标、野外探索、属性相克、战斗基础、培养合成、首领准备等新手上手信息。
- 属性相克说明同步当前规则：火克森/弱水，水克火/弱森，森克水/弱火，土克风/弱森，风克土/弱火。
- 说明弹窗支持中文与日语，语言切换后再次打开会显示对应语言内容。

已检查：

- `./.tools/bin/npm run build` 通过，生成 JS `index-ba969c33.js`、CSS `index-ab1ea142.css`。
- `GITHUB_PAGES=true ./.tools/bin/npm run build` 通过，确认 GitHub Pages 子路径构建正常。
- `scripts/gameplaySystemsRegression.ts` 回归通过，包含暴击、属性分配、强化经济、速度行动顺序、野外遇敌距离分段、遇敌保底、技能组与首领强化进度等检查。
- `scripts/bossDefenseRegression.ts` 回归通过，确认 Boss 战防御循环旧问题未回归。
- `scripts/elementMatchupRegression.ts` 回归通过，确认优势 120%、劣势 80%、同属性/无相克 100% 的伤害倍率仍作用在基础攻防结算之后。
- 本地预览 `http://127.0.0.1:5173/` 可正常返回页面入口。

## 31. 合成与强化失败概率 v2.7

已完成：

- 合成从必定成功改为概率成功：初始体 Lv10 合成进化体成功率 80%，进化体 Lv10 合成完全体成功率 50%。
- 合成失败时，两只材料宠物都会消失，并留下材料两者中随机一只的 Lv1 个体。
- 合成失败不会增加合成次数，也不会触发初始体/进化体首次合成解锁进度。
- 强化从必定成功改为概率成功：+1 成功率 80%，+2 成功率 50%，+3 成功率 30%。
- 强化失败后保留当前强化等级，但消耗掉的分解水晶不会返还。
- 合成成功、合成失败、强化成功、强化失败都会显示 1 秒像素风操作提示框。
- 队伍/仓库强化逻辑同步接入成功率；强化成功时继续保留原有 HP 上限补差逻辑。
- 游戏方式说明与合成面板提示已补充合成/强化成功率和失败后果，支持中文与日语。
- `scripts/gameplaySystemsRegression.ts` 新增 `fusionRiskEconomy`，覆盖合成成功率、失败结果、失败不推进合成进度、强化成功率配置。

已检查：

- `./.tools/bin/npm run build` 通过，生成 JS `index-7675e627.js`、CSS `index-e3e6478c.css`。
- `GITHUB_PAGES=true ./.tools/bin/npm run build` 通过，确认 GitHub Pages 子路径构建正常。
- `scripts/gameplaySystemsRegression.ts` 回归通过，包含新增 `fusionRiskEconomy`。
- `scripts/fusionValidation.ts` 验证通过，295 组同阶段合成候选均可在固定成功骰点下正常生成结果。
- `scripts/bossDefenseRegression.ts` 回归通过，确认 Boss 战防御循环旧问题未回归。
- `scripts/elementMatchupRegression.ts` 回归通过，确认属性相克伤害公式未受合成/强化经济改动影响。

## 32. 64x64 原生像素资源链路修复 v2.8

已定位问题：

- `src/components/PixelSprite.tsx` 旧实现使用 24x24 基础网格，再通过 `upscalePetGrid` / `upscaleSymbolGrid` 映射到 64x64，违反“源必须为 64x64”的要求。
- `.pixel-sprite` 旧 CSS 使用 `--p: 0.375px / 0.75px / 1.125px / 1.5px` 和战斗场景 `clamp(...)`，会产生非整数像素缩放。
- `.tile-grid` 旧实现使用 `repeat(15, minmax(..., 1fr))`，地图格子会随容器变成非 64x64 尺寸。
- 技能/命中特效旧动画存在 `scale(0.7)`、`scale(1.25)`、`scale(1.5)` 等非整数缩放。
- UI 图标旧实现来自 `lucide-react` SVG，不属于 64x64 原生像素资源。

已完成：

- 宠物 sprite 和主角 sprite 改为直接写入 64x64 网格，移除旧的 24x24 源缓冲与 upscale 函数。
- 所有 `.pixel-sprite` 显示单元改为整数：普通 1x 为 64x64，完全体/大型显示使用 2x 为 128x128。
- 地图瓦片固定为 64x64；移动端不再压缩瓦片，改为保留 64x64 并横向滚动地图视窗。
- 战斗特效移除非整数 `scale(...)`，保留位移、透明度和 steps 动画。
- 新增 `PixelIcon`：所有 UI 图标以 64x64 canvas 原生绘制，绘制前设置 `imageSmoothingEnabled = false`、`webkitImageSmoothingEnabled = false`、`mozImageSmoothingEnabled = false`。
- 全局 canvas / pixel icon / tile / sprite CSS 均设置 `image-rendering: pixelated` 与 `image-rendering: crisp-edges`。
- 移除 `lucide-react` 图标使用，按钮图标全部替换为 64x64 原生像素 canvas 图标。
- 新增 `scripts/pixelAssetAudit.mjs` 自检脚本，检查 64x64 源、无旧 upscale、无小数 sprite 单元、地图 64px、无非镜像 scale、无 lucide SVG 残留。

已检查：

- `./.tools/bin/node scripts/pixelAssetAudit.mjs` 通过，确认像素资源链路检查无失败项。
- `./.tools/bin/npm run build` 通过，生成 JS `index-bc824b14.js`、CSS `index-339c6a1e.css`。
- `GITHUB_PAGES=true ./.tools/bin/npm run build` 通过，确认 GitHub Pages 子路径构建正常。
- `scripts/gameplaySystemsRegression.ts` 回归通过，确认玩法系统未受像素资源链路改动影响。
- `scripts/fusionValidation.ts` 验证通过。
- `scripts/bossDefenseRegression.ts` 回归通过。
- `scripts/elementMatchupRegression.ts` 回归通过。

## 34. 手机端滚动菜单、触摸地图移动与按钮文字 v3.0

已定位问题：

- v2.9 为保证整屏不溢出，手机端也继承了 `body/html/#root overflow: hidden` 和 `.app-shell height: 100dvh`，导致下方队伍、仓库、合成、图鉴等菜单内容被压在底部小区域内，无法通过页面滚动查看。
- 手机端方向键仍占用地图下方空间，不适合竖屏操作。
- `max-width: 520px` 下部分按钮文字被隐藏或压成 `font-size: 0`，导致手机端按钮只剩图标，含义不清晰。

已完成：

- PC 端保持 v2.9 的固定视口布局与方向键移动逻辑不变。
- 手机端恢复页面纵向滚动：`body/html/#root` 允许 `overflow-y: auto`，`.app-shell` 改为自适应高度，菜单区域自然向下展开。
- 手机端地图尺寸保持 v2.9 的紧凑显示：竖屏地图壳约 `58dvh`，横屏地图壳保持约 `100dvh - 90px`，地图逻辑层仍为 `1012x748` contain 缩放。
- 手机端隐藏方向键 `.dpad`，释放屏幕空间。
- 手机端新增触摸地图移动：点击地图任一可见可用格，会朝该格方向移动一步；点击相邻格等同进入该格，仍保留逐格移动、暗雷遇敌和 Boss 触发逻辑。
- 触摸地图支持轻点判定，拖动超过 10px 不触发移动，避免页面滚动时误移动。
- 手机端按钮改为文字优先显示：隐藏操作按钮中的像素图标，恢复地图按钮、顶部保存/重置、语言按钮、菜单标签等文字；保存/重置按钮新增移动端文字标签。
- 新增 `scripts/mobileMapTapQa.mjs`，用于模拟手机触摸地图并确认坐标变化。
- `scripts/responsiveViewportQa.mjs` 更新：手机端允许纵向滚动，检查方向键隐藏、按钮文字可读、地图仍在视口内、无横向滚动。

已检查：

- `./.tools/bin/npm run build` 通过，生成 JS `index-f8dda9ab.js`、CSS `index-d02de574.css`。
- `GITHUB_PAGES=true ./.tools/bin/npm run build` 通过，确认 GitHub Pages 子路径构建正常。
- `./.tools/bin/node scripts/pixelAssetAudit.mjs` 通过，确认 64x64 像素资源链路未回退。
- `./.tools/bin/node scripts/responsiveViewportQa.mjs http://127.0.0.1:5173/` 通过，检查 `1920x1080`、`1366x768`、`390x844` 手机竖屏、`844x390` 手机横屏。
- 手机竖屏和横屏确认：无横向滚动，页面可纵向滚动，方向键隐藏，地图仍在视口内，按钮文字可读。
- `./.tools/bin/node scripts/mobileMapTapQa.mjs http://127.0.0.1:5173/` 通过，手机触摸地图后坐标从 `8,8` 移动到 `9,8`。
- `scripts/gameplaySystemsRegression.ts` 回归通过。
- `scripts/fusionValidation.ts` 验证通过。
- `scripts/bossDefenseRegression.ts` 回归通过。
- `scripts/elementMatchupRegression.ts` 回归通过。
- 本地预览 `http://127.0.0.1:5173/` 可正常返回页面入口。

## 33. PC / 手机视口自适应与 64px 像素保持 v2.9

已定位问题：

- `index.html` 旧 viewport 未禁止移动端浏览器缩放，手机端可能被浏览器手势缩放和页面滚动影响布局。
- `.tile-grid` 固定为 15x11 个 64px 瓦片后，逻辑地图尺寸为 `1012x748`，直接参与普通 DOM 布局时会撑大地图壳。
- 手机端旧规则通过 `overflow-x: auto` 让地图横向拖动查看，违背“地图与 UI 完整显示在视口内”的要求。
- `.dashboard` 旧规则 `align-items: start` 会让左侧地图区域按内容高度而非可用高度布局，方向键容易被挤出可视区。

已完成：

- `index.html` viewport 更新为 `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`。
- `MapView` 新增地图 contain 缩放逻辑：监听 `ResizeObserver`、`resize`、`orientationchange`，按 `min(舞台宽 / 1012, 舞台高 / 748)` 动态计算显示倍率。
- 地图逻辑层仍保持 15x11 个原生 64x64 瓦片，逻辑分辨率固定为 `1012x748`。
- `.tile-grid` 改为绝对定位在 `.tile-stage` 中心，通过 `transform: translate(-50%, -50%) scale(var(--map-scale))` 做显示层缩放，不再用未缩放高度撑开布局。
- 页面外层改为 `100dvh` 游戏框，`body/html/#root` 禁止页面滚动；多余空间由背景填充。
- PC / 平板 / 手机横竖屏增加最终响应式覆盖规则，地图、方向键、右侧资源与标签区域均保持在视口内。
- 64px 像素资源链路自检更新：允许唯一的 viewport-fit 地图缩放变量，继续禁止其它非镜像 `scale(...)`。

缩放说明：

- 地图逻辑分辨率：`1012x748`，来自 `15 * 64 + 14 * 2 + 12 * 2` 宽、`11 * 64 + 10 * 2 + 12 * 2` 高。
- 当前最大显示倍率为 `1x`，足够空间时保持 1 个源像素对应 1 个显示像素。
- 当视口或地图舞台不足时，使用 contain 小数倍率缩小整张逻辑地图；源瓦片仍是 64x64，CSS 仍使用 `image-rendering: pixelated` / `crisp-edges`。

已检查：

- `./.tools/bin/npm run build` 通过，生成 JS `index-07736923.js`、CSS `index-aef9c0d4.css`。
- `GITHUB_PAGES=true ./.tools/bin/npm run build` 通过，生成 JS `index-07736923.js`、CSS `index-aef9c0d4.css`。
- `./.tools/bin/node scripts/pixelAssetAudit.mjs` 通过，确认 64x64 源、无旧 upscale、地图 64px、仅允许地图 viewport-fit 缩放。
- `./.tools/bin/node scripts/responsiveViewportQa.mjs http://127.0.0.1:5173/` 通过，检查视口：`1920x1080`、`1366x768`、`390x844` 手机竖屏、`844x390` 手机横屏。
- 四组视口均确认：`body` 无横向/纵向滚动，地图舞台、地图显示层、方向键、右侧栏、初始宠物选择弹窗均在视口内。
- `scripts/gameplaySystemsRegression.ts` 回归通过，确认玩法系统未受布局改动影响。
- `scripts/fusionValidation.ts` 验证通过。
- `scripts/bossDefenseRegression.ts` 回归通过。
- `scripts/elementMatchupRegression.ts` 回归通过。
