export default {
    env: {
        browser: true,
        es2021: true
    },
    extends: ['prettier', 'eslint:recommended', 'airbnb-base', 'plugin:import/recommended'],
    parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module'
    },
    plugins: [],
    rules: {
        'object-curly-newline': 'off',
        semi: 'off',
        'func-names': 'off',
        'max-len': 'off',
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'consistent-return': 'off',
        'no-use-before-define': 'off', // a lot off errors
        radix: 'error',
        indent: ['error', 4],
        'padded-blocks': ['warn', { blocks: 'never', classes: 'always', switches: 'never' }],
        'import/no-extraneous-dependencies': 'off',
        'import/no-cycle': 'off',
        'import/no-duplicates': 'error',
        'no-prototype-builtins': 'error',
        'no-restricted-syntax': 'off', // need sort it out
        'implicit-arrow-linebreak': ['error', 'below'],
        camelcase: 'off',
        'max-classes-per-file': ['error', { max: 2 }],
        'no-shadow': 'off', // a lot of errors
        'new-cap': 'off',
        'no-lonely-if': 'error',
        'no-useless-escape': 'error',
        'no-return-await': 'error',
        'no-nested-ternary': 'off', // a ? xxx : bbb ? ccc : ddd
        'no-unused-expressions': 'error',
        'no-bitwise': 'off',
        'computed-property-spacing': 'off',
        'guard-for-in': 'error',
        'no-unused-vars': 'off',
        'no-throw-literal': 'off',
        'no-trailing-spaces': 'off',
        'no-return-assign': 'error',
        'no-useless-return': 'off',
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-fallthrough': 'error',
        'operator-assignment': 'off',
        'no-console': 'off',
        'no-alert': 'off', // we use window.prompt
        'no-constant-condition': 'off',
        'no-unreachable': 'off',
        'no-multi-assign': 'error',
        'no-tabs': 'error',
        'array-callback-return': 'off',
        'no-debugger': 'warn',
        'default-case': 'error',
        'import/named': 'off',
        'no-undef': 'off',
        'no-underscore-dangle': 'off',
        'prefer-promise-reject-errors': 'off',
        'prefer-destructuring': 'off',
        'prefer-rest-params': 'off',
        'prefer-const': 'off',
        'import/prefer-default-export': 'off',
        'import/order': 'off',
        'import/namespace': 'off',
        'import/no-unresolved': 'off',
        'class-methods-use-this': 'error',
        'no-param-reassign': ['off', { props: false }]
    },
    settings: {
        'import/resolver': {
            node: {
                paths: ['src'],
                extensions: ['.js', '.ts']
            }
        }
    }
};
