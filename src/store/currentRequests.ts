import { CurrentRequestsType } from '@/store/types';

import globalEventBus from '@/utils/eventBus';

/** 当前所有请求监听 */
const requestBus: CurrentRequestsType = {
  totalRequestNum: 0,
  resolvedRequestNum: 0,
  requestRegister() {
    this.totalRequestNum++;
  },
  requestComplete() {
    this.resolvedRequestNum++;
    if (this.resolvedRequestNum === this.totalRequestNum) {
      const currentTotal = this.totalRequestNum;
      setTimeout(() => {
        if (this.totalRequestNum === currentTotal) {
          this.totalRequestNum = this.resolvedRequestNum = 0;
          globalEventBus.emit('request_complete');
        }
      }, 1000);
    }
  },
};

export default requestBus;
