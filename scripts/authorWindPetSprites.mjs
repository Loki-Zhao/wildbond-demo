import { fileURLToPath } from "node:url";
import {
  bakePetSprites,
  circle,
  ellipse,
  eye,
  mouth,
  paletteFrom,
  path,
  set,
  strokePath
} from "./petSpriteBake.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

const definitions = {
  "wind-chime-sparrow": {
    name: "风铃雀",
    form: "风铃雀并非普通飞鸟，而是停驻在银色风铃顶端的小雀灵，钟体下垂三条长短不一的气流飘带。",
    color: "浅青白羽毛配淡紫阴影，银色风铃使用珠白高光，飘带从青蓝过渡到薄雾紫。",
    difference: "主体是竖向悬挂风铃而非展翼鸟，顶部小雀、钟口负空间和三条垂直飘带构成独有剪影。",
    palette: paletteFrom({
      outline: "#35404c",
      body: ["#526273", "#7893a0", "#a9c8cb", "#d8e5dc"],
      belly: ["#76808e", "#a7b4bd", "#d8dee0"],
      motif: ["#66718a", "#8899b1", "#b6c8d6", "#e2edf0"],
      accent: ["#726484", "#9989aa", "#c3b5d0"],
      eye: "#f3d88b",
      dark: "#303746"
    }),
    draw(p) {
      return [
        path(p, "M25 16 C29 10 37 8 44 11 C50 14 52 21 49 27 C46 33 38 35 32 31 C26 28 23 22 25 16 Z", "url(#body)", "o", 0.8),
        path(p, "M28 16 C32 12 38 11 43 13", "none", "h", 0.55),
        path(p, "M27 20 C20 17 14 18 10 23 C15 28 22 29 29 26 Z", "url(#motif)", "o", 0.65),
        path(p, "M44 13 C47 8 52 6 56 8 C56 13 53 17 49 19 Z", "url(#accent)", "o", 0.55),
        path(p, "M44 24 C50 23 56 25 59 29 C55 32 49 32 44 29 Z", "url(#accent)", "o", 0.55),
        path(p, "M27 31 C31 28 43 28 47 32 L52 43 C47 49 28 49 23 43 Z", "url(#belly)", "o", 0.85),
        path(p, "M31 31 C35 29 41 29 45 32", "none", "q", 0.5),
        strokePath(p, "M24 43 C31 49 45 50 51 43", "v", 1.35),
        ellipse(p, 37, 43, 14, 4.2, "url(#motif)", "o", 0.6),
        path(p, "M27 47 C25 53 22 58 18 62", "none", "a", 2.3),
        path(p, "M37 48 C37 54 38 59 40 64", "none", "p", 2.3),
        path(p, "M47 47 C51 52 55 56 61 59", "none", "f", 2.3),
        path(p, "M16 61 C19 58 22 58 24 61 C22 64 18 65 15 64 Z", "url(#accent)", "o", 0.45),
        circle(p, 45, 18, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 45, 18);
      set(grid, 50, 22, "w");
      mouth(grid, 49, 24, 2, 1);
    }
  },
  "cloud-rabbit": {
    name: "云尾兔",
    form: "云尾兔沿右上方向翻跃，修长身体和后腿被拉成斜线，尾部散成一串逐级缩小的阶梯云团。",
    color: "银青毛发配珠白腹部，耳内和云影使用淡紫蓝，阶梯云团以高明度暖白聚焦。",
    difference: "不采用直立鳍耳兔或圆环结构；斜向翻跃身体、向后甩出的长腿和阶梯云尾形成开放式速度剪影。",
    palette: paletteFrom({
      outline: "#38414e",
      body: ["#546376", "#778da3", "#9fb9c7", "#d0e0df"],
      belly: ["#8492a0", "#b2c1c9", "#e0e8e5"],
      motif: ["#6f7b91", "#98aabc", "#c5d3dc", "#edf2ee"],
      accent: ["#756887", "#9d8daf", "#c7bad5"],
      eye: "#f1d68a",
      dark: "#313746"
    }),
    draw(p) {
      return [
        strokePath(p, "M29 43 C22 48 15 52 7 55", "o", 4),
        strokePath(p, "M28 42 C21 46 15 49 9 52", "g", 1.8),
        circle(p, 7, 55, 4, "q", "o", 0.5),
        circle(p, 15, 49, 3.3, "g", "o", 0.45),
        circle(p, 22, 43, 2.5, "q", "o", 0.4),
        circle(p, 28, 38, 1.7, "g", "o", 0.35),
        path(p, "M25 39 C29 31 38 25 47 26 C55 28 59 35 56 42 C53 49 44 52 35 49 C28 47 23 44 25 39 Z", "url(#body)", "o", 0.85),
        path(p, "M29 38 C34 31 41 28 48 29", "none", "h", 0.55),
        strokePath(p, "M36 49 C45 53 54 49 57 42", "v", 1.35),
        path(p, "M33 43 C39 39 47 39 52 43 C49 49 42 51 36 48 Z", "url(#belly)", "t", 0.45),
        path(p, "M45 27 C46 20 51 16 57 17 C63 19 66 24 64 30 C62 35 56 37 51 34 C47 33 45 30 45 27 Z", "url(#body)", "o", 0.75),
        path(p, "M48 19 C45 14 46 8 49 4 C54 7 56 13 54 19 Z", "url(#accent)", "o", 0.55),
        path(p, "M56 18 C58 12 62 9 66 10 C67 15 64 19 60 22 Z", "url(#accent)", "o", 0.55),
        path(p, "M31 46 C25 51 20 56 17 62", "none", "o", 3),
        path(p, "M39 49 C36 55 34 59 34 64", "none", "o", 3),
        strokePath(p, "M14 62 L20 62 M31 64 L37 64", "q", 1.2),
        path(p, "M30 36 C26 33 23 29 22 24 C27 24 32 28 34 33 Z", "url(#motif)", "o", 0.55),
        circle(p, 59, 26, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 59, 26);
      set(grid, 63, 31, "w");
      mouth(grid, 62, 33, 2, 1);
    }
  },
  "spin-dragonfly": {
    name: "旋叶蜓",
    form: "旋叶蜓以俯视角悬停，四片不等长透明翼围绕圆形风核旋转，细长分节尾巴向下弯成风向标。",
    color: "银灰躯干配浅青透明翼，翼脉使用淡紫蓝，中央风核以珠白和暖青高光点亮。",
    difference: "俯视旋翼结构与铜壳虫正面双盾结构完全不同，四片独立叶翼、圆核和弯曲长尾构成旋转符号。",
    palette: paletteFrom({
      outline: "#34424d",
      body: ["#53636f", "#748b96", "#9fb8be", "#d2dfdc"],
      belly: ["#7c8792", "#a9b6bd", "#d8e1df"],
      motif: ["#5f7887", "#7fa1ae", "#afd0d5", "#e2eeee"],
      accent: ["#6d6687", "#918bab", "#bbb7d1"],
      eye: "#efd582",
      dark: "#303945"
    }),
    draw(p) {
      return [
        path(p, "M32 29 C24 22 17 14 16 5 C25 6 32 13 36 23 Z", "url(#motif)", "o", 0.7),
        path(p, "M39 27 C45 18 53 13 62 13 C60 23 52 29 43 32 Z", "url(#motif)", "o", 0.7),
        path(p, "M39 36 C48 41 54 49 54 58 C44 56 38 48 35 40 Z", "url(#motif)", "o", 0.7),
        path(p, "M29 36 C21 43 13 45 5 42 C10 33 18 29 28 30 Z", "url(#motif)", "o", 0.7),
        strokePath(p, "M19 9 L34 28 M58 16 L39 30 M51 54 L37 37 M9 40 L31 33", "g", 0.65),
        circle(p, 35, 32, 9, "m", "o", 0.85),
        circle(p, 35, 32, 5, "q", "t", 0.5),
        circle(p, 35, 32, 2, "g", "d", 0.35),
        path(p, "M33 39 C31 45 32 51 36 55 C39 58 42 60 43 64", "none", "o", 3),
        strokePath(p, "M33 44 L38 44 M34 49 L40 49 M36 54 L42 54 M39 59 L44 59", "a", 1),
        path(p, "M29 26 C26 22 26 18 29 15 C33 17 35 22 34 26 Z", "url(#accent)", "o", 0.5),
        circle(p, 32, 30, 1, "e", "w", 0.3),
        circle(p, 38, 30, 1, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 32, 30);
      eye(grid, 38, 30, -1);
      set(grid, 35, 40, "v");
      mouth(grid, 33, 35, 5, 1);
    }
  },
  "light-feather-cat": {
    name: "轻羽猫",
    form: "轻羽猫四爪收拢悬挂在一张降落伞状羽帆下方，长尾被气流托成问号，身体像小小空降员。",
    color: "浅银青皮毛配奶白腹部，羽帆使用淡紫与青白分区，吊索以深冷蓝勾勒。",
    difference: "不采用奔跑或端坐猫形；上方巨大羽帆、四根吊索、下悬小猫与问号尾形成上下分层剪影。",
    palette: paletteFrom({
      outline: "#37414c",
      body: ["#536273", "#758b9d", "#9fb8c4", "#d1dfdc"],
      belly: ["#82909b", "#b0bec4", "#dfe6e2"],
      motif: ["#66768a", "#8ca2b5", "#bad0d9", "#e4eeee"],
      accent: ["#756888", "#9b8eae", "#c4b9d1"],
      eye: "#f1d488",
      dark: "#303744"
    }),
    draw(p) {
      return [
        path(p, "M8 24 C14 10 27 4 40 7 C52 10 60 20 60 31 C45 26 24 25 8 24 Z", "url(#motif)", "o", 0.9),
        path(p, "M12 22 C21 12 32 9 43 11", "none", "g", 0.65),
        strokePath(p, "M8 24 C23 27 45 28 60 31", "v", 1.4),
        strokePath(p, "M15 23 L26 40 M29 26 L31 40 M44 27 L39 40 M57 30 L45 42", "o", 0.9),
        path(p, "M25 39 C29 34 38 34 44 39 C49 44 48 52 42 56 C35 60 27 56 24 50 C22 46 22 42 25 39 Z", "url(#body)", "o", 0.8),
        path(p, "M28 39 C32 36 38 36 42 39", "none", "h", 0.5),
        path(p, "M30 35 C28 30 30 26 33 24 C37 27 38 32 36 36 Z", "url(#accent)", "o", 0.5),
        path(p, "M39 35 C41 30 45 28 49 29 C49 34 46 38 42 39 Z", "url(#accent)", "o", 0.5),
        path(p, "M30 49 C34 46 40 47 43 51 C41 56 36 58 32 55 Z", "url(#belly)", "t", 0.45),
        path(p, "M27 54 C24 58 21 61 17 63 M43 55 C47 58 51 60 55 61", "none", "o", 2.7),
        strokePath(p, "M14 63 L20 63 M52 61 L58 61", "q", 1.1),
        strokePath(p, "M46 48 C54 50 59 47 59 42 C59 38 56 36 53 38 C50 40 51 44 54 44", "a", 1.7),
        circle(p, 43, 43, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 43, 43);
      set(grid, 47, 47, "w");
      mouth(grid, 46, 49, 2, 1);
    }
  },
  "gale-wolf": {
    name: "岚翼狼",
    form: "岚翼狼上半身昂首咆哮，下半身消失在竖直龙卷中，左右肩翼像两枚后掠风刃而非真实羽翼。",
    color: "冷银蓝毛发配浅青胸鬃，龙卷由灰青、珠白和淡紫层层收束，肩翼使用高亮银色。",
    difference: "没有传统四足狼身；狼首胸躯悬浮于锥形龙卷之上，后掠双刃肩翼形成竖向速度剪影。",
    palette: paletteFrom({
      outline: "#33404b",
      body: ["#4f6072", "#70899e", "#9bb5c4", "#d0dfdf"],
      belly: ["#7c8b98", "#a9bac3", "#d9e4e2"],
      motif: ["#60788b", "#83a2b3", "#b1d0d8", "#e3efee"],
      accent: ["#706886", "#958cac", "#beb8d2"],
      eye: "#f0d27d",
      dark: "#2e3743"
    }),
    draw(p) {
      return [
        path(p, "M26 20 C29 11 38 7 47 11 C55 15 58 25 54 34 C50 43 40 47 31 42 C24 38 22 28 26 20 Z", "url(#body)", "o", 0.9),
        path(p, "M29 20 C34 13 41 12 47 14", "none", "h", 0.6),
        path(p, "M31 13 C29 7 32 3 36 1 C40 5 40 10 38 14 Z", "url(#accent)", "o", 0.55),
        path(p, "M43 12 C46 7 51 5 55 7 C54 12 51 16 47 18 Z", "url(#accent)", "o", 0.55),
        path(p, "M29 27 C20 21 12 20 5 24 C11 31 19 35 29 35 Z", "url(#motif)", "o", 0.75),
        path(p, "M51 27 C59 20 66 18 72 21 C67 29 59 34 50 36 Z", "url(#motif)", "o", 0.75),
        path(p, "M31 36 C36 32 45 32 50 36 C48 43 43 47 36 46 Z", "url(#belly)", "t", 0.5),
        path(p, "M29 43 C36 47 47 47 53 42 C51 50 48 55 44 58 C47 60 50 62 53 63 C44 66 32 64 25 60 C29 57 32 54 34 51 C30 49 27 47 24 44 Z", "url(#motif)", "o", 0.8),
        strokePath(p, "M29 48 C36 51 46 51 51 48 M28 56 C34 59 43 60 49 58", "g", 0.7),
        strokePath(p, "M35 64 C43 66 50 63 53 59", "v", 1.2),
        circle(p, 49, 21, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 49, 21);
      set(grid, 54, 27, "w");
      mouth(grid, 52, 30, 3, 1);
    }
  },
  "white-feather-deer": {
    name: "白羽鹿",
    form: "白羽鹿将四肢蜷起漂浮在倾斜羽环中，长颈回望后方，枝角由三枚独立羽片组成。",
    color: "珍珠白毛发配银青阴影，羽环与枝角使用淡紫、浅青和高明度暖白，蹄端以冷灰收束。",
    difference: "不采用站立鹿形；蜷卧漂浮姿态、倾斜开口羽环、回望长颈和羽片枝角形成轻盈椭圆剪影。",
    palette: paletteFrom({
      outline: "#3b414d",
      body: ["#5a6677", "#7e91a4", "#a9bec9", "#dce5df"],
      belly: ["#8995a0", "#b5c1c6", "#e2e7e1"],
      motif: ["#68778e", "#8e9fb7", "#bccbd8", "#e9efec"],
      accent: ["#756b8b", "#9a90af", "#c2bad1"],
      eye: "#efd180",
      dark: "#333845"
    }),
    draw(p) {
      return [
        path(
          p,
          "M8 39 C14 22 31 12 47 16 C59 19 66 30 63 43 C59 56 44 62 29 58 C17 55 8 49 8 39 Z M18 38 C22 29 32 23 42 24 C51 25 56 32 54 40 C52 48 42 52 33 50 C24 49 18 45 18 38 Z",
          "url(#motif)",
          "o",
          0.95,
          'fill-rule="evenodd"'
        ),
        strokePath(p, "M13 31 C21 20 35 17 47 20 M14 47 C23 56 39 59 51 53", "g", 0.65),
        path(p, "M20 36 C25 28 37 25 47 29 C55 33 56 42 50 48 C43 54 31 53 23 47 C18 44 17 40 20 36 Z", "url(#body)", "o", 0.8),
        path(p, "M24 35 C30 29 38 28 45 31", "none", "h", 0.55),
        path(p, "M39 30 C39 21 42 13 49 8 C55 8 59 13 58 19 C56 27 51 33 48 38 Z", "url(#body)", "o", 0.75),
        path(p, "M49 9 C48 4 50 1 54 -1 C57 3 57 7 55 11 Z", "url(#accent)", "o", 0.5),
        path(p, "M54 11 C58 6 62 5 66 7 C64 12 60 15 56 16 Z", "url(#motif)", "o", 0.5),
        path(p, "M48 12 C44 8 43 4 45 1 C49 3 51 7 51 11 Z", "url(#motif)", "o", 0.5),
        path(p, "M25 47 C22 51 19 54 15 56 M32 50 C30 54 29 57 30 60 M42 49 C44 53 47 55 51 57", "none", "o", 2.7),
        strokePath(p, "M12 56 L18 56 M27 60 L33 60 M48 57 L54 57", "q", 1.1),
        circle(p, 54, 14, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 54, 14);
      set(grid, 45, 50, "v");
      set(grid, 58, 19, "w");
      mouth(grid, 57, 21, 2, 1);
    }
  },
  "swift-weasel": {
    name: "疾风鼬",
    form: "疾风鼬身体拉成长长的 S 形气流丝带，仅头部、四爪和尾尖保持实体，三枚风环套在身体转折处。",
    color: "银蓝短毛配珠白腹线，气流身体使用浅青至淡紫渐变，风环以高亮暖白勾边。",
    difference: "不是横向小兽；S 形丝带身体、三个分离风环、悬空短爪和锐利头部构成书法般剪影。",
    palette: paletteFrom({
      outline: "#35404c",
      body: ["#506174", "#718ba1", "#9cb7c7", "#d0e1df"],
      belly: ["#7d8b99", "#aabac3", "#d9e4e1"],
      motif: ["#5e788c", "#80a2b6", "#afd1d9", "#e4f0ed"],
      accent: ["#716787", "#968dac", "#bfb8d1"],
      eye: "#f0d37f",
      dark: "#2f3744"
    }),
    draw(p) {
      return [
        strokePath(p, "M51 15 C39 10 27 15 27 25 C27 34 40 35 42 44 C44 53 32 60 19 56", "o", 8),
        strokePath(p, "M50 15 C39 12 30 16 30 25 C30 32 42 34 45 43 C47 51 36 57 22 55", "l", 5),
        strokePath(p, "M46 16 C39 14 34 17 33 22 M31 30 C36 33 41 36 43 41 M43 49 C39 54 32 56 25 55", "h", 0.7),
        ellipse(p, 32, 24, 11, 6.5, "none", "g", 1.2, 'transform="rotate(-18 32 24)"'),
        ellipse(p, 43, 42, 11, 6.5, "none", "a", 1.2, 'transform="rotate(28 43 42)"'),
        ellipse(p, 25, 55, 9, 5, "none", "p", 1.1, 'transform="rotate(-8 25 55)"'),
        path(p, "M44 11 C49 6 58 6 63 11 C67 16 65 23 59 26 C53 28 46 25 43 20 C41 17 42 14 44 11 Z", "url(#body)", "o", 0.75),
        path(p, "M47 10 C47 5 50 2 54 1 C57 5 56 9 54 12 Z", "url(#accent)", "o", 0.5),
        path(p, "M57 11 C59 6 63 5 67 7 C66 12 63 15 59 16 Z", "url(#accent)", "o", 0.5),
        path(p, "M22 53 C15 51 9 52 5 56 C10 60 17 61 24 58 Z", "url(#motif)", "o", 0.6),
        path(p, "M31 29 C27 31 23 33 19 36 M45 46 C51 47 55 49 58 52", "none", "o", 2.2),
        circle(p, 59, 15, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 59, 15);
      set(grid, 43, 44, "v");
      set(grid, 64, 20, "w");
      mouth(grid, 63, 22, 2, 1);
    }
  },
  "sky-thunder-vulture": {
    name: "天鸣鹫",
    form: "天鸣鹫收翼垂直俯冲，尖长喙与折叠翼共同组成雷矛，尾羽裂成三叉闪电，双爪贴近胸口。",
    color: "深银蓝羽毛配亮白胸线，翼缘与雷尾使用淡紫和电青高光，喙爪以冷金色突出。",
    difference: "不采用任何横向展翼鸟结构；垂直雷矛体、贴身折翼、三叉闪电尾和前伸尖喙形成狭长剪影。",
    palette: paletteFrom({
      outline: "#303c49",
      body: ["#485b70", "#667f99", "#8faabd", "#c6d9dc"],
      belly: ["#748594", "#9eafb9", "#d2dedf"],
      motif: ["#5a7089", "#7896af", "#a8c5d4", "#dcebed"],
      accent: ["#6d6488", "#9187ab", "#bbb3d0"],
      eye: "#f1d277",
      dark: "#2b3441"
    }),
    draw(p) {
      return [
        path(p, "M31 8 C35 3 43 2 48 6 C54 10 54 17 50 22 C46 27 38 27 33 23 C29 20 28 13 31 8 Z", "url(#body)", "o", 0.8),
        path(p, "M43 7 C48 4 55 5 59 9 C55 13 49 15 44 13 Z", "url(#accent)", "o", 0.55),
        path(p, "M30 19 C23 21 16 28 12 37 C20 37 27 34 33 29 Z", "url(#body)", "o", 0.75),
        path(p, "M47 19 C54 22 60 29 63 38 C55 37 48 34 43 29 Z", "url(#body)", "o", 0.75),
        path(p, "M31 20 C35 17 43 17 47 21 C51 31 49 44 42 52 C37 56 31 52 28 46 C24 36 25 27 31 20 Z", "url(#belly)", "o", 0.85),
        path(p, "M33 21 C37 18 42 19 46 22", "none", "q", 0.55),
        strokePath(p, "M18 34 C25 32 29 28 32 24 M57 34 C51 32 47 28 44 24", "h", 0.7),
        strokePath(p, "M34 52 C39 57 45 56 48 50", "v", 1.4),
        path(p, "M29 47 L23 61 L32 56 L36 65 L41 55 L51 61 L45 46 Z", "url(#motif)", "o", 0.7),
        strokePath(p, "M36 49 L36 61 M42 49 L47 57 M31 49 L27 57", "g", 0.65),
        path(p, "M31 38 C27 41 25 45 25 49 M45 38 C49 41 51 45 51 49", "none", "o", 2.2),
        circle(p, 46, 12, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 46, 12);
      set(grid, 54, 10, "w");
      mouth(grid, 51, 15, 3, 1);
    }
  },
  "cloud-kirin": {
    name: "云岚麒麟",
    form: "云岚麒麟以长颈回旋成开口云环，四只蹄子分别踏在独立云阶上，鬃毛与双角沿环形气流向后飘动。",
    color: "银白鳞毛配浅青腹线，云阶使用珠白与淡紫阴影，角和鬃毛加入高亮青蓝。",
    difference: "不采用普通四足麒麟或鹿形；长颈环、分离云阶、踏空四蹄和后飘双角构成开放环状剪影。",
    palette: paletteFrom({
      outline: "#35404d",
      body: ["#526477", "#748da3", "#9fbac8", "#d3e2df"],
      belly: ["#7e8d9b", "#acbbc3", "#dce5e1"],
      motif: ["#60788d", "#82a2b7", "#b1d0da", "#e5efed"],
      accent: ["#716889", "#978eaf", "#c0b9d3"],
      eye: "#f0d27f",
      dark: "#303744"
    }),
    draw(p) {
      return [
        strokePath(p, "M48 17 C35 12 21 18 18 30 C15 42 26 51 38 48 C47 46 51 38 48 31", "o", 8),
        strokePath(p, "M47 17 C36 14 24 19 22 30 C20 39 28 46 38 44 C45 42 48 36 46 31", "l", 5),
        strokePath(p, "M42 16 C34 16 27 21 24 28 M23 36 C27 43 35 46 42 43", "h", 0.7),
        path(p, "M42 13 C44 6 50 3 56 5 C62 8 64 15 61 21 C58 27 50 29 45 25 C42 22 41 17 42 13 Z", "url(#body)", "o", 0.75),
        path(p, "M45 8 C42 4 43 0 46 -2 C50 1 51 5 49 9 Z", "url(#accent)", "o", 0.5),
        path(p, "M51 6 C54 1 58 0 62 2 C61 7 58 10 54 11 Z", "url(#motif)", "o", 0.5),
        path(p, "M44 24 C51 26 57 31 59 37 C53 39 47 36 42 31 Z", "url(#accent)", "o", 0.55),
        path(p, "M21 36 C15 40 11 45 9 51 M30 46 C27 51 25 55 25 60 M40 45 C43 50 47 53 52 55 M47 35 C53 37 58 41 61 46", "none", "o", 2.5),
        ellipse(p, 8, 53, 5, 2.4, "url(#motif)", "o", 0.4),
        ellipse(p, 25, 61, 5, 2.4, "url(#motif)", "o", 0.4),
        ellipse(p, 54, 56, 5, 2.4, "url(#motif)", "o", 0.4),
        ellipse(p, 62, 47, 4.5, 2.2, "url(#motif)", "o", 0.4),
        circle(p, 56, 13, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 56, 13);
      set(grid, 38, 48, "v");
      set(grid, 61, 18, "w");
      mouth(grid, 59, 21, 3, 1);
    }
  },
  "storm-griffin": {
    name: "风暴狮鹫",
    form: "风暴狮鹫只保留狮首、单侧鹰爪和一枚包裹风眼的巨大弯月翼刃，下半部沿斜线收束为分叉龙卷尾。",
    color: "深银蓝狮鬃配浅青风眼，翼刃使用珠白与淡紫高光，龙卷尾压入冷灰蓝阴影。",
    difference: "不采用传统翼兽四足或正面对称结构；单侧弯月翼包住斜向风眼，狮首、独爪与分叉龙卷尾形成不平衡风暴图腾。",
    palette: paletteFrom({
      outline: "#303b48",
      body: ["#485a70", "#657e98", "#8ea9bb", "#c7dadd"],
      belly: ["#728391", "#9eafb8", "#d2ddde"],
      motif: ["#587188", "#7797af", "#a7c7d5", "#dceced"],
      accent: ["#6c6387", "#9087ac", "#bbb4d1"],
      eye: "#f0d175",
      dark: "#2b3440"
    }),
    draw(p) {
      return [
        path(
          p,
          "M6 15 C19 7 35 10 43 21 C52 34 47 49 35 57 C21 65 7 56 3 44 C15 48 28 43 31 32 C34 22 24 14 13 17 Z",
          "url(#motif)",
          "o",
          1,
          'fill-rule="evenodd"'
        ),
        strokePath(p, "M9 14 C23 10 36 16 41 27 M7 48 C16 55 27 56 36 51", "g", 0.7),
        strokePath(p, "M21 61 C35 63 47 53 49 40", "v", 1.5),
        path(p, "M34 21 L42 14 L50 17 L56 14 L61 22 L58 30 L63 36 L57 43 L48 45 L40 40 L35 32 Z", "url(#body)", "o", 0.85),
        path(p, "M39 22 C45 17 53 18 57 22", "none", "h", 0.55),
        path(p, "M34 31 C39 25 49 25 55 31 C60 37 57 46 50 50 C42 53 34 48 31 42 C29 37 30 34 34 31 Z", "url(#belly)", "o", 0.75),
        circle(p, 41, 41, 8.5, "a", "o", 0.65),
        circle(p, 41, 41, 4.5, "q", "t", 0.45),
        circle(p, 41, 41, 1.8, "g", "d", 0.3),
        path(p, "M34 49 C38 54 39 59 36 64 C42 62 46 59 48 55 C51 59 55 61 60 61 C55 55 52 50 51 46 Z", "url(#motif)", "o", 0.7),
        path(p, "M55 38 C62 39 67 43 69 49", "none", "o", 2.8),
        strokePath(p, "M66 49 L71 49", "q", 1.2),
        path(p, "M27 35 C20 36 15 40 12 46", "none", "o", 2.5),
        circle(p, 48, 27, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 48, 27);
      set(grid, 41, 52, "v");
      set(grid, 55, 32, "w");
      mouth(grid, 53, 35, 3, 1);
    }
  }
};

await bakePetSprites({
  definitions,
  elementUpper: "WIND",
  elementTitle: "Wind",
  generatorName: "scripts/authorWindPetSprites.mjs",
  outputFile: "src/data/windPetPixelArt.ts",
  root
});
