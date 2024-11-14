/*
 * @Description: mock service plugin
 * @Author: Gleason
 * @Date: 2021-04-11 14:26:23
 * @LastEditors: Gleason
 * @LastEditTime: 2022-03-20 00:11:27
 */
/**
 * @file plugin entry point
 * @author gleason
 */

const server = require("./server.js");

/**
 * @class mockServicePlugin
 *
 * @param {Object} param data that plugin needs
 */

class mockServicePlugin {
  constructor({ path, port = 3000 }) {
    this.path = path;
    this.port = port;
  }

  apply() {
    server({ path: this.path, port: this.port });
  }
}
module.exports = mockServicePlugin;
