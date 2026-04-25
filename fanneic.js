const Fannei = require('./fiapi/fiapi.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const COLORS = {
    reset: "\x1b[0m",
    lightBlue: "\x1b[94m",
    darkGreen: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    gray: "\x1b[90m"
};

require.extensions['.fi'] = function (module, filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const executionDir = path.dirname(filename);
    const compiled = Fannei.transform(content, executionDir);
    module._compile(compiled, filename);
};

const args = process.argv.slice(2);
if (args.length > 0) {
    Fannei.run(args[0]);
} else {
    startRepl();
}

function showError(type, message, code) {
    console.log(`${COLORS.red}error: ${type}${COLORS.reset}`);
    if (message) console.log(`${COLORS.gray}  details: ${message}${COLORS.reset}`);
    if (code) {
        console.log(`     ${code}`);
        console.log(`     ${COLORS.red}${"~".repeat(code.length)}${COLORS.reset}`);
    }
}

function startRepl() {
    console.log(`${COLORS.lightBlue}Fannei 0.2.0${COLORS.reset}`);
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    rl.setPrompt(`${COLORS.darkGreen}> ${COLORS.reset}`);
    let buffer = "";
    rl.prompt();

    rl.on('line', (line) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.endsWith('\\') || trimmedLine.endsWith('{')) {
            buffer += line.slice(0, -1) + "\n";
            rl.setPrompt(`${COLORS.yellow}??? ${COLORS.reset}`);
            rl.prompt();
            return;
        }

        buffer += line;
        const currentInput = buffer; // Save for preview

        if (buffer.trim()) {
            let compiled;
            try {
                // 1. Check for Syntax Errors during Transformation
                compiled = Fannei.transform(buffer, process.cwd());
            } catch (err) {
                showError("syntax error", err.message, currentInput);
                resetRepl();
                return;
            }

            try {
                // 2. Check for Runtime Errors during Execution
                const result = eval(compiled); 
                if (result !== undefined) console.log(result);
            } catch (err) {
                if (err instanceof ReferenceError || err instanceof TypeError) {
                    showError("runtime error", err.message, currentInput);
                } else {
                    showError("unknown runtime exception", err.message, currentInput);
                }
            }
        }

        resetRepl();

        function resetRepl() {
            buffer = "";
            rl.setPrompt(`${COLORS.darkGreen}> ${COLORS.reset}`);
            rl.prompt();
        }
    });

    rl.on('close', () => {
        console.log(`\n${COLORS.lightBlue}Exiting Fannei...${COLORS.reset}`);
        process.exit(0);
    });
}