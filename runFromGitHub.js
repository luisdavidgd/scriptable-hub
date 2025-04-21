/**
 * Run a script from GitHub.
 * 
 * @param {Object} options
 * @param {string} options.user - GitHub username
 * @param {string} options.repo - Repository name
 * @param {string} options.branch - Branch name (e.g., 'main')
 * @param {string} options.path - Path to script file (e.g., 'scripts/helloWorld.js')
 * @param {boolean} [options.debug] - Show logs
 */
async function runFromGitHub({ user, repo, branch, path, debug = false }) {
  try {
    const timestamp = Date.now();
    const url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}?v=${timestamp}`;

    if (debug) console.log(`Fetching: ${url}`);

    const req = new Request(url);
    const code = await req.loadString();

    if (debug) {
      console.log("Fetched code:\n" + code);
    }

    const asyncWrapper = new Function(`
      return (async () => {
        ${code}
        const __runFromLoader__ = true;
        if (typeof main === 'function') {
          await main();
        } else {
          throw new Error("No 'main()' function found in script.");
        }
      })();
    `);

    await asyncWrapper();
  } catch (error) {
    console.error("runFromGitHub error:", error);
    const alert = new Alert();
    alert.title = "Script Error";
    alert.message = error.message;
    alert.addAction("OK");
    await alert.present();
  }
}

await runFromGitHub({
  user: "luisdavidgd",
  repo: "scriptable-hub",
  branch: "main",
  path: "scripts/helloWorld.js",
  debug: true
});
