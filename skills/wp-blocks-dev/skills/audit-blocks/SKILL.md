---
name: audit-blocks
description: Fast structural audit of all blocks — checks required files, wrapper attributes, fields.json timestamp, preview.png. No AI, runs instantly via script.
---

Read `[@/knowledge/wp-blocks-dev/acf-blocks/conventions.md](/knowledge/wp-blocks-dev/acf-blocks/conventions.md) and [@/knowledge/wp-blocks-dev/acf-blocks/fields.md](/knowledge/wp-blocks-dev/acf-blocks/fields.md)`, then:

1. Run the audit script from the theme root:
   ```bash
   node $(claude plugin path wp-blocks-dev)/scripts/audit-blocks.js
   ```

2. Show the full output to the user.

3. For each `✗` issue, show the relevant fix from the conventions knowledge file.

4. If all passed, suggest `/wp-blocks-dev:audit-blocks-deep` for content quality review.
