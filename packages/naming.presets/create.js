'use strict';

const presets = require('.');

module.exports = init;

/**
 * Returns delims and wordPattern.
 *
 * @param {Object} options - user options
 * @returns {BemNamingDelims}
 */
function init(options) {
    if (!options) {
        return presets.origin;
    }

    if (typeof options === 'string') {
        const preset = presets[options];

        if (!preset) {
            throw new Error('The `' + options + '` naming is unknown.');
        }

        return preset;
    }

    const defaults = presets.origin;
    const defaultDelims = defaults.delims;
    const defaultModDelims = defaultDelims.mod;
    const optionsDelims = options.delims || {};
    const mod = optionsDelims.mod || defaultDelims.mod;

    return {
        delims: {
            elem: optionsDelims.elem || defaultDelims.elem,
            mod: typeof mod === 'string'
                ? { name: mod, val: mod }
                : {
                    name: mod.name || defaultModDelims.name,
                    val: mod.val || defaultModDelims.val
                }
        },
        wordPattern: options.wordPattern || defaults.wordPattern
    };
}
