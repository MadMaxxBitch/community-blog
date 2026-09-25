const test = require('node:test');
const assert = require('node:assert/strict');
const { addPost } = require('../src/posts');
const { createBackgroundCodeTester, runCodeTestsOnce } = require('../src/backgroundCodeTester');

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

test('background tester keeps running when validator throws', () => {
  let posts = [{
    id: '1',
    title: 'P',
    content: 'C',
    codeSnippet: 'const a = 1;',
    codeTestStatus: 'pending',
  }];

  const tester = createBackgroundCodeTester({
    getPosts: () => posts,
    setPosts: (next) => {
      posts = next;
    },
    validateCode: () => {
      throw new Error('validator failed');
    },
  });

  assert.doesNotThrow(() => tester.runNow());
  assert.equal(posts[0].codeTestStatus, 'pending');
});
