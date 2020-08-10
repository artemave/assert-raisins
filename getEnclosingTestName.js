module.exports = function getEnclosingTestName(fileContents, lineNumber) {
  return fileContents.split("\n").reduce((result, line, idx) => {
    let match
    if (idx < Number(lineNumber) && (match = line.match(/(?:test|it) *\((?:'([^']+)'|"([^"]+)")/))) {
      result = match[1] || match[2]
    }
    return result
  }, null)
}
