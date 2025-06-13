import { JsonResponseHandler } from "./json-handler.js";
import { SseResponseHandler } from "./sse-handler.js";
import { TextResponseHandler } from "./text-handler.js";
import { XmlResponseHandler } from "./xml-handler.js";
import { CsvResponseHandler } from "./csv-handler.js";
import { ImageResponseHandler } from "./image-handler.js";
import { CONTENT_TYPES } from "../constant.js";
import { BaseResponseHandler } from "./base-handler.js";

const CONTENT_TYPE_HANDLERS: Record<string, new () => BaseResponseHandler> = {
  "application/json": JsonResponseHandler,
  "text/event-stream": SseResponseHandler,
  "text/plain": TextResponseHandler,
  "text/html": TextResponseHandler,
  "text/markdown": TextResponseHandler,
  "text/css": TextResponseHandler,
  "application/javascript": TextResponseHandler,
  "application/xml": XmlResponseHandler,
  "text/csv": CsvResponseHandler,
  "image/png": ImageResponseHandler,
  "image/jpeg": ImageResponseHandler,
  "image/gif": ImageResponseHandler,
  "image/svg+xml": ImageResponseHandler,
  // 可以在这里添加更多处理器
};

export class ResponseHandlerFactory {
  static getHandler(contentType: string): BaseResponseHandler {
    const HandlerClass = CONTENT_TYPE_HANDLERS[contentType];
    if (!HandlerClass) {
      throw new Error(`No handler found for content type: ${contentType}`);
    }
    return new HandlerClass();
  }

  static getContentTypeByExtension(extension: string): string {
    return CONTENT_TYPES[extension.toLowerCase()] || "application/json";
  }
}
