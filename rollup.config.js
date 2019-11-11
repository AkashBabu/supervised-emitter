import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins';

import pkg from './package.json'

const tsconfigOverride = { 
  compilerOptions: { 
    declaration: false,
    module: 'es2015'
  },
};

const es2015Module = { 
  compilerOptions: { 
    module: 'es2015'
  },
};

export default [
  // CommonJS
  {
    input: 'src/supervisedEmitter.ts',
    output: { file: 'lib/supervisedEmitter.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        extensions: ['.ts']
      }),
      typescript({ 
        useTsconfigDeclarationDir: true,
        tsconfigOverride: es2015Module
      }),
      babel()
    ]
  },

  // ES
  {
    input: 'src/supervisedEmitter.ts',
    output: { file: 'es/supervisedEmitter.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        extensions: ['.ts']
      }),
      typescript({ tsconfigOverride }),
      babel()
    ]
  },

  // ES for Browsers
  {
    input: 'src/supervisedEmitter.ts',
    output: { file: 'es/supervisedEmitter.mjs', format: 'es', indent: false },
    plugins: [
      builtins(),
      nodeResolve({
        extensions: ['.ts'],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      commonjs({
        include: /node_modules/
      }),
      typescript({ tsconfigOverride }),
      babel({
        exclude: 'node_modules/**'
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  },

  // UMD Development
  {
    input: 'src/supervisedEmitter.ts',
    output: {
      file: 'dist/supervisedEmitter.js',
      format: 'umd',
      name: 'SupervisedEmitter',
      indent: false
    },
    plugins: [
      builtins(),
      nodeResolve({
        extensions: ['.ts'],
      }),
      commonjs({
        include: /node_modules/
      }),
      typescript({ tsconfigOverride }),
      babel({
        exclude: 'node_modules/**'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },

  // UMD Production
  {
    input: 'src/supervisedEmitter.ts',
    output: {
      file: 'dist/supervisedEmitter.min.js',
      format: 'umd',
      name: 'SupervisedEmitter',
      indent: false
    },
    plugins: [
      builtins(),
      nodeResolve({
        extensions: ['.ts'],
      }),
      commonjs({
        include: /node_modules/
      }),
      typescript({ tsconfigOverride }),
      babel({
        exclude: 'node_modules/**'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  }
]