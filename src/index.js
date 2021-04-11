/**
 * @file plugin entry point
 * @author Soon
 */

const server = require('./server.js')

/**
 * @class MockjsWebpackPlugin
 *
 * @param {Object} param data that plugin needs
 */

class MockjsWebpackPlugin {
  constructor ({ path, port = 3000 }) {
    console.log(path, port)
    this.path = path
    this.port = port
  }

  apply (compiler) {
    compiler.hooks.emit.tap('MockjsWebpackPlugin', () => {
      server({ path: this.path, port: this.port })
    })
  }
}
module.exports = MockjsWebpackPlugin
