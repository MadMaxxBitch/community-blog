const { getPendingCodePosts, updateCodeTestResult } = require('./posts');

const validateCodeSyntax = (codeSnippet) => {
  try {
    // Compile only to avoid executing user code.
    // eslint-disable-next-line no-new-func
    new Function(codeSnippet);
    return { passed: true, message: 'syntax valid' };
  } catch (error) {
    return { passed: false, message: error.message };
  }
};

const runCodeTestsOnce = (posts, validateCode = validateCodeSyntax) => {
  const pendingPosts = getPendingCodePosts(posts);
  return pendingPosts.reduce((nextPosts, post) => {
    const result = validateCode(post.codeSnippet);
    return updateCodeTestResult(nextPosts, post.id, result);
  }, posts);
};

const createBackgroundCodeTester = ({ getPosts, setPosts, validateCode = validateCodeSyntax, intervalMs = 1000 }) => {
  let timer = null;

  const tick = () => {
    const updatedPosts = runCodeTestsOnce(getPosts(), validateCode);
    setPosts(updatedPosts);
  };

  return {
    start: () => {
      if (timer) return;
      timer = setInterval(tick, intervalMs);
    },
    stop: () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    },
    runNow: tick,
  };
};

module.exports = {
  createBackgroundCodeTester,
  runCodeTestsOnce,
  validateCodeSyntax,
};
