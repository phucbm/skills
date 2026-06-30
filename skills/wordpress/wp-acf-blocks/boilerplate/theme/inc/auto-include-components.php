<?php
if(!defined('ABSPATH')){
	exit;
}

/**
 * Recursively include all PHP files from the given folders.
 * Files starting with "_" are excluded.
 *
 * @param array|string|null $folders
 */
function px_auto_include_components($folders = null): void{
	if($folders === null){
		$folders = [get_stylesheet_directory() . '/components'];
	}
	if(is_string($folders)){
		$folders = [$folders];
	}
	if(!is_array($folders)){
		return;
	}

	foreach($folders as $folder){
		if(!path_is_absolute($folder)){
			$folder = get_stylesheet_directory() . '/' . ltrim($folder, '/');
		}
		if(!is_dir($folder)){
			continue;
		}
		foreach(px_get_php_files_recursive($folder) as $file){
			if(file_exists($file)){
				require_once $file;
			}
		}
	}
}

/**
 * @param string $dir
 * @return array
 */
function px_get_php_files_recursive(string $dir): array{
	$files    = [];
	$iterator = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
		RecursiveIteratorIterator::SELF_FIRST
	);
	foreach($iterator as $file){
		if($file->isFile() && $file->getExtension() === 'php' && $file->getFilename()[0] !== '_'){
			$files[] = $file->getPathname();
		}
	}

	return $files;
}
