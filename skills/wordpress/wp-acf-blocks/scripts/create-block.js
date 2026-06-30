#!/usr/bin/env node

/**
 * wp-acf-blocks — create-block
 *
 * Scaffolds all required files for a new ACF Gutenberg block and registers
 * it in blocks.json. Run from anywhere inside the theme directory.
 *
 * Usage:
 *   node create-block.js <name> --title="Block Title" [--description="..."] [--js] [--admin]
 *
 * Options:
 *   --title        Human-readable block title (default: derived from name)
 *   --description  Short description shown in the block inserter
 *   --js           Create view.entry.ts for frontend JavaScript
 *   --admin        Create render-admin.php for editor preview
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs(argv){
    const flags = {};
    const positional = [];
    for(const arg of argv){
        if(arg.startsWith('--')){
            const [key, ...rest] = arg.slice(2).split('=');
            flags[key] = rest.length ? rest.join('=') : true;
        }else{
            positional.push(arg);
        }
    }
    return { flags, positional };
}

const { flags, positional } = parseArgs(process.argv.slice(2));
const blockName = positional[0];

if(!blockName){
    console.error('Usage: create-block <name> --title="Block Title" [--description="..."] [--js] [--admin]');
    process.exit(1);
}

if(!/^[a-z0-9-]+$/.test(blockName)){
    console.error('Error: block name must be kebab-case (lowercase letters, numbers, hyphens only)');
    process.exit(1);
}

const blockTitle = flags.title       || blockName.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const blockDesc  = flags.description || '';
const needsJs    = !!flags.js;
const needsAdmin = !!flags.admin;

// ---------------------------------------------------------------------------
// Find theme root (walk up from cwd until blocks.json is found)
// ---------------------------------------------------------------------------

function findThemeRoot(startDir){
    let dir = startDir;
    while(true){
        if(fs.existsSync(path.join(dir, 'blocks.json'))) return dir;
        const parent = path.dirname(dir);
        if(parent === dir) return null;
        dir = parent;
    }
}

const themeRoot = findThemeRoot(process.cwd());
if(!themeRoot){
    console.error('Error: could not find blocks.json. Run from within your theme directory.');
    process.exit(1);
}

const blockDir = path.join(themeRoot, 'blocks', blockName);

if(fs.existsSync(blockDir)){
    console.error(`Error: block "${blockName}" already exists at blocks/${blockName}/`);
    process.exit(1);
}

fs.mkdirSync(blockDir, { recursive: true });

// ---------------------------------------------------------------------------
// Timestamp for fields.json
// ---------------------------------------------------------------------------

const timestamp = Math.floor(Date.now() / 1000);

// ---------------------------------------------------------------------------
// block.json
// ---------------------------------------------------------------------------

const blockJson = {
    '$schema':   'https://schemas.wp.org/trunk/block.json',
    apiVersion:  3,
    name:        `acf/${blockName}`,
    title:       blockTitle,
    description: blockDesc,
    category:    'theme',
    icon:        'block-default',
    acf: {
        mode:           'preview',
        renderTemplate: 'render.php',
    },
    attributes: {
        previewImage: {
            type:    'string',
            default: 'preview.png',
        },
    },
    supports: { anchor: true },
};

if(needsJs) blockJson.viewScript = ['file:./view.js'];

fs.writeFileSync(
    path.join(blockDir, 'block.json'),
    JSON.stringify(blockJson, null, 2) + '\n'
);

// ---------------------------------------------------------------------------
// fields.json
// ---------------------------------------------------------------------------

const fieldsJson = [
    {
        key:      `group_${blockName.replace(/-/g, '_')}`,
        title:    blockTitle,
        fields:   [],
        location: [[{ param: 'block', operator: '==', value: `acf/${blockName}` }]],
        modified: timestamp,
    },
];

fs.writeFileSync(
    path.join(blockDir, 'fields.json'),
    JSON.stringify(fieldsJson, null, 2) + '\n'
);

// ---------------------------------------------------------------------------
// render.php
// ---------------------------------------------------------------------------

const adminEarlyReturn = needsAdmin ? `
// Bail early in editor — render-admin.php handles the preview
if(is_admin()){
\tinclude __DIR__ . '/render-admin.php';
\treturn;
}
` : '';

fs.writeFileSync(path.join(blockDir, 'render.php'), `<?php
/**
 * Block: ${blockTitle}
 */

if(!defined('ABSPATH')) exit;
${adminEarlyReturn}
?>

<div <?php echo get_block_wrapper_attributes(['class' => 'wp-block-${blockName}']); ?>>
\t<?php // Block content here ?>
</div>
`);

// ---------------------------------------------------------------------------
// render-admin.php (optional)
// ---------------------------------------------------------------------------

if(needsAdmin){
    fs.writeFileSync(path.join(blockDir, 'render-admin.php'), `<?php
/**
 * Admin preview: ${blockTitle}
 * Shown in the Gutenberg editor instead of the full frontend render.
 */
if(!defined('ABSPATH')) exit;
?>

<div style="pointer-events:none; padding:2rem; background:#f0f0f0; text-align:center;">
\t<p><strong>${blockTitle}</strong> — preview not available in editor</p>
</div>
`);
}

// ---------------------------------------------------------------------------
// view.entry.ts (optional)
// ---------------------------------------------------------------------------

if(needsJs){
    fs.writeFileSync(path.join(blockDir, 'view.entry.ts'), `/**
 * Block: ${blockTitle}
 * Frontend JS entry — compiled to view.js by tsup.
 */

document.querySelectorAll<HTMLElement>('.wp-block-${blockName}').forEach((block) => {
\t// Block JS here
});
`);
}

// ---------------------------------------------------------------------------
// Register in blocks.json (alphabetical order)
// ---------------------------------------------------------------------------

const blocksJsonPath = path.join(themeRoot, 'blocks.json');
const blocks = JSON.parse(fs.readFileSync(blocksJsonPath, 'utf8'));

if(!blocks.includes(blockName)){
    blocks.push(blockName);
    blocks.sort();
    fs.writeFileSync(blocksJsonPath, JSON.stringify(blocks, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------

const created = ['block.json', 'fields.json', 'render.php'];
if(needsAdmin) created.push('render-admin.php');
if(needsJs)    created.push('view.entry.ts');

console.log(`\nCreated: blocks/${blockName}/`);
console.log(`Files:   ${created.join(', ')}`);
console.log(`\nNext: add ACF fields in WordPress admin, then update the 'modified' timestamp in fields.json.`);
