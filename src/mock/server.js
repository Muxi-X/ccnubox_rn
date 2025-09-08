import { createServer } from 'miragejs';

import { mockConfig } from './config';

export const setupMockServer = () => {
  if (typeof window !== 'undefined' && window.mockServer) {
    window.mockServer.shutdown();
  }

  window.mockServer = createServer({
    routes() {
      const NativeXMLHttpRequest = window.XMLHttpRequest;
      window.XMLHttpRequest = function XMLHttpRequest() {
        const request = new NativeXMLHttpRequest();
        delete request.onloadend;
        return request;
      };

      this.urlPrefix = mockConfig.urlPrefix;
      this.passthrough('http://116.62.179.155:8080/**');
      this.passthrough('https://open.feishu.cn/**');
      mockConfig.routes.forEach(({ method, path, handler }) => {
        this[method](path, handler);
      });

      this.passthrough();
    },
  });
};

if (module.hot) {
  module.hot.accept(() => {
    setupMockServer();
  });
}
