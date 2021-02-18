import typescript from '@rollup/plugin-typescript';
import minify from 'rollup-plugin-babel-minify';

export default {
    input: 'src/index.ts',
    output: {
        format: 'amd',
        file: 'dist/hivesigner.min.js'
    },
    plugins: [
        typescript({
            declaration: false,
            module: 'esnext'
        }),
        minify()
    ]
};