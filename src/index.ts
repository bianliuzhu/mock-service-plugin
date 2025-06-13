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

import { startServer } from "./server.js";

interface PluginOptions {
  path: string;
  port?: number;
}

/**
 * @class mockServicePlugin
 *
 * @param {Object} param data that plugin needs
 */
class MockServicePlugin {
  private path: string;
  private port: number;

  constructor({ path, port = 3000 }: PluginOptions) {
    this.path = path;
    this.port = port;
  }

  apply(): void {
    startServer({ path: this.path, port: this.port });
  }
}

export default MockServicePlugin;
