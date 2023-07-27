module.exports = function (eleventyConfig) {
  // Add as a valid extension to process
  // Alternatively, add this to the list of formats you pass to the `--formats` CLI argument
  eleventyConfig.addTemplateFormats("txt");

  // "clowd" here means that the extension will apply to any .clowd file
  eleventyConfig.addExtension("txt", {
    compile: async (inputContent) => {
      return async () => {
        return inputContent;
      };
    }
  });
};