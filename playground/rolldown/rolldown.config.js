import { defineConfig } from 'rolldown';
import Sonda from 'sonda/rollup';

export default defineConfig( {
	input: 'src/index.ts',
	output: {
		file: 'dist/index.js',
		sourcemap: true,
		format: 'es',
		minify: true
	},
	plugins: [
		Sonda({
			gzip: true,
			brotli: true,
			detailed: true,
			sources: true
		}),
	]
} );
