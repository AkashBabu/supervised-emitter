const ejs = require('ejs');
const fs = require('fs');
const path = require('path')
 
fs.readFile(path.resolve(__dirname, '../gitbook/API_SUMMARY.md'), 'utf8', (err, content) => {
  if(err) throw new Error(err);

  const templateFn = ejs.compile(
    fs.readFileSync(path.resolve(__dirname, '../gitbook/SUMMARY.ejs'), 'utf8')
    )

  const compiled = templateFn({
    apidocs: getContent(content)
  })

  fs.writeFileSync(path.resolve(__dirname, '../gitbook/SUMMARY.md'), compiled, {encoding: 'utf8'})
})

function getContent(content) {
  return content.split('\n').slice(2).map(line => {
    return `\t${line.replace('gitbook/', '')}`
  }).join('\n')
}