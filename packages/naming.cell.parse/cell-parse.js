'use strict';

const assert = require('assert');

const bemNamingParse = require('@bem/sdk.naming.entity.parse');
const pathPatternParser = require('@bem/sdk.naming.cell.pattern-parser');

const buildPathParseMethod = (pattern, defaultLayer, wordPattern) => {
    const separation = pathPatternParser(pattern);

    return (cell) => {
        const keys = [];
        const res = [];
        const join = (parts, j) => {
            for (let i = 0; i < parts.length - j; i += 1) {
                const el = parts[i + j];
                if (i % 2 === 0) {
                    res.push(el);
                } else if (Array.isArray(el)) {
                    res.push('(:');
                    const k = el[0];
                    (k !== 'layer' || (cell[k] !== defaultLayer)) && cell[k] && join(el, 1);
                } else {
                    keys.push(el);
                    res.push('(?P<' + el + '>.+)');
                }
            }
        };

        join(separation, 0);
        return { regexp: res.join(''), keys: keys };
    };
};

/**
 * Stringifier generator
 *
 * @param {BemNamingConvention} convention - naming, path and scheme
 * @returns {function(BemCell): string} converts cell to file path
 */
module.exports = (convention) => {
    const conv = convention || {};
    const fsConv = conv.fs || {};
    assert(typeof fsConv.pattern === 'string',
        '@bem/sdk.naming.cell.parse: fs.pattern field required in convention');

    const entityParse = bemNamingParse(convention);

    const pathParse = buildPathParseMethod(fsConv.pattern, fsConv.defaultLayer, conv.wordPattern);

    return (path) => {
        const tech = path.basename(path).split('.').slice(1).join('.');
        return BemCell.create({ block: path, tech });
    };

// -----------------
    const dd = fsConv.delims || {};
    const delims = Object(conv.delims);
    const dElem = 'elem' in dd ? dd.elem : (delims.elem || '__');
    const dMod = 'mod' in dd ? dd.mod : (Object(delims.mod).name || (typeof delims.mod === 'string' && delims.mod) || '_');

    const schemeParse = fsConv.scheme === 'flat' ?
        () => ''
        : e => `${e.block}/${e.elem?`${dElem}${e.elem}/`:''}${e.mod?`${dMod}${e.mod.name}/`:''}`;

    return (cell) => (assert(cell.tech, '@bem/sdk.naming.cell.parse: ' +
            'tech field required for parsing (' + cell.id + ')'),
        pathParse({
            layer: cell.layer || 'common',
            tech: cell.tech,
            entity: schemeParse(cell.entity) + entityParse(cell.entity)
        }));
// -----------------
};
