async function runFromGitHub(user, repo, path, branch = "main") {
  const url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
  const req = new Request(url);
  const code = await req.loadString();

  return (async () => {
    eval(code);
  })();
}

// Example of use
await runFromGitHub("luisdavidgd", "scriptable-hub", "scripts/helloWorld.js");
