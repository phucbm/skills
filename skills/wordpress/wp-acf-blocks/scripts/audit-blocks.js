#!/usr/bin/env node

/**
 * wp-acf-blocks — audit-blocks
 *
 * Level 1 audit: structural checks only, no AI, no tokens.
 * Checks every block in blocks.json against required file conventions.
 *
 * Usage:
 *   node audit-blocks.js                 (run from theme root)
 *   node path/to/audit-blocks.js         (run from anywhere)
 */

import fs   from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Find theme root
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

// ---------------------------------------------------------------------------
// Load blocks.json
// ---------------------------------------------------------------------------

const blocksJsonPath = path.join(themeRoot, 'blocks.json');
const blocksJsonRaw = JSON.parse(fs.readFileSync(blocksJsonPath, 'utf8'));
const registeredBlocks = Array.isArray(blocksJsonRaw) ? blocksJsonRaw : (blocksJsonRaw.blocks ?? blocksJsonRaw);
const blocksDir = path.join(themeRoot, 'blocks');

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const REQUIRED_FILES  = ['block.json', 'render.php']; // fields.json required only if render.php uses get_field()
const IMPORTANT_FILES = ['preview.png']; // not hard required but strongly recommended

function auditBlock(blockName){
    const issues   = [];
    const warnings = [];
    const blockDir = path.join(blocksDir, blockName);

    // Rule: block folder must exist
    if(!fs.existsSync(blockDir)){
        issues.push('folder missing — registered in blocks.json but directory not found');
        return { blockName, issues, warnings };
    }

    // Rule: block.json and render.php are always required
    for(const file of ['block.json', 'render.php']){
        if(!fs.existsSync(path.join(blockDir, file))){
            issues.push(`missing required file: ${file}`);
        }
    }

    // Rule: fields.json required if any .php file in the block calls get_field() with 1 param
    // get_field('key')           = 1 param = block-owned field = needs fields.json
    // get_field('key', $anything) = 2 params = external field = no fields.json needed
    const renderPhpPath = path.join(blockDir, 'render.php');
    const fieldsJsonPath = path.join(blockDir, 'fields.json');
    const phpFiles = fs.readdirSync(blockDir).filter(f => f.endsWith('.php'));
    const usesAcfFields = phpFiles.some(f =>
        /get_field\([^,)]+\)/.test(fs.readFileSync(path.join(blockDir, f), 'utf8'))
    );
    if(usesAcfFields && !fs.existsSync(fieldsJsonPath)){
        issues.push('missing fields.json — a block PHP file uses get_field() with 1 param but no fields.json found');
    }

    // Rule: preview.png (strongly recommended)
    for(const file of IMPORTANT_FILES){
        if(!fs.existsSync(path.join(blockDir, file))){
            warnings.push(`missing recommended file: ${file}`);
        }
    }

    // Rule: block.json — valid JSON, title and description not empty/placeholder
    const blockJsonPath = path.join(blockDir, 'block.json');
    if(fs.existsSync(blockJsonPath)){
        try{
            const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
            const placeholders = ['block title', 'sample block', 'my block', 'untitled', 'block name', ''];

            if(!blockJson.title || placeholders.includes(blockJson.title.toLowerCase())){
                issues.push('block.json: title is empty or a placeholder');
            }
            if(!blockJson.description || placeholders.includes(blockJson.description.toLowerCase())){
                warnings.push('block.json: description is empty or a placeholder');
            }
        }catch{
            issues.push('block.json: invalid JSON');
        }
    }

    // Rule: fields.json — valid JSON, modified timestamp not 0 or missing (only if file exists)
    if(fs.existsSync(fieldsJsonPath)){
        try{
            const fieldsJson = JSON.parse(fs.readFileSync(fieldsJsonPath, 'utf8'));
            const group = Array.isArray(fieldsJson) ? fieldsJson[0] : fieldsJson;
            if(!group?.modified || group.modified === 0){
                issues.push('fields.json: missing or zero `modified` timestamp — run `date +%s` and update it');
            }
        }catch{
            issues.push('fields.json: invalid JSON');
        }
    }

    // Rule: render.php must use get_block_wrapper_attributes()
    if(fs.existsSync(renderPhpPath)){
        const renderContent = fs.readFileSync(renderPhpPath, 'utf8');
        if(!renderContent.includes('get_block_wrapper_attributes')){
            warnings.push('render.php: missing get_block_wrapper_attributes() on wrapper element');
        }

        // Rule: if render-admin.php exists, render.php must have early return
        const adminPhpPath = path.join(blockDir, 'render-admin.php');
        if(fs.existsSync(adminPhpPath) && !renderContent.includes('is_admin()')){
            issues.push('render.php: render-admin.php exists but missing is_admin() early return');
        }
    }

    // Rule: view.js exists but block.json has no viewScript referencing it
    const viewJsPath = path.join(blockDir, 'view.js');
    if(fs.existsSync(viewJsPath) && fs.existsSync(blockJsonPath)){
        try{
            const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
            const viewScript = blockJson.viewScript;
            const hasViewScript = viewScript && (
                (typeof viewScript === 'string' && viewScript.includes('view.js')) ||
                (Array.isArray(viewScript) && viewScript.some(s => typeof s === 'string' && s.includes('view.js')))
            );
            if(!hasViewScript){
                warnings.push('view.js exists but block.json has no viewScript pointing to it — file may be unused');
            }
        }catch{ /* block.json already flagged as invalid above */ }
    }

    // Rule: unknown files in block folder
    const KNOWN_FILES = new Set(['block.json', 'fields.json', 'preview.png', 'render.php', 'render-admin.php', 'view.js', 'index.ts']);
    const KNOWN_EXTENSIONS = new Set(['.php', '.ts', '.js', '.css', '.scss']);
    const entries = fs.readdirSync(blockDir);
    for(const entry of entries){
        const stat = fs.statSync(path.join(blockDir, entry));
        if(!stat.isDirectory() && !KNOWN_FILES.has(entry) && !KNOWN_EXTENSIONS.has(path.extname(entry))){
            warnings.push(`unknown file: ${entry} — check if needed or remove`);
        }
    }

    return { blockName, issues, warnings };
}

// ---------------------------------------------------------------------------
// Check for unregistered block folders (folders that exist but not in blocks.json)
// ---------------------------------------------------------------------------

function findUnregisteredBlocks(){
    if(!fs.existsSync(blocksDir)) return [];
    return fs.readdirSync(blocksDir).filter(name => {
        const stat = fs.statSync(path.join(blocksDir, name));
        return stat.isDirectory() && !registeredBlocks.includes(name);
    });
}

// ---------------------------------------------------------------------------
// Run audit
// ---------------------------------------------------------------------------

console.log(`\nwp-acf-blocks audit — ${themeRoot}\n`);
console.log(`Registered blocks: ${registeredBlocks.length}\n`);

const results         = registeredBlocks.map(auditBlock);
const unregistered    = findUnregisteredBlocks();
let totalIssues       = 0;
let totalWarnings     = 0;
let blocksWithIssues  = 0;

for(const { blockName, issues, warnings } of results){
    const hasIssues   = issues.length > 0;
    const hasWarnings = warnings.length > 0;

    if(hasIssues || hasWarnings){
        console.log(`  ${blockName}`);
        for(const issue   of issues)   { console.log(`    ✗ ${issue}`);   totalIssues++;   }
        for(const warning of warnings) { console.log(`    ⚠ ${warning}`); totalWarnings++; }
        if(hasIssues) blocksWithIssues++;
    }else{
        console.log(`  ✔ ${blockName}`);
    }
}

// Unregistered folders
if(unregistered.length > 0){
    console.log('\nUnregistered block folders (exist on disk but not in blocks.json):');
    for(const name of unregistered){
        console.log(`  ⚠ ${name}`);
        totalWarnings++;
    }
}

// Summary
console.log(`\n─────────────────────────────────`);
console.log(`Blocks checked : ${registeredBlocks.length}`);
console.log(`Issues         : ${totalIssues}`);
console.log(`Warnings       : ${totalWarnings}`);
if(blocksWithIssues > 0){
    console.log(`\n${blocksWithIssues} block(s) need attention.`);
    process.exit(1);
}else{
    console.log(`\nAll blocks passed.`);
}
