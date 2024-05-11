const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            sourceType: 'commonjs',
            ecmaVersion: 'latest',
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-case-declarations': 'off',
            'no-undef': 'off',
        },
    },
];
