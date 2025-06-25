#!/usr/bin/env node
import { startServer } from "./src/server";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

startServer({
  port: 3000,
  mockDir: path.join(__dirname, "mocks"),
});
