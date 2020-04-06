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
		"prefer-const": [0],
		"@typescript-eslint/prefer-const": [0, { destructuring: "any" }],
		"@typescript-eslint/ban-ts-ignore": [0],
		"@typescript-eslint/explicit-function-return-type": [0],
		"@typescript-eslint/no-explicit-any": [0]
	},
	settings: {
		react: {
			version: "detect"
		}
	}
};
