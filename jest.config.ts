/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react-jsx',
                },
            },
        ],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^direction$': '<rootDir>/src/__mocks__/direction.ts',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default config;
