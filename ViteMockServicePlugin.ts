import MockServicePlugin from "mock-service-plugin";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isPortTaken(port: number) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err: { code: string }) => {
      if (err.code === "EADDRINUSE") {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

export default function ViteMockServicePlugin(e: string) {
  return {
    name: "ViteMockServicePlugin",
    buildStart() {
      (async () => {
        const port = 3008;
        const portTaken = await isPortTaken(port);
        if (portTaken) {
          console.log(`Port ${port} is already in use`);
        } else {
          if (e === "mock") {
            const ints = new MockServicePlugin({
              path: path.join(__dirname, "./mocks"),
              port: 3008,
            });
            ints.apply();
          }
        }
      })();
    },
  };
}
