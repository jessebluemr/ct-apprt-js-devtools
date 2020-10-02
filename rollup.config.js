import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import copy from "rollup-plugin-copy";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import multiInput from 'rollup-plugin-multi-input';
import VuePlugin from 'rollup-plugin-vue'

const tsconfig = {
    target: 'ES2017',
};

export default {
    input: [
        'src/js/devtools.ts',
        'src/js/panel.ts'
    ],
    output: {
        dir: 'dist',
        format: 'esm',
        preserveModulesRoot: "src"
    },
    plugins: [
        copy({
            targets: [
                { src: "src/manifest.json", dest: "dist" },
                { src: "src/html", dest: "dist" }
            ],
            copyOnce: true,
            verbose: true
        }),
        multiInput({ relative: 'src/' }),
        VuePlugin(),
        typescript(tsconfig),
        // the plugins below are optional
        resolve(),
        commonjs(),
        terser()
    ]
}
