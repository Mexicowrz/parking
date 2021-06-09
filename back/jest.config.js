module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  modulePathIgnorePatterns: ["jest.hooks.ts"],
  verbose: true
};