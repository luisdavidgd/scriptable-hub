# 📱 scriptable-hub

A personal collection of scripts built for [Scriptable](https://scriptable.app), the iOS app that lets you automate anything with JavaScript.

This repository includes utilities, widgets, and experimental scripts that can be run directly from GitHub on your iPhone or iPad.

---

## 🚀 Run scripts from GitHub

You can load and execute any script in this repository using the `runFromGitHub` helper.

### 🧩 Base code

Save this file in Scriptable as `runFromGitHub.js`:

```javascript
// runFromGitHub.js
async function runFromGitHub(user, repo, path, branch = "main") {
  const url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
  const req = new Request(url);
  const code = await req.loadString();
  return eval(code);
}

// Example usage:
await runFromGitHub("your-username", "scriptable-hub", "scripts/helloWorld.js");
```
### 📂 Repository structure

```bash
scriptable-hub/
├── scripts/
│   ├── helloWorld.js
│   ├── weatherWidget.js
│   └── ...
├── runFromGitHub.js
└── README.md
```
### 📌 Requirements
* Scriptable app installed on your iOS device.
* Internet connection if running scripts from GitHub.
* Scripts are tested on recent iOS versions.

### 🧪 Featured scripts
| Script    | Description |
| -------- | ------- |
| helloWorld.js  | $Basic test script to confirm GitHub loading works.    |
| weatherWidget.js | Displays current weather using OpenWeather API (requires key).     |
| ...    | More coming soon!    |

### ✍️ Author
@luisdavidgd — fan of useful, minimal, and portable scripts.

### 📄 License
MIT — Free to use, modify, and share. Credit is appreciated!
