import { terser } from 'rollup-plugin-terser';
const isProduction = process.env.BUILD === 'production';
module.exports = {
  input: 'src/js/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [isProduction && terser()]
};
