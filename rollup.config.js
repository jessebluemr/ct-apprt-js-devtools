import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import copy from "rollup-plugin-copy";
import replace from 'rollup-plugin-replace'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import multiInput from 'rollup-plugin-multi-input';
import vue from 'rollup-plugin-vue';
import postcss from "rollup-plugin-postcss";

const tsconfig = {
    target: 'ES2017',
};

export default {
    input: [
        'src/js/devtools.ts',
        'src/js/ui/panel.ts',
        'src/js/spy/inject.ts',
        'src/js/spy/background.ts'
    ],
    output: {
        dir: 'dist',
        format: 'esm'
    },
    plugins: [
        copy({
            targets: [
                { src: "src/manifest.json", dest: "dist" },
                { src: "src/hot-reload.js", dest: "dist" },
                { src: "src/html", dest: "dist" }
            ],
            verbose: true
        }),

        multiInput({ relative: 'src/' }),
        replace({
            'process.env.NODE_ENV': '"development"',
            'process.env.VUE_ENV': '"browser"'
        }),
        postcss(),
        vue({}),
        typescript(tsconfig),
        // the plugins below are optional
        resolve(),
        commonjs()
        //,terser()
    ]
}
