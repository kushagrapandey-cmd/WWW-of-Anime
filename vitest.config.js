import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/game*.test.js', 'tests/quiz*.test.js', 'tests/mini*.test.js'], environment: 'node' } });
