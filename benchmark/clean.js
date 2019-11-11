const version = require('../package.json').version
const report = require('./report.json')

report.data[version] = {
  data: []
}

require('fs')
  .writeFileSync(
    require('path').join(__dirname, './report.json'),
    JSON.stringify(report, null, 2),
  );
