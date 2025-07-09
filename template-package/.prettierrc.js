// ==========================================
// .prettierrc.js - Prettier Configuration
// ==========================================

module.exports = {
  // Norwegian government standards
  singleQuote: true,
  trailingComma: "es5",
  tabWidth: 2,
  semi: true,
  printWidth: 80,
  endOfLine: "lf",
  arrowParens: "avoid",
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: "as-needed",

  // File-specific overrides
  overrides: [
    {
      files: "*.md",
      options: {
        printWidth: 100,
        proseWrap: "always",
      },
    },
    {
      files: "*.json",
      options: {
        printWidth: 120,
      },
    },
  ],
};
