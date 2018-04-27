const path = require('path')
const fs = require('fs-extra')
/*
 * The hoek@2.16.3 pkg is causing security errors on Github
 * run `npm ls hoek` at the root to see dep graph.
 * hoek needs to be updated, but because web-resource-inliner
 * is a build tool, I'm making it `opt-in` as a peer dep
 */
const inline = require('web-resource-inliner')

const ROOT = path.join(__dirname, '../')
const SRC = path.join(ROOT, 'src')
const TEMP = path.join(ROOT, 'dist/temp')
const DIST = path.join(ROOT, 'dist/prod')

fs.ensureDirSync(DIST)

fs.readdir(TEMP, (err, files) => {
  files.filter(f => f.endsWith('.js')).forEach(file => {
    fs.copy(path.join(TEMP, file), path.join(DIST, file))
  })
})

const htmlFrom = path.join(TEMP, 'spring.html')
const htmlTo = path.join(DIST, 'spring.html')

const htmlFromContents = fs.readFileSync(htmlFrom, 'utf8')

inline.html({
  fileContent: htmlFromContents,
  scripts: false,
  images: true,
  relativeTo: TEMP,
}, (err, result) => {
  fs.writeFile(htmlTo, result, 'utf8')
})
