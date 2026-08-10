import type { en } from "./en";

export const zh: typeof en = {
  header: {
    howItWorks: "使用方法",
  },
  hero: {
    badge: "粘贴、转换、发送",
    titleLine1: "将 Google 表格中的数据",
    titleLine2: "转换为可直接发送的 WhatsApp 消息",
    subtitle: "从表格中复制一个区域，粘贴到下方，即可生成格式规范、可直接发送的消息——无需手动整理。",
  },
  converter: {
    step1Title: "1. 粘贴 Google 表格数据",
    pastePlaceholder: "在 Google 表格中选中一个区域并复制（Cmd/Ctrl+C），然后粘贴到这里（Cmd/Ctrl+V）…",
    generateButton: "生成消息",
    step2Title: "2. WhatsApp 消息",
    rowCount: {
      one: "{count} 行",
      other: "{count} 行",
    },
    outputPlaceholder: "生成的消息将显示在这里…",
    copyButton: "复制消息",
    copiedButton: "已复制！",
    errors: {
      EMPTY_INPUT: "请先粘贴 Google 表格中的数据，再生成消息。",
      NO_RECOGNIZABLE_DATA: "无法在粘贴的数据中识别任何区块（BANK、SHOP SALES、TEAM SALES 等）。请检查格式后重试。",
    },
  },
  howItWorksHeading: "使用方法",
  stepLabel: (n: number) => `第 ${n} 步`,
  steps: [
    {
      title: "从表格复制",
      description: "在 Google 表格中选中一个单元格区域并照常复制。",
    },
    {
      title: "粘贴并生成",
      description: "粘贴到下方输入框，系统会自动套用你的格式规则。",
    },
    {
      title: "复制到 WhatsApp",
      description: "复制生成好的消息，直接粘贴到 WhatsApp 发送。",
    },
  ],
  footer: "Developed by Christian@2026",
};
