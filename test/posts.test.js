const test = require('node:test');
const assert = require('node:assert/strict');
const { addPost, getPendingCodePosts, getPostById } = require('../src/posts');

test('addPost creates a post and marks code snippet as pending', () => {
  const now = () => '2026-09-25T00:00:00.000Z';
  const [posts, post] = addPost([], {
    title: 'Functional patterns',
    content: 'Favor pure functions',
    codeSnippet: 'const plusOne = (x) => x + 1;'
  }, now);

  assert.equal(posts.length, 1);
  assert.equal(post.id, '1');
  assert.equal(post.codeTestStatus, 'pending');
  assert.equal(post.createdAt, now());
  assert.equal(getPendingCodePosts(posts).length, 1);
  assert.equal(getPostById(posts, '1').title, 'Functional patterns');
});

test('addPost throws when required fields are missing', () => {
  assert.throws(() => addPost([], { title: 'Missing content' }), /title and content are required/);
});

test('addPost derives next id from max existing id', () => {
  const [posts] = addPost([{ id: '4', title: 'A', content: 'B' }], {
    title: 'Next',
    content: 'Post',
  });

  assert.equal(posts[1].id, '5');
});
