async function runFromGitHub(user, repo, path, branch = "main") {
  try {
    const url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
    const req = new Request(url);
    const code = await req.loadString();
    return (async () => {
      eval(code);
    })();
  } catch (error) {
    const alert = new Alert();
    alert.title = "Error loading script";
    alert.message = error.toString();
    alert.addAction("OK");
    await alert.present();
  }
}

// Example of use
await runFromGitHub("luisdavidgd", "scriptable-hub", "scripts/helloWorld.js");
