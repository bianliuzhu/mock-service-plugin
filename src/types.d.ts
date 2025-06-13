export interface MockRoute {
  filepath: string;
  fileName: string;
  fileExt: string;
  routeKey: string;
  method: string;
  path: string;
  query?: string;
  restfulTemplateUrl: string;
  describe: string;
  contentType: string;
  responseTemplate: string;
}

declare global {
  interface MockRoute {
    filepath: string;
    fileName: string;
    fileExt: string;
    routeKey: string;
    method: string;
    path: string;
    query?: string;
    restfulTemplateUrl: string;
    describe: string;
    contentType: string;
    responseTemplate: string;
  }
}

export {};
