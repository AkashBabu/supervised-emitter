require('fs')
  .writeFileSync(
    require('path').join(__dirname, './report.json'),
    JSON.stringify({ data: [] }, null, 2),
  );
