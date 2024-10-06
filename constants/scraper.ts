export enum semesterMap {
  first = 3,
  second = 12,
  third = 16,
}
export const scrapeLogin = (username = '', password = '') => {
  return `
        (() => {
          if (location.href.includes('login')) {
            const usernameInput = document.getElementById('yhm')
            const passwordInput = document.getElementById('mm')
            const hidePasswordInput = document.getElementById('hidMm')
            const loginButton = document.getElementById('dl')
            usernameInput.value = '${username}'
            passwordInput.value = hidePasswordInput.value = '${password}'
            setTimeout(() => {
              loginButton.click();
            }, 1000)
          }
        })()
      true; // note: this is required, or you'll sometimes get silent failures
  `;
};
const retry = (MAX_RETRIES: number) => `
((MAX_RETRIES) => {
  let tried_times = 0;
  const MAX_RETRIES = ${MAX_RETRIES}
  return () => {
    if(tried_times < MAX_RETRIES) {
      location.reload()
      ${scrapeLogin()}
      tried_times++;
      return;
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({data: {_errMsg: '超出最大请求次数'}, type: 'course'}));
  }
})(${MAX_RETRIES})
`;
export const scrapeGrade = (year?: number, semester?: semesterMap) => {
  return `
        (
         (year, semester) => {
          const gradeData = new URLSearchParams();
          gradeData.append('queryModel.currentPage', 1);
          gradeData.append('queryModel.showCount', 15);
          gradeData.append('xnm', year);
          gradeData.append('xqm', semester);
          fetch('https://grd.ccnu.edu.cn/yjsxt/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N305005', {
              method: 'POST',
              body: gradeData
            })
            .then(response => {
              if (!response.ok) {
                location.reload();
                return;
              }
              return response.json();
            })
            .then((res) => {
              window.ReactNativeWebView.postMessage(JSON.stringify({data: res, type: 'grade'}))
              gradeData = null;
            })
         }
        )(${year},${semester})
        true;
  `;
};

export const scrapeCourse = (year: number, semester: semesterMap) => {
  return `
    (
      (year, semester) => {
        const formData = new URLSearchParams();
        formData.append('xnm', year); // 假设year变量已经定义
        formData.append('xqm', semester); // 假设semester变量已经定义
        formData.append('localeKey', 'zh_CN');
        
        fetch('https://grd.ccnu.edu.cn/yjsxt/kbcx/xskbcx_cxXsKb.html?gnmkdm=index', {
            method: 'POST',
            body: formData,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            }
          })
          .then(response => {
              if (!response.ok) {
                location.reload();
                return;
              }
              return response.json();
          })
          .then((res) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({data: res, type: 'course'}));
            formData = null;
          })
          
      }
    )(${year},${semester})
    true;
    `;
};
