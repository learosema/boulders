// kudos to https://github.com/madrilene/eleventy-excellent
// CSS and JavaScript as first-class citizens in Eleventy: https://pepelsbey.dev/articles/eleventy-css-js/

const esbuild = require('esbuild');
const path = require('path');

module.exports = (eleventyConfig) => {
  eleventyConfig.addTemplateFormats('ts');

  eleventyConfig.addExtension('ts', {
    outputFileExtension: 'js',
    compile: async (content, fullPath) => {
      if (path.basename(fullPath) !== 'game.ts') {
        console.error('will not be processed: ', fullPath, path.parse(fullPath).name);
        return;
      }

      return async () => {
        let output = await esbuild.build({
          target: 'es2020',
          entryPoints: [fullPath],
          minify: true,
          bundle: true,
          write: false,
        });

        return output.outputFiles[0].text;
      };
    },
  });
};
