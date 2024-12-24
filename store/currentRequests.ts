import { CurrentRequestsType } from '@/store/types';

import { EventBus } from '@/utils';

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
      let currentTotal = this.totalRequestNum;
      setTimeout(() => {
        if (this.totalRequestNum === currentTotal) {
          this.totalRequestNum = this.resolvedRequestNum = 0;
          EventBus.emit('request_complete');
        }
      }, 1000);
    }
  },
};

export default requestBus;
