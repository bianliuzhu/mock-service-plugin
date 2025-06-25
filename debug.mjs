import { startServer } from "./lib/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

startServer({
  mockDir: path.join(__dirname, "mocks"),
  port: 3720,
});
