let input = args.plainTexts[0] || "Luis\nDiego";

if (!input) {
  throw new Error("No input received.");
}

let players = input.split('\n').map(n => n.trim()).filter(n => n);

shuffle(players);

// Add "Bye" if odd number of players
if (players.length % 2 !== 0) {
  players.push("Bye");
}

let numPlayers = players.length;
let numRounds = numPlayers - 1;
let half = numPlayers / 2;

// Generate timestamp
let now = new Date();
let yyyy = now.getFullYear();
let mm = String(now.getMonth() + 1).padStart(2, '0');
let dd = String(now.getDate()).padStart(2, '0');
let hh = String(now.getHours()).padStart(2, '0');
let min = String(now.getMinutes()).padStart(2, '0');
let timestamp = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

let lines = [];
lines.push(`*Match Fixture – ${timestamp}*`);

for (let round = 0; round < numRounds; round++) {
  let matchLines = [];
  let restPlayer = null;

  for (let i = 0; i < half; i++) {
    let p1 = players[i];
    let p2 = players[numPlayers - 1 - i];

    if (p1 === "Bye") {
      restPlayer = p2;
    } else if (p2 === "Bye") {
      restPlayer = p1;
    } else {
      matchLines.push(`• ${p1} vs ${p2}`);
    }
  }

  lines.push(`\n*Round ${round + 1}*`);
  lines.push(...matchLines);
  if (restPlayer) lines.push(`• *${restPlayer} rests*`);

  players.splice(1, 0, players.pop()); // rotate
}

Script.setShortcutOutput(lines.join('\n'));
await QuickLook.present(lines)
Script.complete();

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

