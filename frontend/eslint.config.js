import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importX from 'eslint-plugin-import-x'
import babelParser from '@babel/eslint-parser'

export default [
    {ignores: ['dist']},
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    presets: [
                        '@babel/preset-typescript',
                        ['@babel/preset-react', {runtime: 'automatic'}],
                    ],
                },
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'import-x': importX,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', {allowConstantExport: true}],
            'import-x/order': ['error', {
                'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                'alphabetize': {'order': 'asc', 'caseInsensitive': true}
            }],
            'import-x/no-duplicates': 'error',
            // TypeScript handles these via tsc; babel-parser strips types so js rules produce false positives
            'no-undef': 'off',
            'no-unused-vars': 'off',
        },
    },
]
