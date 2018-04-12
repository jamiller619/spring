const path = require('path')
const fs = require('fs-extra')
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
