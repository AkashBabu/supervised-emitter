const path = require('path')
module.exports = {
  "name": "Supervised-Emitter",
  "mode": "file",
  "out": "gitbook/apidocs",
  "excludePrivate": true,
  "excludeProtected": true,
  "readme": "none",
  "exclude": [
    "./src/pattern.ts",
    "./src/errors.ts",
    "./src/lib/logger.ts",
    "./src/lib/taskQueue.ts",
    "./src/lib/pipe.ts",
  ],
  "src": [
    "./src"
  ]
}