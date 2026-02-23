import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    {
        ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"]
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname
            }
        },
        plugins: {
            "@typescript-eslint": tseslint
        },
        rules: {
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-types": "off",
            "@typescript-eslint/no-duplicate-imports": "off",
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/no-duplicate-enum-values": "error",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/prefer-enum-initializers": "error",
            "@typescript-eslint/prefer-readonly": "warn"
        }
    }
];
