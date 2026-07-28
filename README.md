# Feature Mapping Tool

A browser-based tool for turning a spreadsheet of requirements into a visual
feature map, styled to match the [NHS design system](https://service-manual.nhs.uk/design-system).

## What it does

- **Import** an `.xlsx`/`.csv` file, or paste a table copied straight from Excel.
  Expects an `Epic`, `Feature Name` and `High Level Requirement` column
  (column names are matched flexibly, e.g. "Requirement" or "Feature" also work).
- **Detects priority** from the requirement text: `The system must ...` → Must,
  `The system should ...` → Should, `The system could ...` → Could. Anything
  that doesn't match is flagged and placed under Should so it can be fixed.
- **Displays** each feature as a card (feature name in bold, requirement text
  below), grouped by epic (left to right) and priority row (Must on top, then
  Should, then Could). Each row wraps after 4 cards.
- **Drag and drop** a card to a different epic or priority row. Moving
  between priority rows rewrites the third word of the requirement text
  (e.g. "The system could ..." → "The system must ...") without touching
  the rest of the sentence.
- **Exports** the current state back to `.csv` (matching the input structure)
  or to a paginated `.pdf` of the board.

Everything runs client-side in the browser — files are never uploaded anywhere.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and produce a production build
npm run lint      # oxlint
```

## Known limitation

Spreadsheet parsing uses the `xlsx` (SheetJS) package from the npm registry,
which has open advisories with no npm-published fix (SheetJS ships fixed
builds only from their own CDN). Since parsing happens entirely client-side
on files the user chooses to open, the impact is contained to the user's own
browser tab. If your network allows it, consider switching to SheetJS's CDN
build (`npm i https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz`).
