export default {
    'files': [
        './tests/**/*.js'
    ],
    'failFast': true,
    'failWithoutAssertions': false,
    'tap': true,
    'verbose': true,
    'compileEnhancements': false,
    'require': [
        '@babel/register',
        'core-js/fn/array/flat-map'
    ],
    'babel': {
        'testOptions': {
            'babelrc': false
        }
    }
};