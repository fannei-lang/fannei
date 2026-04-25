import re
import sys
import os

class FanneiCompiler:
    def __init__(self):
        # Global injection for println suite
        self.globals = (
            "const println = Object.assign("
            "(...args) => console.log(...args), {"
            "error: (...args) => console.error(...args), "
            "warn: (...args) => console.warn(...args), "
            "info: (...args) => console.info(...args)"
            "});\n"
        )

    def compile_code(self, code):
        # 1. Imports: import std.fs; -> const fs = require('fs');
        code = re.sub(r'import\s+std\.([\w\d_]+);?', r'const \1 = require("\1");', code)

        # 2. Local Imports: import math_lib; -> const math_lib = require("./math_lib.fi");
        # Note: We keep the .fi extension so the Node loader we built earlier handles it
        code = re.sub(r'import\s+([\w\d_]+);', r'const \1 = require("./\1.fi");', code)

        # 3. Relative Imports: import ..folder.file;
        def fix_relative(match):
            path_str = match.group(1)
            parts = path_str.split('.')
            file_name = parts.pop()
            rel_path = "../" + "/".join(parts) + f"/{file_name}.fi"
            return f'const {file_name} = require("{rel_path}");'
        
        code = re.sub(r'import\s+\.\.([\w\d_\.]+);?', fix_relative, code)

        # 4. Extern Class: extern class Name { -> const Name = Object.freeze(class {
        code = re.sub(r'extern\s+class\s+([\w\d_]+)\s*\{', r'const \1 = Object.freeze(class {', code)

        # 5. Extern Variables: extern -> const
        code = re.sub(r'\bextern\s+', 'const ', code)

        return self.globals + code

    def run(self, input_file):
        if not input_file.endswith('.fi'):
            print("Error: Input file must have .fi extension")
            return

        output_file = input_file.replace('.fi', '.js')

        try:
            with open(input_file, 'r') as f:
                fannei_code = f.read()

            js_code = self.compile_code(fannei_code)

            with open(output_file, 'w') as f:
                f.write(js_code)

            print(f"Successfully compiled: {input_file} -> {output_file}")
        
        except Exception as e:
            print(f"Compiler Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fanneic.py <file.fi>")
    else:
        compiler = FanneiCompiler()
        compiler.run(sys.argv[1])