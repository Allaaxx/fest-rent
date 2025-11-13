import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
        },
      },
    ],
  },
  collectCoverageFrom: ["lib/**/*.ts", "app/api/**/*.ts", "!**/*.d.ts", "!**/node_modules/**"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
}

export default config
