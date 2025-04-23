async function runFromGitHub({ user, repo, branch, path, debug = false }) {
  try {
    const timestamp = Date.now();
    const url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}?v=${timestamp}`;
    if (debug) console.log("📡 Downloading:", url);

    const req = new Request(url);
    const code = await req.loadString();
    if (debug) console.log("📄 Fetched code:\n" + code);

    const inputArgs = args?.plainTexts || [];

    const asyncWrapper = new Function("input", `
      const __runFromLoader__ = true;
      return (async () => {
        ${code}
        if (typeof main === 'function') {
          await main(input);
        } else {
          throw new Error("No 'main()' function found in script.");
        }
      })();
    `);

    await asyncWrapper(inputArgs);

  } catch (error) {
    console.error("❌ runFromGitHub error:", error);
    const alert = new Alert();
    alert.title = "Script Error";
    alert.message = error.message;
    alert.addAction("OK");
    await alert.present();
  } finally {
    Script.complete();
  }
}

await runFromGitHub({
  user: "luisdavidgd",
  repo: "scriptable-hub",
  branch: "main",
  path: "scripts/deckChecker.js",
  debug: false
});
