import Mock from "mockjs";
import { Request, Response } from "express";
import { BaseResponseHandler } from "./base-handler";
import { MockRoute } from "../types";

interface SSEItem {
  id?: string | number;
  event?: string;
  data?: any;
  retry?: number;
}

interface SSEData {
  interval?: number;
  items?: SSEItem[];
}

export class SseResponseHandler extends BaseResponseHandler {
  async handle(req: Request, res: Response, route: MockRoute): Promise<void> {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const sendEvent = (item: SSEItem): void => {
      let message = "";
      if (item.id) message += `id: ${item.id}\n`;
      if (item.event) message += `event: ${item.event}\n`;
      if (item.data) {
        const dataStr =
          typeof item.data === "string" ? item.data : JSON.stringify(item.data);
        message += `data: ${dataStr}\n`;
      }
      if (item.retry) message += `retry: ${item.retry}\n`;
      res.write(message + "\n");
    };

    try {
      const mockData = new Function(
        "return (" + route.responseTemplate + ")"
      )() as SSEData;

      if (mockData) {
        const data = Mock.mock(mockData) as SSEData;
        const interval = data.interval || 1000;

        if (Array.isArray(data.items)) {
          let index = 0;
          const sendNext = () => {
            if (index < data.items!.length) {
              sendEvent(data.items![index]);
              index++;
              setTimeout(sendNext, interval);
            } else {
              res.end();
            }
          };
          sendNext();
        } else {
          sendEvent({ data });
          res.end();
        }
      } else {
        sendEvent({ data: Mock.mock(mockData) });
        res.end();
      }
    } catch (e) {
      console.error("[SSE Error]:", e);
      res.write(`data: ${JSON.stringify({ error: "Mock data error" })}\n\n`);
      res.end();
    }

    req.on("close", () => {
      console.log("Client closed SSE connection");
    });
  }
}
