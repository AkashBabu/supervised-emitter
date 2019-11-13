const path = require('path')
module.exports = {
  "name": "Supervised-Emitter",
  "mode": "file",
  "out": "gitbook/apidocs",
  "excludePrivate": true,
  "excludeProtected": true,
  "readme": "none",
  "exclude": [
    "./src/dll.ts",
    "./src/pattern.ts",
    "./src/internalEvents.ts",
    "./src/errors.ts",
    "./src/logger.ts",
    "./src/threadRunner.ts",
    "./src/utils.ts",
  ],
  "src": [
    "./src"
  ]
}