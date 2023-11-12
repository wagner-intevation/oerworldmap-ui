export default [
  {
    "env": {"es6": true},
    "files": ["**/*.js", "**/*.jsx"],
    "parserOptions": {
      "ecmaVersion": 2017,
      "sourceType": "module"
    },
    "rules": {
      "react/button-has-type": [1, {
        "reset": true
      }],
      "n/global-require": "warn",
      "no-alert": "warn",
      "no-restricted-globals": "warn",
      "jsx-a11y/label-has-for": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "node/no-unsupported-features/es-syntax": "off",
      "node/no-unsupported-features/node-builtins": "off",
      "jsx-a11y/no-noninteractive-element-to-interactive-role": "off",
      "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
      "react/no-array-index-key": 0,
      "indent": ["error", 2],
      "semi": ["error", "never"],
      "import/no-dynamic-require": "off",
      "no-console": "warn",
      "jsx-a11y/no-autofocus": "off",
      "no-nested-ternary": "off",
      "no-return-assign": "off",
      "no-unused-expressions": "off",
      "no-underscore-dangle": "off",
      "no-shadow": "off",
      "no-param-reassign": "off",
      "no-mixed-operators": "off",
      "consistent-return": "off",
      "guard-for-in": "off",
      "padding-line-between-statements": [
        "error",
        { "blankLine": "any", "prev": "*", "next": "*" }
    ]},
    "parser": "babel-eslint",
    "extends": ["airbnb", "stylelint", "plugin:n/recommended"]
  }
]
