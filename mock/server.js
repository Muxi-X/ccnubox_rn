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
