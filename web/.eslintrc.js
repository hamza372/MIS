module.exports = {
	parser: "@typescript-eslint/parser",
	extends: [
		"plugin:react/recommended",
		"plugin:@typescript-eslint/recommended"
	],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true
		}
	},
	rules: {
		camelcase: [0, { properties: "never" }],
		"@typescript-eslint/camelcase": [0, { properties: "never" }],
		"react/prop-types": [0],
		"@typescript-eslint/no-use-before-define": [0],
		"@typescript-eslint/member-delimiter-style": ["error", {
			multiline: {
				delimiter: 'none'
			}
		}],
		"@typescript-eslint/prefer-const": [false, { "destructuring": "any" }]
	},
	settings: {
		react: {
			version: "detect"
		}
	}
};
