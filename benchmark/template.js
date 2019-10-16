const fs = require('fs');
const path = require('path');
const reportData = require('./report.json');

const Template = metrics => `
# Benchmark report for Supervised-Emitter

**Environment**
Node: 10.1.1  
Machine: Mac Book Pro, 16GB RAM  
OS: Mojave  

**Stats**

Name            |  Avg (ms)     |   Min (ms)      |   Max (ms)
:---------------|:--------------|:----------------|:-------------
${metrics.map(p => ({
  ...p,
  min: round(p.min),
  max: round(p.max),
  avg: round(p.avg),
})).map(parameter => `${parameter.label}  |  ${parameter.avg}  |  ${parameter.min}  |  ${parameter.max}  `).join('\n')}
`;


function round(num) {
  return parseFloat(num / 1000000).toFixed(2);
}

(() => {
  const filePath = path.join(__dirname, '../BENCHMARK.md');

  const ws = fs.createWriteStream(filePath);
  ws.write('');

  const template = Template(reportData.data.reduce((acc, m) => acc.concat(m), []));
  ws.write(template);
  ws.write('\r\n\r\n');

  ws.end();
})();
