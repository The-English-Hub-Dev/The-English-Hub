const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            sourceType: 'commonjs',
            ecmaVersion: 'latest',
        },
        rules: {
            'no-unused-vars': 'off',
            'no-case-declarations': 'warn',
            'no-undef': 'off',
        },
    },
];
