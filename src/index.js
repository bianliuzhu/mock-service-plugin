/**
 * @file plugin entry point
 * @author Soon
 */

const server = require('./server.js')

/**
 * @class mockplugin
 *
 * @param {Object} param data that plugin needs
 */

class mockplugin {
  constructor ({ path, port = 3000 }) {
    console.log(path, port)
    this.path = path
    this.port = port
  }

  apply (compiler) {
    compiler.hooks.emit.tap('mockplugin', () => {
      server({ path: this.path, port: this.port })
    })
  }
}
module.exports = mockplugin
