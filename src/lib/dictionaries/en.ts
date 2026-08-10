export const en = {
  header: {
    howItWorks: "How it works",
  },
  hero: {
    badge: "Paste. Convert. Send.",
    titleLine1: "Turn Google Sheets rows",
    titleLine2: "into WhatsApp-ready messages",
    subtitle:
      "Copy a range from your spreadsheet, paste it below, and get a perfectly formatted message ready to send — no manual retyping.",
  },
  converter: {
    step1Title: "1. Paste your Google Sheets range",
    pastePlaceholder:
      "Select a range in Google Sheets, copy it (Cmd/Ctrl+C), then paste here (Cmd/Ctrl+V)…",
    generateButton: "Generate message",
    step2Title: "2. WhatsApp message",
    rowCount: {
      one: "{count} row",
      other: "{count} rows",
    },
    outputPlaceholder: "Your generated message will appear here…",
    copyButton: "Copy message",
    copiedButton: "Copied!",
    errors: {
      EMPTY_INPUT: "Paste some data from Google Sheets before generating a message.",
      NO_RECOGNIZABLE_DATA:
        "We couldn't recognize any sections (BANK, SHOP SALES, TEAM SALES…) in the pasted data. Check the format and try again.",
    },
  },
  howItWorksHeading: "How it works",
  stepLabel: (n: number) => `Step ${n}`,
  steps: [
    {
      title: "Copy from Sheets",
      description: "Select a range of cells in Google Sheets and copy it as usual.",
    },
    {
      title: "Paste & generate",
      description: "Paste it into the box below and we'll apply your formatting rules.",
    },
    {
      title: "Copy to WhatsApp",
      description: "Copy the ready-made message and paste it straight into WhatsApp.",
    },
  ],
  footer: "Developed by Christian@2026",
};
