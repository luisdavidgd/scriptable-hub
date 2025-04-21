/**
 * A simple script to confirm that Scriptable can load and run code from GitHub.
 * Shows a basic alert with the current date and a greeting.
 */

async function main() {
    const date = new Date();
    const message = `Hello from GitHub!\n\nToday is ${date.toDateString()}`;

    const alert = new Alert();
    alert.title = "Hello World";
    alert.message = message;
    alert.addAction("OK");
    await alert.present();
}

// Only run main() if not already running via external loader
if (typeof __runFromLoader__ === "undefined") {
    console.log("from helloWorld.js")
    main();
}
