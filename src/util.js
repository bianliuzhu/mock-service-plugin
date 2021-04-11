const fs = require('fs')

function cleanCache (modulePath) {
  require.cache[modulePath] = null
}

function walk (dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    file = dir + '/' + file
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file))
    } else {
      results.push(file)
    }
  })
  return results
}

function isJavacriptFile (file) {
  return /\.js$/.test(file)
}

module.exports = {
  cleanCache,
  walk,
  isJavacriptFile
}
