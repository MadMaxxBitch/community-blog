 const { getPendingCodePosts, updateCodeTestResult } = require('./posts');

+const DEFAULT_INTERVAL_MS = 1000;
+const MAX_CODE_LENGTH = 100_000;
+
+const errorMessage = (error) => (
+  error instanceof Error ? error.message : String(error)
+);
+
 const validateCodeSyntax = (codeSnippet) => {
+  if (typeof codeSnippet !== 'string') {
+    return {
+      passed: false,
+      message: 'codeSnippet must be a string',
+    };
+  }
+
+  if (codeSnippet.length > MAX_CODE_LENGTH) {
+    return {
+      passed: false,
+      message: `codeSnippet exceeds the ${MAX_CODE_LENGTH} character limit`,
+    };
+  }
+
   try {
     // Compile only to avoid executing user code.
     // eslint-disable-next-line no-new-func
     new Function(codeSnippet);
     return { passed: true, message: 'syntax valid' };
   } catch (error) {
-    return { passed: false, message: error.message };
+    return { passed: false, message: errorMessage(error) };
   }
 };
 
 const runCodeTestsOnce = (posts, validateCode = validateCodeSyntax) => {
+  if (!Array.isArray(posts)) {
+    throw new TypeError('posts must be an array');
+  }
+
+  if (typeof validateCode !== 'function') {
+    throw new TypeError('validateCode must be a function');
+  }
+
   const pendingPosts = getPendingCodePosts(posts);
+
   return pendingPosts.reduce((nextPosts, post) => {
-    const result = validateCode(post.codeSnippet);
+    let result;
+
+    try {
+      result = validateCode(post.codeSnippet);
+    } catch (error) {
+      result = {
+        passed: false,
+        message: errorMessage(error),
+      };
+    }
+
     return updateCodeTestResult(nextPosts, post.id, result);
   }, posts);
 };
 
-const createBackgroundCodeTester = ({ getPosts, setPosts, validateCode = validateCodeSyntax, intervalMs = 1000 }) => {
+const createBackgroundCodeTester = ({
+  getPosts,
+  setPosts,
+  validateCode = validateCodeSyntax,
+  intervalMs = DEFAULT_INTERVAL_MS,
+  onError = () => {},
+}) => {
+  if (typeof getPosts !== 'function') {
+    throw new TypeError('getPosts must be a function');
+  }
+
+  if (typeof setPosts !== 'function') {
+    throw new TypeError('setPosts must be a function');
+  }
+
+  if (typeof onError !== 'function') {
+    throw new TypeError('onError must be a function');
+  }
+
+  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
+    throw new RangeError('intervalMs must be a positive number');
+  }
+
   let timer = null;
+  let running = false;
 
   const tick = () => {
+    if (running) return;
+
+    running = true;
+
     try {
       const updatedPosts = runCodeTestsOnce(getPosts(), validateCode);
       setPosts(updatedPosts);
-    } catch (_error) {
-      // Keep background processing alive for subsequent runs.
+    } catch (error) {
+      onError(error);
+    } finally {
+      running = false;
     }
   };
 
   return {
     start: () => {
-      if (timer) return;
+      if (timer !== null) return;
+
       timer = setInterval(tick, intervalMs);
-      timer.unref();
+
+      // Available on Node.js timers, but not in browsers or all test mocks.
+      if (typeof timer.unref === 'function') {
+        timer.unref();
+      }
     },
+
     stop: () => {
-      if (!timer) return;
+      if (timer === null) return;
+
       clearInterval(timer);
       timer = null;
     },
+
     runNow: tick,
   };
 };
  validateCodeSyntax,
};
