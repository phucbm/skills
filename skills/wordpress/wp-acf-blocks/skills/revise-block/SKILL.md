---
name: revise-block
description: Fast structural audit of all blocks or specific blocks — checks required files, wrapper attributes, fields.json timestamp, previewImage, viewScript. No AI, runs instantly via script.
---

Read [`@/knowledge/wp-acf-blocks/acf-blocks/conventions.md`](/knowledge/wp-acf-blocks/acf-blocks/conventions.md) and [`@/knowledge/wp-acf-blocks/acf-blocks/fields.md`](/knowledge/wp-acf-blocks/acf-blocks/fields.md), then:

## Usage

```
/wp-acf-blocks:revise-block                 # all blocks
/wp-acf-blocks:revise-block hero-banner     # single block
/wp-acf-blocks:revise-block hero-banner faq # multiple blocks
```

1. Run the revise script from the theme root:
   ```bash
   node $(claude plugin path wp-acf-blocks)/scripts/revise-block.js [block-slug...]
   ```

2. Show the full output to the user.

3. For each `✗` issue, show the relevant fix from the conventions knowledge file.

4. If all passed, suggest `/wp-acf-blocks:revise-block-deep` for content quality review.
