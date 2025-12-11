import glob from 'glob';
import { resolve } from 'path';
import touch from 'touch';
import type { Compiler, Compilation } from 'webpack';

interface WebpackWatchPluginOptions extends Omit<any, 'absolute'> {
  files?: string[];
  verbose?: boolean;
}

class WebpackWatchPlugin {
  private files: string[];
  private verbose: boolean;
  private globOptions: any;
  private filesAlreadyAdded: boolean;

  constructor(options: WebpackWatchPluginOptions = {}) {
    const { files = [], verbose, ...globOptions } = options;

    this.files = files;
    this.verbose = !!verbose;
    this.globOptions = {
      absolute: true,
      ...globOptions,
    };
    this.filesAlreadyAdded = false;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.afterCompile.tapAsync(
      'WebpackWatchPlugin',
      (compilation: Compilation, callback: () => void) => {
        const filesFound: string[] = [];
        const filesFoundToExclude: string[] = [];

        for (const pattern of this.files) {
          if (pattern.substr(0, 1) !== '!') {
            glob.sync(pattern, this.globOptions).forEach((file) => {
              filesFound.push(file);
            });
          } else {
            glob.sync(pattern.substr(1), this.globOptions).forEach((file) => {
              filesFoundToExclude.push(file);
            });
          }
        }

        const files = (
          (
            filesFound.map((file) => {
              if (filesFoundToExclude.indexOf(file) !== -1) {
                return null;
              }
              return file;
            })
          )
        ).filter((file) => file !== null).map((file) => resolve(file));

        if (this.verbose && !this.filesAlreadyAdded) {
          console.log('Additional files watched:', JSON.stringify(files, null, 2));
        }
        console.log({ files });

        files.forEach((file) => {
          compilation.fileDependencies.add(file);
        });

        this.filesAlreadyAdded = true;

        const outputPath = compilation.outputOptions.path;
        const assets = compilation.getAssets();
        if (assets.length > 0 && outputPath) {
          const firstAssetName = assets[0].name;
          const assetToTouch = resolve(outputPath, firstAssetName);
          touch(assetToTouch);
        }

        callback();
      }
    );
  }
}

export default WebpackWatchPlugin;

