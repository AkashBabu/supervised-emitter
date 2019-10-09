const { join } = require('path');
const fs = require('fs');

module.exports = function Reporter(stream, metrics) {
  const report = require('./report.json');

  report.data = report.data || [];
  report.data.push(metrics);

  const dest = join(__dirname, './report.json');
  fs.writeFileSync(dest, JSON.stringify(report, null, 2));
};
