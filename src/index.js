/**
 * @file plugin entry point
 * @author gleason
 */

const server = require("./server.js");

/**
 * @class mockplugin
 *
 * @param {Object} param data that plugin needs
 */

class mockplugin {
  constructor({ path, port = 3000 }) {
    this.path = path;
    this.port = port;
  }

  apply(compiler) {
    server({ path: this.path, port: this.port });
    // compiler.hooks.emit.tap("mockplugin", () => {});
  }
}
module.exports = mockplugin;
