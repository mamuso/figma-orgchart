module.exports = function (buildOptions) {
  return {
    ...buildOptions,
    loader: { '.yml': 'text' },
  }
}
