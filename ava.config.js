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
        '@babel/register'
    ],
    'babel': {
        'testOptions': {
            'babelrc': false
        }
    }
};