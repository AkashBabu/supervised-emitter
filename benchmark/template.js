const fs = require('fs');
const path = require('path');
const reportData = require('./report.json');

const Template = metrics => `
Name            |  Avg (ms)     |   Min (ms)      |   Max (ms)
:---------------|:--------------|:----------------|:-------------
${metrics.map(p => ({
    ...p,
    min : round(p.min),
    max : round(p.max),
    avg : round(p.avg),
  })).map(parameter => `${parameter.label}  |  ${parameter.avg}  |  ${parameter.min}  |  ${parameter.max}  `).join('\n')}
`;


function round(num) {
  return parseFloat(num / 1000000).toFixed(2);
}

(() => {
  const filePath = path.join(__dirname, '../BENCHMARK.md');

  const ws = fs.createWriteStream(filePath);
  ws.write('# Benchmark report for Supervised-Emitter \r\n\r\n');

  const template = Template(reportData.data.reduce((acc, m) => acc.concat(m), []));
  ws.write(template);
  ws.write('\r\n\r\n');

  ws.end();
})();
