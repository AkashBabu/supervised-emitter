const { join } = require('path');
const fs = require('fs');

module.exports = function Reporter(stream, metrics) {
  const report = require('./report.json');

  const version = require('../package.json').version;

  if(!report.data[version]) {
    report.data[version] = {
      data: []
    }
  }
  report.data[version].data.push(metrics);

  const dest = join(__dirname, './report.json');
  fs.writeFileSync(dest, JSON.stringify(report, null, 2));
};
