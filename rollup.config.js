import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss';
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: 'src/index.tsx',
  output: [
    {
      dir: './dist',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false
    }
  ],
  preserveModules: false,
  plugins: [
    commonjs(),
    typescript(),
    postcss({
      sourceMap: true,
      extract: false,
      minimize: false
    }),
  ],
  external: ['react', 'react-dom']
}