const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/server');

test('server allows publishing and reading posts', async () => {
  const app = createApp();
  const port = await app.start(0);

  try {
    const createResponse = await fetch(`http://127.0.0.1:${port}/posts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'My first post',
        content: 'Hello community!',
        codeSnippet: 'const n = 1;'
      })
    });

    assert.equal(createResponse.status, 201);
    const createdPayload = await createResponse.json();
    assert.equal(createdPayload.post.title, 'My first post');
    const createdPostId = createdPayload.post.id;

    const getResponse = await fetch(`http://127.0.0.1:${port}/posts/${createdPostId}`);
    assert.equal(getResponse.status, 200);
    const getPayload = await getResponse.json();
    assert.equal(getPayload.post.id, createdPostId);

    app.runCodeTestsNow();

    const listResponse = await fetch(`http://127.0.0.1:${port}/posts`);
    assert.equal(listResponse.status, 200);

    const listPayload = await listResponse.json();
    assert.equal(listPayload.posts.length, 1);
    assert.equal(listPayload.posts[0].codeTestStatus, 'passed');
  } finally {
    await app.stop();
  }
});

test('server returns 400 for malformed JSON payloads', async () => {
  const app = createApp();
  const port = await app.start(0);

  try {
    const response = await fetch(`http://127.0.0.1:${port}/posts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"title":"bad json",',
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.error, 'invalid JSON body');
  } finally {
    await app.stop();
  }
});

test('server returns 500 for unexpected post creation errors', async () => {
  const app = createApp({
    now: () => {
      throw new Error('clock failed');
    },
  });
  const port = await app.start(0);

  try {
    const response = await fetch(`http://127.0.0.1:${port}/posts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'T', content: 'C' }),
    });

    assert.equal(response.status, 500);
    const payload = await response.json();
    assert.equal(payload.error, 'internal server error');
  } finally {
    await app.stop();
  }
});

test('server returns 400 for oversized request payloads', async () => {
  const app = createApp();
  const port = await app.start(0);

  try {
    const tooLargeContent = 'x'.repeat(1_000_001);
    const response = await fetch(`http://127.0.0.1:${port}/posts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Large',
        content: tooLargeContent,
      }),
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.error, 'request body too large');
  } finally {
    await app.stop();
  }
});
