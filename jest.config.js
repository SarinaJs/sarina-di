module.exports = {
	name: 'sarina',
	verbose: true,
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '.',
	testRegex: '.spec.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	collectCoverageFrom: ['src/**/*.(t|j)s'],
	coverageDirectory: 'test_result/coverage',
	testEnvironment: 'node',
	moduleNameMapper: {
		'@sarina/di': '<rootDir>/src/index.ts',
		'@sarina/di/(.*)': '<rootDir>/src/$1',
	},
};
