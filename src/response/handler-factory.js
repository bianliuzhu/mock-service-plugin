const JsonResponseHandler = require("./json-handler");
const SseResponseHandler = require("./sse-handler");
const TextResponseHandler = require("./text-handler");
const XmlResponseHandler = require("./xml-handler");
const CsvResponseHandler = require("./csv-handler");
const ImageResponseHandler = require("./image-handler");
const { CONTENT_TYPES } = require("../constant");

const CONTENT_TYPE_HANDLERS = {
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

class ResponseHandlerFactory {
  static getHandler(contentType) {
    const HandlerClass = CONTENT_TYPE_HANDLERS[contentType];
    if (!HandlerClass) {
      throw new Error(`No handler found for content type: ${contentType}`);
    }
    return new HandlerClass();
  }

  static getContentTypeByExtension(extension) {
    return CONTENT_TYPES[extension.toLowerCase()] || "application/json";
  }
}

module.exports = ResponseHandlerFactory;
