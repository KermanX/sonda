import { resolve } from 'path';
import { addSourcesToInputs } from '../sourcemap/map';
import { generateReportFromAssets } from '../report/generate';
import type { Plugin } from 'esbuild';
import type { Options, JsonReport } from '../types';

export function SondaEsbuildPlugin( options: Partial<Options> = {} ): Plugin {
	return {
		name: 'sonda',
		setup( build ) {
			build.initialOptions.metafile = true;

			// Esbuild already reads the existing source maps, so there's no need to do it again
			options.detailed = false;

			build.onEnd( result => {
				if ( !result.metafile ) {
					return console.error( 'Metafile is required for SondaEsbuildPlugin to work.' );
				}

				const cwd = process.cwd();
				const inputs = Object
					.entries( result.metafile.inputs )
					.reduce( ( acc, [ path, data ] ) => {
						acc[ path ] = {
							bytes: data.bytes,
							format: data.format ?? 'unknown',
							imports: data.imports.map( data => data.path ),
							belongsTo: null,
						};

						/**
						 * Because esbuild already reads the existing source maps, there may be
						 * cases where some report "outputs" include "inputs" don't exist in the
						 * main "inputs" object. To avoid this, we parse each esbuild input and
						 * add its sources to the "inputs" object.
						 */
						addSourcesToInputs(
							resolve( cwd, path ),
							acc
						);

						return acc;
					}, {} as JsonReport[ 'inputs' ] );

				return generateReportFromAssets(
					Object.keys( result.metafile.outputs ).map( path => resolve( cwd, path ) ),
					inputs,
					options
				);
			} );
		}
	};
}
