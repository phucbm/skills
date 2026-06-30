import { defineConfig, type Options } from 'tsup';
import { globSync } from 'glob';

// tsup configuration docs: https://tsup.egoist.dev/#configuration

type EntryMap = Record<string, string>;

const isDev: boolean = process.env.NODE_ENV === 'development';

/**
 * Convention:
 * - Any `*.entry.ts` / `*.entry.tsx` in this theme is an entrypoint.
 * - Output path matches the source path but drops `.entry`:
 *   - `assets/js/index.entry.ts` -> `assets/js/index.js`
 *   - `blocks/foo/view.entry.ts` -> `blocks/foo/view.js`
 */
function getEntryConfig(): EntryMap{
	const entryFiles: string[] = globSync('**/*.entry.{ts,tsx}', {
		ignore: ['node_modules/**', 'dist/**'],
	});

	return entryFiles.reduce<EntryMap>((acc, filePath) => {
		const outKey    = filePath.replace(/\.entry\.(ts|tsx)$/, '');
		acc[outKey] = filePath;
		return acc;
	}, {});
}

export default defineConfig((options: Options) => {
	const entry = getEntryConfig();

	return {
		entry,
		outDir: '.',
		format: ['iife'],
		target: 'es2020',
		platform: 'browser',
		bundle: true,
		minify: true,
		sourcemap: true,
		clean: false,
		shims: false,
		splitting: false,
		outExtension: () => ({js: '.js'}),
		define: {
			'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
		},
		esbuildOptions: (esbuild) => {
			esbuild.define    = {...esbuild.define, global: 'globalThis'};
			esbuild.treeShaking = true;
		},
	};
});
