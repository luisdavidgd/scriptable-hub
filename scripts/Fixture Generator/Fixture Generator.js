// — Utility Functions —

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generates a timestamp in the format "YYYY-MM-DD HH:mm".
 * @returns {string} - The formatted timestamp.
 */
function generateTimestamp() {
  let now = new Date();
  let yyyy = now.getFullYear();
  let mm = String(now.getMonth() + 1).padStart(2, '0');
  let dd = String(now.getDate()).padStart(2, '0');
  let hh = String(now.getHours()).padStart(2, '0');
  let min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

/**
 * Generates match fixtures for a round-robin tournament.
 * @param {Array} players - The list of players.
 * @returns {Array} - The generated match fixtures as an array of strings.
 */
function generateFixtures(players) {
  let numPlayers = players.length;
  let numRounds = numPlayers - 1;
  let half = numPlayers / 2;
  let lines = [];
  let timestamp = generateTimestamp();

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

    // Shuffle the order of matches in the round
    shuffle(matchLines);

    lines.push(`\n*Round ${round + 1}*`);
    lines.push(...matchLines);
    if (restPlayer) lines.push(`• *${restPlayer} rests*`);

    players.splice(1, 0, players.pop()); // Rotate players
  }

  return lines;
}

// — Main Logic —

async function main(input) {
  if (!input) {
    throw new Error("No input received.");
  }

  let players = input.split('\n').map(n => n.trim()).filter(n => n);

  // Shuffle players initially
  shuffle(players);

  // Add "Bye" if odd number of players
  if (players.length % 2 !== 0) {
    players.push("Bye");
  }

  // Generate fixtures
  let fixtures = generateFixtures(players);

  return fixtures.join('\n');
}

// — Run Logic —

if (typeof __runFromLoader__ === "undefined") {
  try {
    let input = args.plainTexts[0] || "Luis\nDiego";
    let result = await main(input);
    Script.setShortcutOutput(result);
  } catch (e) {
    console.error(e.message);
    Script.setShortcutOutput(e.message);
  } finally {
    Script.complete();
  }
}