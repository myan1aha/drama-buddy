/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@drama-buddy/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
};
