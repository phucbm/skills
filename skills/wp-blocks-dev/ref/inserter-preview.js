/**
 * Inserter hover preview image for ACF blocks (DOM enhancement).
 *
 * Based on community solution:
 * https://support.advancedcustomfields.com/forums/topic/acf-add-preview-image-for-custom-blocks-2/
 *
 * This script runs in the block editor only.
 */

(function(){
    const NAMESPACE = 'acf';
    const PREVIEW_CONTAINER_SELECTOR = '.block-editor-inserter__preview-content-missing';
    const INSERTER_ITEM_SELECTOR = '.block-editor-block-types-list__item';

    const templateUrl = window.PX_TEMPLATE_URL || '';
    if(!templateUrl || !window.wp || !window.wp.data) return;

    /** @type {Map<string, string|null>} */
    const cache = new Map();

    function setPreview(container, imageUrl){
        if(!imageUrl){
            container.style.background = '';
            container.style.backgroundSize = '';
            container.style.fontSize = '';
            return;
        }

        container.style.background = `url(${imageUrl}) no-repeat center`;
        container.style.backgroundSize = 'contain';
        container.style.fontSize = '0px';
    }

    function getBlockTypeNameFromItem(item){
        // Newer Gutenberg often has data-type="namespace/slug"
        const dataType = item.getAttribute('data-type');
        if(dataType) return dataType;

        // Fallback for older Gutenberg:
        // class example: editor-block-list-item-acf-hero-banner
        const cls = item.className
            .split(/\s+/)
            .find(c => c.startsWith('editor-block-list-item-'));

        if(!cls) return '';

        const tail = cls.replace('editor-block-list-item-', '');

        // Must match namespace
        if(!tail.startsWith(NAMESPACE + '-')) return '';

        const slug = tail.slice(NAMESPACE.length + 1);
        return `${NAMESPACE}/${slug}`;
    }

    function getPreviewFilename(blockTypeName){
        const blockType = window.wp.data
            .select('core/blocks')
            .getBlockType(blockTypeName);

        const def =
            blockType &&
            blockType.attributes &&
            blockType.attributes.previewImage &&
            blockType.attributes.previewImage.default;

        return typeof def === 'string' && def.trim()
            ? def.trim()
            : 'preview.png';
    }

    function buildPreviewUrl(blockTypeName){
        const slug = blockTypeName.startsWith(NAMESPACE + '/')
            ? blockTypeName.slice(NAMESPACE.length + 1)
            : '';

        if(!slug) return null;

        const filename = getPreviewFilename(blockTypeName);
        // Allow absolute URL
        if(/^https?:\/\//i.test(filename)) return filename;

        return `${templateUrl}/blocks/${slug}/${filename}`;
    }

    function preload(url){
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    function resolvePreviewUrl(blockTypeName){
        if(cache.has(blockTypeName)){
            return Promise.resolve(cache.get(blockTypeName));
        }

        const url = buildPreviewUrl(blockTypeName);
        if(!url){
            cache.set(blockTypeName, null);
            return Promise.resolve(null);
        }

        return preload(url).then((ok) => {
            if(ok){
                cache.set(blockTypeName, url);
                return url;
            }

            if(url.endsWith('/preview.png')){
                const jpg = url.replace(/\/preview\.png$/, '/preview.jpg');
                return preload(jpg).then((ok2) => {
                    cache.set(blockTypeName, ok2 ? jpg : null);
                    return ok2 ? jpg : null;
                });
            }

            cache.set(blockTypeName, null);
            return null;
        });
    }

    document.addEventListener('mouseover', function(e){
        const previewContainer = document.querySelector(PREVIEW_CONTAINER_SELECTOR);
        if(!previewContainer) return;

        const item = e.target && e.target.closest
            ? e.target.closest(INSERTER_ITEM_SELECTOR)
            : null;

        if(!item) return;

        const blockTypeName = getBlockTypeNameFromItem(item);
        if(!blockTypeName || !blockTypeName.startsWith(NAMESPACE + '/')){
            setPreview(previewContainer, null);
            return;
        }

        resolvePreviewUrl(blockTypeName).then((url) => {
            setPreview(previewContainer, url);
        });
    });
})();
