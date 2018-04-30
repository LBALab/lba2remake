const path = require('path');

module.exports = ({types}) => ({
    visitor: {
        ReferencedIdentifier(p, state) {
            if (p.node.name === '__location') {
                const location = p.node.loc;
                const line = (location
                    && location.start.line !== null
                    && location.start.line !== undefined)
                    ? `:${location.start.line}`
                    : '';
                const filename = path.relative(
                    process.cwd(),
                    path.resolve(state.file.opts.filename)
                );

                p.replaceWith(types.stringLiteral(`${filename}${line}`));
            }
        }
    }
});
