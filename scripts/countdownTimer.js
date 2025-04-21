// countdownTimer.js

/**
 * A countdown timer script that counts down from a given number of seconds.
 * Displays an alert when the timer reaches zero.
 */

async function countdown(seconds) {
  while (seconds > 0) {
    console.log(`Time remaining: ${seconds} seconds`);
    seconds--;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  }

  const alert = new Alert();
  alert.title = "Timer Finished";
  alert.message = "Time's up!";
  alert.addAction("OK");
  await alert.present();
}

async function main() {
  const startAlert = new Alert();
  startAlert.title = "Timer Starting";
  startAlert.message = "Let's Go!!";
  startAlert.addAction("OK");
  await startAlert.present();

  await countdown(3); // <-- Await the countdown properly
}

main(); // Call the main async function