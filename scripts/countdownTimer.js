// countdownTimer.js

/**
 * A countdown timer script that counts down from a given number of seconds.
 * Displays an alert when the timer reaches zero.
 */

async function countdown(seconds) {
  // When the timer reaches 0, show an alert
  const alert = new Alert();
  alert.title = "Timer Starting";
  alert.message = "Let's Go!!";
  alert.addAction("OK");
  await alert.present();

  while (seconds > 0) {
    console.log(`Time remaining: ${seconds} seconds`);
    seconds--;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  }

  // When the timer reaches 0, show an alert
  alert.title = "Timer Finished";
  alert.message = "Time's up!";
  alert.addAction("OK");
  await alert.present();
}

// Call the countdown function with 10 seconds
countdown(3);
