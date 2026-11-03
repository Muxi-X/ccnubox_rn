// Local simulator fixtures, never a production backend or authentication bypass.
// Run: node tests/fixtures/harmony-server.mjs
// Forward: hdc rport tcp:18787 tcp:18787
// Bundle with EXPO_PUBLIC_API_URL=http://127.0.0.1:18787/api/v1

import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const origin = 'http://127.0.0.1:18787';
const feedbackState = { uploads: [], records: [] };
const semester = {
  semester: '2026-1',
  start_date: '2026-08-31',
  end_date: '2027-01-25',
};
const course = {
  id: 'simulator-course',
  classname: 'Harmony 模擬器測試課程',
  teacher: '測試教師',
  where: '測試教室 101',
  day: 1,
  class_when: '3-4',
  weeks: Array.from({ length: 20 }, (_, i) => i + 1),
  week_duration: '1-20周',
  credit: 2,
  year: '2026',
  semester: '1',
  is_official: false,
};
const feed = {
  id: 1,
  type: 'muxi',
  title: 'Harmony 模擬器通知',
  content: '本機測試資料，非正式推播。',
  // Emulator clocks can lag the host during native builds; avoid a future-dated fixture.
  created_at: Math.floor(Date.now() / 1000) - 3600,
  read: false,
  url: `${origin}/webview`,
};
const grades = [90, 80].map((score, index) => ({
  Kclbmc: '專業課',
  kcbj: '主修',
  kcmc: `模擬器成績 ${index + 1}`,
  kcxzmc: '專業必修',
  xf: index + 2,
  cj: score,
  jd: index ? 3 : 4,
  regularGrade: score,
  finalGrade: score,
  regularGradePercent: '30%',
  finalGradePercent: '70%',
  xnm: 2026,
  xqm: 1,
}));
// One-page, ASCII-only PDF with calculated byte offsets; no external fixture download.
const stream = 'BT /F1 24 Tf 72 720 Td (Harmony Simulator PDF) Tj ET';
const pdfObjects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
];
let pdf = '%PDF-1.4\n';
const offsets = [0];
for (const [index, object] of pdfObjects.entries()) {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
}
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
  .slice(1)
  .map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`)
  .join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
const routes = {
  '/semester/getSemester': semester,
  '/semester/getSemesterList': [semester],
  '/class/get': {
    classes: [course, { ...course, id: 'simulator-tuesday', day: 2 }],
    last_refresh_time: Math.floor(Date.now() / 1000),
  },
  '/banner/getBanners': {
    banners: [
      {
        id: 1,
        picture_link: `${origin}/image.png`,
        web_link: `${origin}/webview`,
      },
    ],
  },
  '/website/getWebsites': {
    websites: [
      {
        id: 1,
        name: '本機 WebView 測試',
        description: '隔離測試頁',
        image: `${origin}/image.png`,
        link: `${origin}/webview`,
      },
    ],
  },
  '/feed/getFeedEvents': { feed_events: [feed] },
  '/grade/getGradeType': { kcxzmc: ['專業必修'] },
  '/grade/getGradeScore': {
    type_of_grade_scores: [{ kcxzmc: '專業必修', grade_score_list: grades }],
  },
};

createServer(async (req, res) => {
  const url = new URL(req.url, origin);
  const route = url.pathname.replace(/^\/api\/v1/, '');
  console.log(req.method, url.pathname);
  const json = (status, data, headers = {}) => {
    res.writeHead(status, { 'content-type': 'application/json', ...headers });
    res.end(JSON.stringify(data));
  };
  if (req.method === 'GET' && route === '/fixture/feedback-state') {
    json(200, feedbackState);
    return;
  }
  if (req.method === 'POST' && route === '/fixture/upload') {
    if (req.headers.authorization !== 'Bearer fixture-feishu-token') {
      json(401, { code: 1 });
      return;
    }
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 8 * 1024 * 1024) throw new Error('Fixture upload too large');
        chunks.push(chunk);
      }
      const form = await new Request(url, {
        method: 'POST',
        headers: req.headers,
        body: Buffer.concat(chunks),
      }).formData();
      const file = form.get('file');
      if (!(file instanceof File)) throw new Error('Missing file');
      const bytes = new Uint8Array(await file.arrayBuffer());
      let a = 1;
      let b = 0;
      for (const byte of bytes) {
        a = (a + byte) % 65521;
        b = (b + a) % 65521;
      }
      const checksum = String(((b << 16) | a) >>> 0);
      if (
        form.get('size') !== String(file.size) ||
        form.get('checksum') !== checksum ||
        form.get('parent_node') !== 'fixture-parent' ||
        form.get('parent_type') !== 'bitable_image'
      ) {
        throw new Error('Invalid multipart contract');
      }
      const file_token = `fixture-file-${feedbackState.uploads.length + 1}`;
      feedbackState.uploads.push({
        file_token,
        size: file.size,
        checksum,
        name: file.name,
        type: file.type,
      });
      json(200, { code: 0, data: { file_token } });
    } catch (error) {
      console.log('Fixture upload rejected:', error.message);
      json(400, { code: 1, msg: 'Invalid fixture multipart upload' });
    }
    return;
  }
  if (req.method === 'GET' && route === '/image.png') {
    res.writeHead(200, { 'content-type': 'image/png' });
    res.end(
      readFileSync(
        new URL('../../src/assets/images/mx-logo.png', import.meta.url)
      )
    );
    return;
  }
  if (req.method === 'GET' && route === '/webview') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Harmony WebView</title><h1>本機 WebView 測試</h1><button onclick="this.textContent=\'互動成功\'">測試互動</button>'
    );
    return;
  }
  if (req.method === 'GET' && route === '/calendar/getCalendars') {
    json(200, {
      code: 0,
      data: { calendars: [{ year: 2026, link: `${origin}/document.pdf` }] },
    });
    return;
  }
  if (req.method === 'GET' && route === '/document.pdf') {
    res.writeHead(200, { 'content-type': 'application/pdf' });
    res.end(pdf);
    return;
  }
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 8192) throw new Error('Fixture request too large');
    }
    const payload = body ? JSON.parse(body) : {};
    if (
      req.method === 'POST' &&
      ['/auth/tenant/token', '/auth/table-config/token'].includes(route)
    ) {
      json(200, {
        code: 0,
        data: {
          access_token:
            route === '/auth/tenant/token'
              ? 'fixture-feishu-token'
              : 'fixture-feedback-token',
        },
      });
      return;
    }
    if (req.method === 'POST' && route === '/sheet/records') {
      if (req.headers.authorization !== 'Bearer fixture-feedback-token') {
        json(401, { code: 1 });
      } else if (
        !payload.content ||
        payload.student_id !== '1000000000' ||
        !Array.isArray(payload.images) ||
        payload.images.some(
          token =>
            !feedbackState.uploads.some(upload => upload.file_token === token)
        )
      ) {
        json(400, { code: 1, msg: 'Invalid fixture feedback' });
      } else {
        feedbackState.records.push(payload);
        json(200, {
          code: 0,
          data: { record_id: `fixture-record-${feedbackState.records.length}` },
        });
      }
      return;
    }
    if (route === '/users/login_ccnu' && req.method === 'POST') {
      const valid =
        payload.student_id === '1000000000' &&
        payload.password === 'harmony-test';
      json(
        valid ? 200 : 401,
        { code: valid ? 0 : 1 },
        valid
          ? {
              'x-jwt-token': 'simulator-only-short',
              'x-refresh-token': 'simulator-only-long',
            }
          : {}
      );
    } else if (req.headers.authorization !== 'Bearer simulator-only-short') {
      json(401, { code: 1, msg: 'Use the isolated simulator test login' });
    } else if (req.method === 'GET' && Object.hasOwn(routes, route)) {
      json(200, { code: 0, data: routes[route] });
    } else if (
      (req.method === 'POST' && route === '/class/add') ||
      (req.method === 'PUT' && route === '/class/update')
    ) {
      if (
        !payload.name ||
        !payload.dur_class ||
        !payload.year ||
        !payload.semester ||
        !Number.isInteger(payload.day) ||
        !Array.isArray(payload.weeks)
      ) {
        json(400, { code: 1, msg: 'Invalid course fixture' });
        return;
      }
      const classes = routes['/class/get'].classes;
      const index = classes.findIndex(item => item.id === payload.classId);
      if (route === '/class/update' && index < 0) {
        json(404, { code: 1, msg: 'Unknown fixture course' });
        return;
      }
      const item = {
        ...course,
        ...payload,
        id: [
          'Class',
          payload.name,
          payload.year,
          payload.semester,
          payload.day,
          payload.dur_class,
          payload.teacher ?? '',
          payload.where ?? '',
          payload.weeks.reduce((mask, week) => mask | (1 << (week - 1)), 0),
        ].join(':'),
        classname: payload.name,
        class_when: payload.dur_class,
        week_duration: `${Math.min(...payload.weeks)}-${Math.max(...payload.weeks)}周`,
      };
      if (index < 0) classes.push(item);
      else classes[index] = item;
      json(200, { code: 0 });
    } else if (req.method === 'POST' && route === '/class/delete') {
      const classes = routes['/class/get'].classes;
      const index = classes.findIndex(
        item =>
          item.id === payload.id &&
          item.year === payload.year &&
          item.semester === payload.semester
      );
      if (index < 0) json(404, { code: 1, msg: 'Unknown fixture course' });
      else {
        classes.splice(index, 1);
        json(200, { code: 0 });
      }
    } else if (req.method === 'POST' && route === '/grade/getGradeByTerm') {
      if (!Array.isArray(payload.terms) || !Array.isArray(payload.kcxzmcs)) {
        json(400, { code: 1, msg: 'Invalid grade filters' });
        return;
      }
      json(200, {
        code: 0,
        data: {
          grades: grades.filter(
            item =>
              payload.terms.includes(`${item.xnm}-${item.xqm}`) &&
              payload.kcxzmcs.includes(item.kcxzmc)
          ),
        },
      });
    } else if (
      req.method === 'POST' &&
      route === '/feed/readFeedEvent' &&
      payload.feed_id === feed.id
    ) {
      feed.read = true;
      json(200, { code: 0 });
    } else if (
      req.method === 'POST' &&
      route === '/feed/clearFeedEvent' &&
      payload.feed_id === feed.id
    ) {
      routes['/feed/getFeedEvents'].feed_events = [];
      json(200, { code: 0 });
    } else if (req.method === 'GET' && route === '/users/logout') {
      json(200, { code: 0 });
    } else {
      json(404, { code: 1, msg: `No fixture for ${req.method} ${route}` });
    }
  } catch {
    json(400, { code: 1, msg: 'Invalid fixture request' });
  }
}).listen(18787, '127.0.0.1', () => {
  console.log(
    `Simulator fixture backend: ${origin}; login 1000000000 / harmony-test`
  );
});
