export enum semesterMap {
  first = 3,
  second = 12,
  third = 16,
}
export const scrapeLogin = (username = '', password = '') => {
  return `
        formData = new URLSearchParams();
        gradeData = new URLSearchParams();
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
      } else {
        
      }
      true; // note: this is required, or you'll sometimes get silent failures
  `;
};

export const scrapeGrade = (year?: number, semester?: semesterMap) => {
  return `
        if(!gradeData) {
          gradeData = new URLSearchParams();
        }
        gradeData.append('queryModel.currentPage', 1);
        gradeData.append('queryModel.showCount', 15);
        gradeData.append('xnm', ${year});
        gradeData.append('xqm', ${semester});
        fetch('https://grd.ccnu.edu.cn/yjsxt/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N305005', {
            method: 'POST',
            body: gradeData
          })
          .then(response => response.json())
          .then((res) => {
            alert(JSON.stringify(res))
            window.ReactNativeWebView.postMessage(JSON.stringify({data: res, type: 'grade'}))
            gradeData = null;
          })
          .catch((err) => {alert(JSON.stringify(err))})
        true;
  `;
};

export const scrapeCourse = (year: number, semester: semesterMap) => {
  return `
    if(!formData) {
     formData = new URLSearchParams();
    }
    formData.append('xnm', ${year}); // 假设year变量已经定义
    formData.append('xqm', ${semester}); // 假设semester变量已经定义
    formData.append('localeKey', 'zh_CN');
    
    fetch('https://grd.ccnu.edu.cn/yjsxt/kbcx/xskbcx_cxXsKb.html?gnmkdm=index', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        }
      })
      .then(response => response.json())
      .then((res) => {
        // 将对象转换为字符串显示
        alert(JSON.stringify(res));
        window.ReactNativeWebView.postMessage(JSON.stringify({data: res, type: 'course'}));
        formData = null;
      })
      .catch(error => {
        alert(JSON.stringify(err));
      })
    true;
    `;
};
