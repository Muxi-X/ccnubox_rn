import { createServer } from 'miragejs';

import { mockConfig } from '@/mocks/config';

export const setupMockServer = () => {
  if (typeof window !== 'undefined' && window.mockServer) {
    window.mockServer.shutdown();
  }

  window.mockServer = createServer({
    routes() {
      this.urlPrefix = mockConfig.urlPrefix;
      mockConfig.routes.forEach(({ method, path, handler }) => {
        this[method](path, handler);
      });
    },
  });
};

if (module.hot) {
  module.hot.accept(() => {
    setupMockServer();
  });
}
