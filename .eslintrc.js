module.exports = {
    "parser": "babel-eslint",
    "globals": {},
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "jest": true
    },
    "plugins": [
        "fp",
        "import"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:fp/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
    ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        // "indent": [
        //     "error",
        //     4,
        //     {"SwitchCase": 1}
        // ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": "off",
        "no-unused-vars": "error",
        "fp/no-arguments": "error", // Forbid the use of arguments.
        "fp/no-class": "error", // Forbid the use of class.
        "fp/no-delete": "error", // Forbid the use of delete.
        "fp/no-events": "error", // Forbid the use of the events module.
        "fp/no-get-set": "error", // Forbid the use of getters and setters.
        "fp/no-let": "error", // Forbid the use of let.
        "fp/no-loops": "off", // Forbid the use of loops.
        "fp/no-mutating-assign": "error", // Forbid the use of Object.assign() with a variable as first argument.
        "fp/no-mutating-methods": "error", // Forbid the use of mutating methods.
        "fp/no-mutation": "error",  // Forbid the use of mutating operators.
        "fp/no-nil": "off", // Forbid the use of null and undefined.
        "fp/no-proxy": "error", // Forbid the use of Proxy.
        // ... es6 spread is cool.
        "fp/no-rest-parameters": "off", // Forbid the use of rest parameters.
        "fp/no-this": "error", // Forbid the use of this.
        "fp/no-throw": "off", // Forbid the use of throw.
        "fp/no-unused-expression": "off", // Enforce that an expression gets used.
        "fp/no-valueof-field": "error", // Forbid the creation of valueOf fields.
        "no-var": "error",
        "no-inner-declarations": "off" // can we define a function inside inner scopes like if/else/...
    }
};