module.exports = {
  process(sourceText, sourcePath, options) {
    const code = 'module.exports = `' + sourceText + '`;'
    return { code };
  }
}
