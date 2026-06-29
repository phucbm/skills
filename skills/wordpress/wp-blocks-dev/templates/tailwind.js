#!/usr/bin/env node

/**
 * wp-blocks-dev — Tailwind CSS build wrapper
 *
 * - Reads TAILWIND_USER from .env.local for per-developer output files
 * - Writes to assets/css/style.generated.css (shared) or
 *   assets/css/style.{user}.generated.css (per-developer)
 * - Supports --watch flag for development
 *
 * Usage:
 *   node scripts/tailwind.js           (production build)
 *   node scripts/tailwind.js --watch   (watch mode)
 *
 * Per-developer setup:
 *   Create .env.local in the theme root with: TAILWIND_USER=yourlogin
 *   Then run: pnpm tw-watch
 */

import { spawn }    from 'node:child_process';
import fs           from 'node:fs';
import path         from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sanitize a string to a safe CSS filename key.
 * Matches the PHP sanitization in tailwind-theme-loader.php.
 */
function sanitizeKey(raw){
    return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '');
}

/**
 * Load key=value pairs from .env.local (gitignored, per-developer).
 * Returns an empty object if the file does not exist.
 */
function loadEnvLocal(){
    const envPath = path.resolve(__dirname, '../.env.local');
    try{
        if(!fs.existsSync(envPath)) return {};
        const env = {};
        fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
            const match = line.match(/^([A-Z_]+)=(.+)$/);
            if(match) env[match[1]] = match[2].trim();
        });
        return env;
    }catch{
        return {};
    }
}

/**
 * Resolve the output file path.
 * Uses TAILWIND_USER from .env.local or the environment, falls back to shared file.
 */
function getOutFile(){
    const envLocal = loadEnvLocal();
    const user     = sanitizeKey(envLocal.TAILWIND_USER || process.env.TAILWIND_USER || '');
    return user
        ? `./assets/css/style.${user}.generated.css`
        : `./assets/css/style.generated.css`;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const args    = process.argv.slice(2);
const watch   = args.includes('--watch');
const outFile = getOutFile();

console.log(`Tailwind CSS: ${outFile}${watch ? ' (watch)' : ''}\n`);

const twArgs = ['-i', './assets/css/index.css', '-o', outFile];
if(watch) twArgs.push('--watch');

const child = spawn('tailwindcss', twArgs, { stdio: 'inherit', shell: true });

child.on('exit', code => process.exit(code ?? 1));
