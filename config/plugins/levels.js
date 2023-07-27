module.exports = function(eleventyConfig) {
  eleventyConfig.addTemplateFormats("txt");
  eleventyConfig.addExtension("txt", {
    compile: async (inputContent) => {
      return async () => {
        return inputContent;
      };
    }
  });
};
