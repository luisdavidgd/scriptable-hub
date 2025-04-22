function delay(ms) {
  return new Promise(resolve => Timer.schedule(ms / 1000, false, resolve));
}

async function countdown(seconds) {
  while (seconds > 0) {
    console.log(`Time remaining: ${seconds} seconds`);
    seconds--;
    await delay(1000); // Use custom delay
  }

  const alert = new Alert();
  alert.title = "Timer Finished";
  alert.message = "Time's up!";
  alert.addAction("OK");
  await alert.present();
}

async function main() {
  console.log("main function was executed");
  const startAlert = new Alert();
  startAlert.title = "Timer Starting";
  startAlert.message = "Let's Go!!";
  startAlert.addAction("OK");
  await startAlert.present();

  await countdown(3);
  console.log("I'm finished!");
}

// Only run main() if not already running via external loader
if (typeof __runFromLoader__ === "undefined") {
  console.log("from helloWorld.js")
  main();
}