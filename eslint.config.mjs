import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'logs/**'
    ]
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      // =========================
      // JavaScript
      // =========================
      'no-useless-catch': 'off',
      'no-console': 'warn',
      'no-extra-boolean-cast': 'off',

      // =========================
      // TypeScript
      // =========================

      // Cho phép dùng any khi cần
      '@typescript-eslint/no-explicit-any': 'off',

      // Cảnh báo biến không sử dụng
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],

      // Promise nên có await / catch
      '@typescript-eslint/no-floating-promises': 'warn',

      // Giảm các warning quá khắt khe khi làm NestJS
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',

      // Winston thường trả về unknown trong formatter.
      // Không cần bắt template literal quá chặt.
      '@typescript-eslint/restrict-template-expressions': 'off',

      // NestJS thường có async method mà đôi lúc chưa cần await
      '@typescript-eslint/require-await': 'off',

      // =========================
      // Prettier
      // =========================
      'prettier/prettier': [
        'off',
        {
          tabWidth: 2,
          semi: false,
          singleQuote: true,
          trailingComma: 'none',
          printWidth: 100,
          endOfLine: 'auto'
        }
      ]
    }
  }
)