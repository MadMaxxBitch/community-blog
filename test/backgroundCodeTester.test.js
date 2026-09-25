const test = require('node:test');
const assert = require('node:assert/strict');
const { addPost } = require('../src/posts');
const { runCodeTestsOnce } = require('../src/backgroundCodeTester');

test('runCodeTestsOnce updates pending posts with pass/fail status', () => {
  const [postsAfterFirst] = addPost([], {
    title: 'Valid code',
    content: 'This should pass',
    codeSnippet: 'const sum = (a, b) => a + b;'
  });

  const [postsAfterSecond] = addPost(postsAfterFirst, {
    title: 'Invalid code',
    content: 'This should fail',
    codeSnippet: 'const broken = ( => ;'
  });

  const updated = runCodeTestsOnce(postsAfterSecond);
  assert.equal(updated[0].codeTestStatus, 'passed');
  assert.equal(updated[1].codeTestStatus, 'failed');
});
