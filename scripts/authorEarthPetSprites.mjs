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
  "stone-rat": {
    name: "石牙鼠",
    form: "石牙跳鼠以后足直立，短小前爪抱着矿石碎片，长尾折成锯齿并在末端结出石英锤。",
    color: "暖灰褐短毛配浅砂腹部，尾端石英使用奶黄与冷灰色阶，耳内加入偏紫岩影。",
    difference: "与低伏草团鼠完全不同，本批以直立跳鼠、巨大后足、锯齿长尾和矿锤尾端形成瘦高剪影。",
    palette: paletteFrom({
      outline: "#393338",
      body: ["#51484a", "#736052", "#9c7c5b", "#c4a276"],
      belly: ["#80705f", "#b49a79", "#dcc8a1"],
      motif: ["#665c58", "#938477", "#c4b196", "#ead9ad"],
      accent: ["#5a4650", "#80616a", "#ad8790"],
      eye: "#f0d38a",
      dark: "#312d36"
    }),
    draw(p) {
      return [
        strokePath(p, "M30 47 C22 48 15 45 13 39 C11 33 15 28 20 30 C25 32 25 38 21 40 C18 42 16 39 17 36", "o", 2.1),
        strokePath(p, "M14 39 L8 45 L14 51 L7 57", "v", 2.2),
        path(p, "M4 55 C7 51 12 51 15 55 C14 60 10 63 5 62 C2 60 2 57 4 55 Z", "url(#motif)", "o", 0.7),
        path(p, "M24 33 C25 25 31 21 38 23 C44 27 45 37 42 45 C39 52 31 54 26 49 C22 45 22 39 24 33 Z", "url(#body)", "o", 0.9),
        path(p, "M27 31 C29 26 34 24 38 25", "none", "h", 0.55),
        strokePath(p, "M31 52 C37 54 42 50 43 44", "v", 1.35),
        path(p, "M30 35 C34 32 39 34 41 39 C40 45 36 49 31 48 Z", "url(#belly)", "t", 0.45),
        path(p, "M35 23 C35 16 40 11 46 12 C52 14 55 20 53 26 C51 31 45 33 40 30 C37 28 35 26 35 23 Z", "url(#body)", "o", 0.8),
        path(p, "M38 16 C35 12 36 7 39 4 C44 6 46 11 44 16 Z", "url(#accent)", "o", 0.55),
        path(p, "M45 14 C46 9 50 7 54 8 C55 13 52 16 48 18 Z", "url(#accent)", "o", 0.55),
        path(p, "M43 32 C47 36 50 39 53 41", "none", "o", 2.3),
        path(p, "M34 51 C31 56 27 60 22 63 C19 61 19 58 22 56 C26 53 29 50 31 47 Z", "url(#body)", "o", 0.7),
        path(p, "M40 49 C43 54 48 58 54 60 C56 63 54 65 50 64 C44 63 39 58 36 52 Z", "url(#body)", "o", 0.7),
        path(p, "M48 37 C51 34 55 34 58 37 C57 41 53 43 49 42 Z", "url(#motif)", "o", 0.55),
        circle(p, 49, 21, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 49, 21);
      set(grid, 53, 26, "w");
      mouth(grid, 52, 28, 2, 1);
    }
  },
  "sand-lizard": {
    name: "沙背蜥",
    form: "沙背蜥从沙丘中半身立起，铲形吻部探向前方，颈背张开不规则砂岩帆，两只宽爪负责掘地。",
    color: "土黄鳞片配赭红砂帆，腹面使用浅石灰色，爪尖和背部矿纹加入冷灰紫层次。",
    difference: "不采用四足贴地蜥蜴结构；竖向半出土身体、铲吻、双掘爪和扇形背帆形成独有轮廓。",
    palette: paletteFrom({
      outline: "#493633",
      body: ["#68504a", "#95704f", "#c49a62", "#e4bd78"],
      belly: ["#8b7966", "#baa489", "#dfceb0"],
      motif: ["#744138", "#a65a43", "#d68453", "#efb56e"],
      accent: ["#554951", "#75656b", "#9b8990"],
      eye: "#efd07c",
      dark: "#392f34"
    }),
    draw(p) {
      return [
        path(p, "M8 54 C15 48 23 47 31 51 C38 47 48 48 57 55 C51 61 41 63 31 61 C21 64 12 61 8 54 Z", "url(#belly)", "o", 0.8),
        strokePath(p, "M12 56 C24 59 43 58 55 55", "q", 0.65),
        path(p, "M23 52 C20 43 22 33 28 25 C34 17 44 14 51 19 C57 23 58 31 54 37 C49 43 42 44 38 48 C34 52 31 56 30 60 Z", "url(#body)", "o", 1),
        path(p, "M27 45 C27 34 31 25 39 20", "none", "h", 0.65),
        strokePath(p, "M31 59 C34 50 42 45 50 40", "v", 1.45),
        path(p, "M28 39 C34 37 40 39 43 45 C39 50 35 54 31 57 Z", "url(#belly)", "t", 0.5),
        path(p, "M43 18 C48 12 56 12 61 17 C64 22 62 28 57 31 C52 33 47 30 44 27 C42 24 41 21 43 18 Z", "url(#body)", "o", 0.8),
        path(p, "M56 18 C61 16 66 18 69 22 C66 26 61 28 56 27 Z", "url(#motif)", "o", 0.6),
        path(p, "M25 39 C17 36 12 30 11 23 C19 22 27 27 31 34 Z", "url(#motif)", "o", 0.75),
        path(p, "M27 32 C18 28 15 21 17 14 C25 17 32 23 34 30 Z", "url(#motif)", "o", 0.75),
        path(p, "M32 26 C25 20 24 13 28 7 C35 12 39 19 38 26 Z", "url(#motif)", "o", 0.75),
        strokePath(p, "M18 25 C23 28 27 32 30 36 M25 17 C29 21 32 25 34 29 M30 11 C34 16 36 20 36 24", "f", 0.65),
        path(p, "M27 43 C20 43 14 46 11 51 C16 54 23 52 29 49 Z", "url(#accent)", "o", 0.65),
        path(p, "M40 45 C45 48 51 50 57 49 C55 44 49 41 43 40 Z", "url(#accent)", "o", 0.65),
        circle(p, 56, 21, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 56, 21);
      set(grid, 63, 24, "w");
      mouth(grid, 61, 27, 3, 1);
    }
  },
  "round-rock-sheep": {
    name: "圆岩羊",
    form: "圆岩羊用一对巨大的空心螺旋岩角包住身体，细短四足从角环下方伸出，小脸探出右侧。",
    color: "暖褐羊毛配奶油砂腹，巨角使用冷灰石色和赭黄岩纹，鼻端以深紫褐收边。",
    difference: "主体由带负空间的巨大螺旋角环构成，细腿与小脸从环外伸出，不是普通圆背四足动物。",
    palette: paletteFrom({
      outline: "#40383b",
      body: ["#5d5050", "#806851", "#a98761", "#cfad7a"],
      belly: ["#8c7a63", "#bca382", "#e1ceb0"],
      motif: ["#55545a", "#77757a", "#a29b94", "#ccc1aa"],
      accent: ["#765345", "#a27555", "#ce9c6c"],
      eye: "#efd386",
      dark: "#342f38"
    }),
    draw(p) {
      return [
        path(
          p,
          "M10 33 C10 19 22 9 36 10 C51 11 59 23 58 37 C57 51 45 59 30 56 C17 54 9 45 10 33 Z M20 33 C20 25 27 19 35 19 C44 20 49 27 48 35 C47 43 40 48 32 47 C24 46 20 41 20 33 Z",
          "url(#motif)",
          "o",
          1.05,
          'fill-rule="evenodd"'
        ),
        strokePath(p, "M14 27 C19 17 30 13 40 16 M13 40 C17 50 28 55 39 51 M25 33 C25 28 29 25 34 25 C39 25 42 29 41 34 C40 39 36 42 31 41", "h", 0.7),
        strokePath(p, "M31 56 C46 58 57 49 58 37", "v", 1.55),
        path(p, "M17 17 C19 12 23 9 27 9 C28 14 25 18 21 20 Z", "url(#accent)", "o", 0.55),
        path(p, "M34 31 C40 26 50 27 56 32 C62 38 61 47 54 51 C47 54 38 51 34 45 C31 40 31 35 34 31 Z", "url(#body)", "o", 0.8),
        path(p, "M47 31 C50 26 55 24 59 26 C60 31 57 34 53 36 Z", "url(#accent)", "o", 0.55),
        path(p, "M43 49 C42 54 42 58 43 62 M51 50 C52 54 54 58 57 61", "none", "o", 3),
        strokePath(p, "M40 62 L46 62 M54 61 L60 61", "c", 1.2),
        path(p, "M20 49 C18 54 17 58 18 61 M28 53 C28 57 29 60 31 62", "none", "o", 2.8),
        strokePath(p, "M15 61 L21 61 M28 62 L34 62", "c", 1.2),
        circle(p, 55, 36, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 55, 36);
      set(grid, 59, 42, "w");
      mouth(grid, 58, 44, 2, 1);
    }
  },
  "copper-bug": {
    name: "铜壳虫",
    form: "铜壳虫正面悬停，左右鞘翅像两扇打开的铜盾，中央腹节垂直排列，六足与钳状触角向外张开。",
    color: "铜红甲壳配暗赭腹节，边缘带少量灰绿色铜锈，高光使用温暖金铜色。",
    difference: "本批唯一正面昆虫，纵向分节腹部、分离双盾鞘翅、六足和上举钳角构成机械感剪影。",
    palette: paletteFrom({
      outline: "#453638",
      body: ["#65423d", "#92533e", "#bf7248", "#dda068"],
      belly: ["#684d42", "#94705b", "#c29a78"],
      motif: ["#875033", "#b8753f", "#dba45e", "#f0c980"],
      accent: ["#4e6159", "#71877a", "#9bac91"],
      eye: "#f0d486",
      dark: "#352e35"
    }),
    draw(p) {
      return [
        path(p, "M29 17 C29 11 33 7 38 7 C43 8 46 12 45 18 C44 23 40 26 35 24 C31 23 29 20 29 17 Z", "url(#body)", "o", 0.75),
        path(p, "M24 24 C17 19 9 20 6 27 C5 34 11 40 21 42 C25 38 27 31 27 27 C26 26 25 25 24 24 Z", "url(#body)", "o", 0.9),
        path(p, "M46 24 C53 19 61 20 64 27 C65 34 59 40 49 42 C45 38 43 31 43 27 C44 26 45 25 46 24 Z", "url(#body)", "o", 0.9),
        path(p, "M9 27 C13 23 19 24 24 27", "none", "h", 0.6),
        path(p, "M61 27 C57 23 51 24 46 27", "none", "h", 0.6),
        strokePath(p, "M20 42 C25 38 27 32 27 27 M50 42 C45 38 43 32 43 27", "v", 1.35),
        path(p, "M29 23 C33 20 39 20 43 23 C47 32 46 48 41 57 C37 61 32 59 29 55 C25 45 25 31 29 23 Z", "url(#belly)", "o", 0.8),
        strokePath(p, "M28 31 L44 31 M27 39 L45 39 M29 47 L43 47", "t", 0.75),
        path(p, "M29 27 C24 24 20 19 18 13 C23 12 28 15 32 20 Z", "url(#motif)", "o", 0.6),
        path(p, "M43 27 C48 24 52 19 54 13 C49 12 44 15 40 20 Z", "url(#motif)", "o", 0.6),
        strokePath(p, "M21 30 C14 31 9 34 5 38 M22 36 C15 39 11 44 9 50 M25 43 C19 48 17 54 17 60", "o", 1.8),
        strokePath(p, "M49 30 C56 31 61 34 65 38 M48 36 C55 39 59 44 61 50 M45 43 C51 48 53 54 53 60", "o", 1.8),
        strokePath(p, "M21 28 C17 26 13 26 10 28 M49 28 C53 26 57 26 60 28", "p", 0.8),
        circle(p, 34, 16, 1, "e", "w", 0.3),
        circle(p, 40, 16, 1, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 34, 16);
      eye(grid, 40, 16, -1);
      mouth(grid, 35, 21, 3, 1);
    }
  },
  "rock-horn-bull": {
    name: "岩角牛",
    form: "岩角牛正面压低头部，左右巨角横向展开成石制门楣，方形额甲、厚重鼻梁与长岩须构成攻城姿态。",
    color: "深土褐皮毛配灰白岩角，额甲使用赭黄石纹，背光处以冷炭灰加强重量。",
    difference: "不采用侧面四足牛形；正面宽横巨角、方脸、垂直岩须和并排柱腿构成堡垒式剪影。",
    palette: paletteFrom({
      outline: "#3c3432",
      body: ["#4f4541", "#735b48", "#987557", "#bea077"],
      belly: ["#695b50", "#907b67", "#baa58a"],
      motif: ["#55555a", "#77767a", "#9e9a92", "#c9c1ad"],
      accent: ["#755039", "#a57045", "#d09a5d"],
      eye: "#efcf78",
      dark: "#302d31"
    }),
    draw(p) {
      return [
        path(p, "M28 18 C20 11 11 10 3 15 C7 23 16 27 27 27 Z", "url(#motif)", "o", 0.85),
        path(p, "M44 18 C52 11 61 10 69 15 C65 23 56 27 45 27 Z", "url(#motif)", "o", 0.85),
        strokePath(p, "M4 15 C12 17 20 20 28 23 M68 15 C60 17 52 20 44 23", "h", 0.6),
        path(p, "M22 22 C27 16 38 14 46 19 C52 24 54 35 50 44 C46 53 27 53 22 44 C18 35 18 27 22 22 Z", "url(#body)", "o", 1),
        path(p, "M25 22 C31 18 39 18 45 21", "none", "h", 0.65),
        strokePath(p, "M30 51 C39 54 48 50 50 43", "v", 1.5),
        path(p, "M26 22 L36 16 L46 22 L44 36 L28 36 Z", "url(#accent)", "o", 0.7),
        strokePath(p, "M29 28 L43 28 M36 18 L36 35", "f", 0.7),
        path(p, "M27 34 C32 30 41 30 46 34 C49 40 46 46 40 48 C33 49 27 46 25 40 C24 38 25 36 27 34 Z", "url(#belly)", "t", 0.55),
        ellipse(p, 36, 40, 7, 4.2, "url(#motif)", "o", 0.55),
        path(p, "M29 48 C27 54 27 59 28 64 M43 48 C45 54 45 59 44 64", "none", "o", 5),
        strokePath(p, "M24 64 L32 64 M40 64 L48 64", "c", 1.8),
        path(p, "M31 47 C31 53 33 58 36 62 C39 58 41 53 41 47 Z", "url(#accent)", "o", 0.65),
        circle(p, 29, 31, 1.05, "e", "w", 0.3),
        circle(p, 43, 31, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 29, 31);
      eye(grid, 43, 31, -1);
      set(grid, 33, 40, "w");
      set(grid, 39, 40, "w");
      mouth(grid, 34, 44, 5, 1);
    }
  },
  "sand-pattern-cat": {
    name: "砂纹猫",
    form: "砂纹猫像荒漠石像般端坐，长耳与直立胸线构成三角主体，细长尾巴绕身体卷成大型砂涡。",
    color: "浅砂金皮毛配奶油胸腹，身体刻有赭红风纹，尾部砂涡加入灰紫阴影和明亮砂尘高光。",
    difference: "与所有横向奔跑猫科不同，本批采用端坐石像姿态、超长前腿和包围身体的巨大卷尾。",
    palette: paletteFrom({
      outline: "#4a3938",
      body: ["#69524b", "#997252", "#c69b67", "#e4bf82"],
      belly: ["#9b846a", "#c3a98a", "#e2d0ae"],
      motif: ["#765044", "#a66b4d", "#d29563", "#ebbd7a"],
      accent: ["#594c59", "#786879", "#9f8da0"],
      eye: "#f2d17a",
      dark: "#382f38"
    }),
    draw(p) {
      return [
        strokePath(p, "M42 49 C53 52 60 48 61 40 C62 32 55 27 49 30 C43 33 44 40 49 42 C53 44 56 41 55 38", "o", 4),
        strokePath(p, "M43 48 C52 50 58 47 58 40 C58 35 54 32 50 33 C47 34 47 38 50 40", "a", 1.7),
        path(p, "M24 31 C26 24 32 20 39 22 C46 25 49 35 47 45 C45 54 39 59 31 57 C24 55 21 45 22 37 C22 35 23 33 24 31 Z", "url(#body)", "o", 0.9),
        path(p, "M27 30 C30 25 35 23 39 24", "none", "h", 0.55),
        strokePath(p, "M32 57 C39 60 46 54 47 45", "v", 1.35),
        path(p, "M30 33 C35 29 41 31 44 37 C43 46 39 53 34 54 C30 49 28 40 30 33 Z", "url(#belly)", "t", 0.5),
        path(p, "M27 22 C27 15 31 10 36 10 C42 10 47 15 47 21 C46 28 41 31 35 29 C30 28 27 25 27 22 Z", "url(#body)", "o", 0.75),
        path(p, "M29 14 C27 9 28 5 31 2 C35 5 36 10 34 14 Z", "url(#body)", "o", 0.55),
        path(p, "M39 12 C41 7 45 5 49 6 C49 11 46 15 42 17 Z", "url(#body)", "o", 0.55),
        strokePath(p, "M32 34 C35 37 38 39 42 40 M31 42 C34 45 38 47 42 48", "a", 1),
        path(p, "M26 50 C22 55 19 59 17 64", "none", "o", 4),
        path(p, "M38 55 C40 59 43 62 47 64", "none", "o", 4),
        strokePath(p, "M14 64 L21 64 M44 64 L50 64", "c", 1.5),
        circle(p, 41, 20, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 41, 20);
      set(grid, 45, 24, "w");
      mouth(grid, 44, 26, 2, 1);
    }
  },
  "stone-shield-ape": {
    name: "石盾猿",
    form: "石盾猿双足弓步，左臂托起不规则六边巨盾遮住半身，右拳高举，头部从盾侧探出观察。",
    color: "深褐毛发配灰岩巨盾，盾面裂纹与护腕使用赭金石纹，右下轮廓压入冷炭灰。",
    difference: "本批唯一持械二足体；巨盾占据左半剪影，探头、举拳与分离双足形成强烈不对称。",
    palette: paletteFrom({
      outline: "#3b3435",
      body: ["#504344", "#705747", "#977153", "#bd9970"],
      belly: ["#705f52", "#96816c", "#bda78b"],
      motif: ["#4d5056", "#6d7074", "#969793", "#c1bda9"],
      accent: ["#755039", "#a17143", "#ce9b5c"],
      eye: "#efd07c",
      dark: "#302d33"
    }),
    draw(p) {
      return [
        path(p, "M34 26 C36 18 42 14 49 16 C56 20 58 29 55 39 C52 50 45 56 37 53 C30 50 28 40 31 32 C32 30 33 28 34 26 Z", "url(#body)", "o", 1),
        path(p, "M37 24 C40 19 45 17 50 19", "none", "h", 0.6),
        strokePath(p, "M40 54 C48 57 54 49 56 40", "v", 1.5),
        path(p, "M40 16 C42 10 48 8 53 10 C58 13 60 19 57 24 C54 29 48 31 44 27 C40 25 38 20 40 16 Z", "url(#body)", "o", 0.75),
        path(p, "M50 30 C56 26 61 21 63 16 C67 19 68 24 65 29 C62 34 57 37 52 38 Z", "url(#body)", "o", 0.8),
        ellipse(p, 64, 15, 4.5, 4.5, "url(#accent)", "o", 0.65),
        path(p, "M5 25 L15 18 L25 23 L27 42 L19 57 L7 53 L2 40 Z", "url(#motif)", "o", 1),
        path(p, "M8 27 L15 22 L22 26 L23 40 L17 51 L9 48 L6 39 Z", "url(#belly)", "t", 0.55),
        strokePath(p, "M6 38 L23 38 M15 22 L17 51 M7 27 L23 48", "a", 0.9),
        strokePath(p, "M27 35 C30 33 32 32 35 32", "o", 2.4),
        path(p, "M35 51 C33 56 33 60 34 64", "none", "o", 5.5),
        path(p, "M47 52 C51 56 55 59 59 61", "none", "o", 5.5),
        strokePath(p, "M29 64 L38 64 M55 61 L63 61", "c", 1.8),
        circle(p, 52, 18, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 52, 18);
      set(grid, 57, 23, "w");
      mouth(grid, 55, 26, 3, 1);
    }
  },
  "ridge-giant-turtle": {
    name: "山脊巨龟",
    form: "山脊巨龟不背圆壳，而以四根石柱长腿托举一整片平顶峡谷，头颈从台地下方缓慢伸出。",
    color: "层积岩背台使用赭黄、灰岩与暗褐分层，柱腿偏冷灰，峡谷边缘由浅砂高光描出。",
    difference: "彻底避开已有圆拱龟壳；平顶横向台地、三座脊峰、四根长柱腿与悬垂头颈构成移动峡谷。",
    palette: paletteFrom({
      outline: "#3d3735",
      body: ["#514946", "#71604f", "#967a5b", "#bea077"],
      belly: ["#5d5b59", "#7e7b74", "#a7a197"],
      motif: ["#754b35", "#a26a42", "#ce985d", "#e7bd7d"],
      accent: ["#66584b", "#8c755d", "#b49a77"],
      eye: "#ebca76",
      dark: "#302f32"
    }),
    draw(p) {
      return [
        path(p, "M7 26 C13 20 22 18 31 19 C40 16 51 18 58 24 L55 37 C43 40 24 40 10 36 Z", "url(#body)", "o", 1),
        path(p, "M10 25 C22 21 43 20 56 25", "none", "h", 0.7),
        strokePath(p, "M10 36 C25 41 45 41 55 36", "v", 1.5),
        path(p, "M12 25 L21 16 L29 23 L37 9 L45 22 L52 14 L58 25 Z", "url(#motif)", "o", 0.75),
        strokePath(p, "M17 24 L22 19 M33 22 L37 13 M47 22 L52 17", "g", 0.55),
        strokePath(p, "M11 31 L55 31 M16 36 L49 36", "a", 0.8),
        path(p, "M14 35 C14 44 13 53 11 63 L20 63 C20 53 20 44 22 36 Z", "url(#belly)", "o", 0.75),
        path(p, "M28 38 C29 46 29 54 28 63 L37 63 C37 54 37 46 36 38 Z", "url(#belly)", "o", 0.75),
        path(p, "M46 36 C48 45 49 53 48 63 L57 63 C56 53 55 44 54 35 Z", "url(#belly)", "o", 0.75),
        strokePath(p, "M11 63 L20 63 M28 63 L37 63 M48 63 L57 63", "c", 1.5),
        path(p, "M50 35 C55 38 61 38 65 34 C69 36 69 42 65 46 C60 50 54 48 51 44 C49 41 49 38 50 35 Z", "url(#body)", "o", 0.8),
        path(p, "M57 34 C60 30 65 29 68 32 C68 36 65 39 61 40 Z", "url(#accent)", "o", 0.55),
        circle(p, 64, 38, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 62, 38, -1);
      set(grid, 63, 43, "w");
      mouth(grid, 62, 45, 2, 1);
    }
  },
  "meteor-lion": {
    name: "陨石狮",
    form: "陨石狮从空中正面扑落，放射状岩鬃包围怒吼面孔，两只巨爪前伸，后半身碎裂为斜向彗星石带。",
    color: "暗陨铁身体配金褐岩鬃，裂隙使用浅砂黄而非火焰橙，碎石尾带加入冷灰紫阴影。",
    difference: "不采用横向猫科身体；正面放射鬃环、前伸双爪和向左上碎裂的彗星尾形成坠落构图。",
    palette: paletteFrom({
      outline: "#38353a",
      body: ["#45464d", "#626068", "#817b79", "#aba08c"],
      belly: ["#6b5e50", "#90795c", "#baa078"],
      motif: ["#73503b", "#9e6c46", "#c89258", "#e2bb78"],
      accent: ["#574b56", "#766776", "#9b8997"],
      eye: "#f2cf72",
      dark: "#2d2d35"
    }),
    draw(p) {
      return [
        path(p, "M31 31 C24 25 16 18 7 10 C13 8 19 10 24 13 C24 8 26 4 30 1 C34 7 36 13 37 20 Z", "url(#accent)", "o", 0.75),
        path(p, "M22 20 C17 17 12 17 8 19 C12 24 17 27 22 28 Z", "url(#motif)", "o", 0.6),
        circle(p, 6, 8, 3, "p", "r", 0.5),
        circle(p, 15, 5, 2, "k", "r", 0.45),
        path(p, "M21 23 L27 15 L35 18 L42 13 L47 22 L56 23 L54 32 L61 38 L54 44 L52 54 L42 51 L35 59 L28 52 L18 53 L18 43 L11 37 L18 31 Z", "url(#motif)", "o", 1),
        path(p, "M21 25 C28 20 39 19 47 24", "none", "g", 0.7),
        strokePath(p, "M28 52 C38 58 49 54 53 45", "v", 1.6),
        path(p, "M25 27 C31 21 43 21 50 28 C56 35 53 45 46 50 C37 55 26 50 22 42 C19 36 21 31 25 27 Z", "url(#body)", "o", 0.85),
        path(p, "M29 30 C34 26 42 26 47 30", "none", "h", 0.6),
        path(p, "M29 38 C33 34 42 34 46 38 C47 44 43 48 37 48 C32 48 28 44 29 38 Z", "url(#belly)", "t", 0.5),
        path(p, "M20 43 C14 45 10 51 11 57 C17 60 24 56 28 50 Z", "url(#body)", "o", 0.75),
        path(p, "M48 45 C55 47 60 52 60 58 C54 61 47 57 44 51 Z", "url(#body)", "o", 0.75),
        strokePath(p, "M13 56 L9 61 M17 57 L16 63 M57 57 L61 62 M53 57 L52 63", "c", 1.2),
        circle(p, 32, 35, 1.05, "e", "w", 0.3),
        circle(p, 43, 35, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 32, 35);
      eye(grid, 43, 35, -1);
      set(grid, 37, 41, "w");
      mouth(grid, 34, 45, 7, 1);
    }
  },
  "ancient-golem": {
    name: "古岩魔像",
    form: "古岩魔像由彼此分离的古代石块悬浮拼成，斜置方碑头、巨大左拳、细长右臂和不等长双腿故意保持不对称。",
    color: "冷灰岩块配深土褐断面，核心与刻印使用古铜金色，裂缝边缘由浅砂色高光提亮。",
    difference: "本批唯一非生物结构体；悬浮块之间保留明显负空间，巨拳、碑头与不等长腿组成完全不对称剪影。",
    palette: paletteFrom({
      outline: "#343338",
      body: ["#45474d", "#616267", "#85827d", "#ada798"],
      belly: ["#64574c", "#88725c", "#ad9272"],
      motif: ["#6e4e35", "#9a6c42", "#c49355", "#dfb875"],
      accent: ["#514854", "#706372", "#968596"],
      eye: "#f0ce76",
      dark: "#2c2d33"
    }),
    draw(p) {
      return [
        path(p, "M31 7 L46 4 L52 15 L45 25 L30 22 L26 13 Z", "url(#body)", "o", 0.9),
        path(p, "M31 9 L45 7 L48 15 L43 21 L31 19 Z", "url(#belly)", "t", 0.5),
        strokePath(p, "M33 13 L45 12 M38 8 L39 20", "f", 0.75),
        path(p, "M24 28 L43 25 L50 37 L44 52 L25 53 L17 41 Z", "url(#body)", "o", 1),
        path(p, "M25 30 L40 28 L46 38 L41 48 L27 49 L21 40 Z", "url(#belly)", "t", 0.55),
        path(p, "M29 34 L38 32 L43 39 L39 46 L30 46 L25 40 Z", "url(#motif)", "o", 0.65),
        strokePath(p, "M31 36 L37 43 M39 35 L31 44", "g", 0.7),
        path(p, "M9 27 L20 23 L26 30 L24 42 L13 47 L5 40 L4 32 Z", "url(#body)", "o", 0.9),
        path(p, "M7 30 L17 27 L22 32 L20 39 L12 43 L7 38 Z", "url(#accent)", "t", 0.5),
        path(p, "M52 25 L59 22 L64 28 L61 39 L54 41 L49 34 Z", "url(#body)", "o", 0.8),
        ellipse(p, 62, 43, 5, 5.5, "url(#motif)", "o", 0.65),
        path(p, "M21 54 L31 54 L32 64 L18 64 Z", "url(#body)", "o", 0.8),
        path(p, "M40 53 L49 51 L56 62 L43 64 Z", "url(#body)", "o", 0.8),
        strokePath(p, "M18 64 L32 64 M43 64 L56 62", "c", 1.6),
        circle(p, 35, 14, 1.05, "e", "w", 0.3),
        circle(p, 44, 13, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 35, 14);
      eye(grid, 44, 13, -1);
      set(grid, 18, 42, "v");
      set(grid, 33, 40, "z");
      set(grid, 34, 40, "e");
      set(grid, 35, 40, "w");
      mouth(grid, 36, 18, 6, 1);
    }
  }
};

await bakePetSprites({
  definitions,
  elementUpper: "EARTH",
  elementTitle: "Earth",
  generatorName: "scripts/authorEarthPetSprites.mjs",
  outputFile: "src/data/earthPetPixelArt.ts",
  root
});
