import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    exports: 'named',
  },
  plugins: [
    typescript({ declaration: false, sourceMap: false, module: 'esnext' })
  ]
}
