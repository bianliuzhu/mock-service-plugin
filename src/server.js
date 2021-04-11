const express = require('express')
const watch = require('watch')
const {
  cleanCache
} = require('./util')

const ROUTE_PATH = './routes.js'
let {
  mock
} = require(ROUTE_PATH)

module.exports = function ({
  path,
  port = 3000
}) {
  const mockPort = port || 3000
  const app = express()

  app.use('/', mock(path))

  watch.watchTree(path, () => {
    cleanCache(require.resolve(ROUTE_PATH))
    try {
      mock = require(ROUTE_PATH)
      console.info('模块更新成功')
    } catch (error) {
      console.error('模拟模块更新失败，请重新启动应用程序。 %s', error)
    }
  })

  var server = app.listen(mockPort, function () {
    const host = server.address().address
    const port = server.address().port
    console.log('Mock server listening at http://%s:%s', host, port)
  })
}
