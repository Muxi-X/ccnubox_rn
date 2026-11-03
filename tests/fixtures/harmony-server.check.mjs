// Run after starting harmony-server.mjs. Only synthetic loopback data is mutated.
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:18787/api/v1';
const login = await fetch(`${origin}/users/login_ccnu`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ student_id: '1000000000', password: 'harmony-test' }),
});
assert.equal(login.status, 200);
const headers = {
  authorization: `Bearer ${login.headers.get('x-jwt-token')}`,
  'content-type': 'application/json',
};
const call = async (route, method = 'GET', body) => {
  const response = await fetch(origin + route, {
    method,
    headers,
    body: body && JSON.stringify(body),
  });
  assert.equal(response.status, 200);
  return response.json();
};
assert.equal((await fetch(`${origin}/class/get`)).status, 401);
const before = (await call('/class/get')).data.classes.length;
const course = {
  name: 'Fixture CRUD check',
  day: 3,
  dur_class: '5-6',
  weeks: [1, 2],
  semester: '1',
  year: '2026',
  teacher: '測試教師',
  where: '測試教室',
  credit: 2,
};
await call('/class/add', 'POST', course);
const added = (await call('/class/get')).data.classes.find(
  item => item.classname === course.name
);
assert.ok(added?.id);
assert.equal(
  added.id,
  'Class:Fixture CRUD check:2026:1:3:5-6:測試教師:測試教室:3'
);
await call('/class/update', 'PUT', {
  ...course,
  classId: added.id,
  name: 'Updated fixture course',
});
const updated = (await call('/class/get')).data.classes.find(
  item => item.classname === 'Updated fixture course'
);
assert.equal(
  updated.id,
  'Class:Updated fixture course:2026:1:3:5-6:測試教師:測試教室:3'
);
await call('/class/delete', 'POST', {
  id: updated.id,
  year: course.year,
  semester: course.semester,
});
assert.equal((await call('/class/get')).data.classes.length, before);
const result = await call('/grade/getGradeByTerm', 'POST', {
  terms: ['2026-1'],
  kcxzmcs: ['專業必修'],
});
assert.equal(result.data.grades.length, 2);
assert.equal(
  result.data.grades.reduce((sum, item) => sum + item.cj * item.xf, 0) / 5,
  84
);
assert.deepEqual(
  (
    await call('/grade/getGradeByTerm', 'POST', {
      terms: ['2025-1'],
      kcxzmcs: ['專業必修'],
    })
  ).data.grades,
  []
);
console.log('Loopback authentication, course CRUD and grade fixtures passed.');

const multipart = () => {
  const body = new FormData();
  body.append('file_name', 'fixture.png');
  body.append('parent_node', 'fixture-parent');
  body.append('parent_type', 'bitable_image');
  body.append('size', '3');
  body.append('checksum', '38600999');
  body.append('file', new Blob(['abc'], { type: 'image/png' }), 'fixture.png');
  return body;
};
const upload = async body =>
  fetch('http://127.0.0.1:18787/fixture/upload', {
    method: 'POST',
    headers: { authorization: 'Bearer fixture-feishu-token' },
    body,
  });
const invalid = multipart();
invalid.set('checksum', '0');
assert.equal((await upload(invalid)).status, 400);
const uploaded = await upload(multipart());
assert.equal(uploaded.status, 200);
const fileToken = (await uploaded.json()).data.file_token;
const feedback = await fetch(`${origin}/sheet/records`, {
  method: 'POST',
  headers: { ...headers, authorization: 'Bearer fixture-feedback-token' },
  body: JSON.stringify({
    content: 'Fixture multipart check',
    student_id: '1000000000',
    images: [fileToken],
  }),
});
assert.equal(feedback.status, 200);
console.log(
  'Loopback multipart size/checksum, rejection and feedback record fixtures passed.'
);
