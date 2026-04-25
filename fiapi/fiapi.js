const fs = require('fs');
const path = require('path');

const println = Object.assign(
    (...args) => console.log(...args),
    {
        error: (...args) => console.error(...args),
        warn: (...args) => console.warn(...args),
        info: (...args) => console.info(...args)
    }
);

class Fannei {
    /**
     * Transforms Fannei (.fi) syntax into executable JavaScript.
     * @param {string} code - The raw source code.
     * @param {string} executionDir - The directory context for relative imports.
     */
    static transform(code, executionDir) {
        // Injected globals for every execution context
        let globals = `
            const println = Object.assign(
                (...args) => console.log(...args),
                {
                    error: (...args) => console.error(...args),
                    warn: (...args) => console.warn(...args),
                    info: (...args) => console.info(...args)
                }
            );
        `;

        let transformed = code
            // Handle standard library: import std.io; -> const io = require("io");
            .replace(/import\s+std\.([\w\d_]+);?/g, 'const $1 = require("$1");')
            
            // Handle local imports: import MyModule; -> const MyModule = require("./path/to/MyModule.fi");
            .replace(/import\s+([\w\d_]+);/g, (match, moduleName) => {
                const fullPath = path.join(executionDir, `${moduleName}.fi`).replace(/\\/g, '/');
                return `const ${moduleName} = require("${fullPath}");`;
            })

            // Handle parent directory imports: import ..utils.math;
            .replace(/import\s+\.\.([\w\d_\.]+);?/g, (match, pathStr) => {
                const parts = pathStr.split('.');
                const fileName = parts.pop();
                const relativePath = path.join(executionDir, '..', ...parts, `${fileName}.fi`).replace(/\\/g, '/');
                return `const ${fileName} = require("${relativePath}");`;
            })

            // Language Keywords
            .replace(/extern\s+class\s+([\w\d_]+)\s*\{/g, 'const $1 = Object.freeze(class {')
            .replace(/\bextern\s+/g, 'const ');

        return globals + transformed;
    }

    /**
     * Reads a file, transforms it, and executes it.
     * @param {string} filePath - Path to the .fi file.
     */
    static run(filePath) {
        const fullPath = path.resolve(filePath);
        const executionDir = path.dirname(fullPath);

        if (!fs.existsSync(fullPath)) {
            println.error(`\x1b[31merror: file not found\x1b[0m`);
            println.error(`  ${filePath}`);
            process.exit(1);
        }

        const rawCode = fs.readFileSync(fullPath, 'utf8');
        
        // Step 1: Transform (Syntax Check)
        let jsCode;
        try {
            jsCode = this.transform(rawCode, executionDir);
        } catch (err) {
            this.reportError("syntax error", err.message, rawCode.split('\n')[0]);
            return;
        }

        // Step 2: Execute (Runtime Check)
        try {
            eval(jsCode);
        } catch (err) {
            const type = (err instanceof ReferenceError || err instanceof TypeError) 
                         ? "runtime error" 
                         : "unknown runtime exception";
            this.reportError(type, err.message);
            if (err.stack) {
                console.log(`\x1b[90m${err.stack.split('\n').slice(1, 3).join('\n')}\x1b[0m`);
            }
        }
    }

    /**
     * Internal helper for standardized error formatting.
     */
    static reportError(type, message, preview = null) {
        console.log(`\x1b[31merror: ${type}\x1b[0m`);
        console.log(`  details: ${message}`);
        if (preview) {
            console.log(`     ${preview}`);
            console.log(`     \x1b[31m${"~".repeat(preview.length)}\x1b[0m`);
        }
    }
}

module.exports = Fannei;