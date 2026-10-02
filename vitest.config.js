import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/game*.test.js', 'tests/quiz*.test.js', 'tests/mini*.test.js', 'tests/sound.test.js', 'tests/data-registry.test.js'], environment: 'node' } });
