---
name: audit-blocks
description: Fast structural audit of all blocks — checks required files, wrapper attributes, fields.json timestamp, preview.png. No AI, runs instantly via script.
---

Read `[@/knowledge/wp-acf-blocks/acf-blocks/conventions.md](/knowledge/wp-acf-blocks/acf-blocks/conventions.md) and [@/knowledge/wp-acf-blocks/acf-blocks/fields.md](/knowledge/wp-acf-blocks/acf-blocks/fields.md)`, then:

1. Run the audit script from the theme root:
   ```bash
   node $(claude plugin path wp-acf-blocks)/scripts/audit-blocks.js
   ```

2. Show the full output to the user.

3. For each `✗` issue, show the relevant fix from the conventions knowledge file.

4. If all passed, suggest `/wp-acf-blocks:audit-blocks-deep` for content quality review.
