// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
// === CONFIG ===
let fm = FileManager.iCloud();
let configFolderPath = fm.joinPath(fm.documentsDirectory(), "Config");
let configFilePath = fm.joinPath(configFolderPath, "workoutLogger.json");

// Ensure the Config folder exists
if (!fm.fileExists(configFolderPath)) {
  fm.createDirectory(configFolderPath);
}

// Load or create configuration
let config = {};
if (fm.fileExists(configFilePath)) {
  await fm.downloadFileFromiCloud(configFilePath); // Ensure the file is local
  try {
    config = JSON.parse(fm.readString(configFilePath));
  } catch (e) {
    console.error("Failed to parse configuration file:", e);
    throw new Error("Invalid configuration file. Please check workoutLogger.json.");
  }
} else {
  console.log("Configuration file not found. Creating a new one with default values.");
  config = {
    GOOGLE_DEPLOYMENT_ID: "YOUR_GOOGLE_DEPLOYMENT_ID_HERE",
  };
  fm.writeString(configFilePath, JSON.stringify(config, null, 2)); // Save default config
  console.log("Default configuration file created at:", configFilePath);
}

// Extract the Google Script URL from the configuration
const GOOGLE_SCRIPT_URL = `https://script.google.com/macros/s/${config.GOOGLE_DEPLOYMENT_ID}/exec`;
if (!GOOGLE_SCRIPT_URL) {
  throw new Error("GOOGLE_SCRIPT_URL is missing in the configuration file.");
}

// === Main Menu ===
async function mainMenu() {
  while (true) {
    let result = await showDialog(
      "Workout Logger 🏋️‍♂️",
      "What would you like to do?",
      ["Record New Workout", "View Weekly Report", "View Total Report", "Edit or Delete a Session"],
      true // Include "Exit" option
    );

    if (result === null) {
      console.log("Exiting Workout Logger...");
      return;
    }

    let shouldExit = false;

    if (result === 0) shouldExit = await recordNewWorkout();
    else if (result === 1) shouldExit = await viewWeeklyReport();
    else if (result === 2) shouldExit = await viewTotalReport();
    else if (result === 3) shouldExit = await editOrDeleteSession();

    if (shouldExit) {
      console.log("User chose to exit.");
      break; // Exit the loop explicitly
    }
  }
}

// === Show Dialog ===
async function showDialog(title, message, options = ["OK"], includeExit = false) {
  let alert = new Alert();
  alert.title = title;
  alert.message = message;

  // Add the main options
  options.forEach(option => alert.addAction(option));

  // Optionally include an "Exit" button
  if (includeExit) {
    alert.addCancelAction("Exit");
  }

  let result = await alert.present();

  // Return the index of the selected action, or null if "Exit" is selected
  return result === -1 ? null : result;
}

// === Function to record a new workout ===
async function recordNewWorkout() {
  let selectedDate = await pickDate(new Date());
  let date = DateUtils.formatDate(selectedDate);

  let selectedTime = await pickTime(new Date());
  let time = DateUtils.formatTime(selectedTime);

  let pushups = await askNumber("How many pushups did you do?");
  let squats = await askNumber("How many squats did you do?");
  let tabata = await askYesNo("Did you do Tabata today?");

  let payload = {
    action: "create",
    date: date, // Local date
    time: time, // Local time
    pushups: pushups,
    squats: squats,
    tabata: tabata,
  };

  let response = await sendRequest(GOOGLE_SCRIPT_URL, "POST", payload, "text");
  console.log("Google Sheets response: " + response);

  // Show success alert with "Exit" option
  let result = await showDialog("Success!", response, ["OK"], true);

  return result === null; // Return true if the user chose "Exit"
}

// === Function to view weekly report ===
async function viewWeeklyReport() {
  let workouts = await sendRequest(`${GOOGLE_SCRIPT_URL}?action=list`);
  let weeklySummary = getWeeklySummary(workouts);

  console.log(`Weekly Report:`);
  console.log(`Total pushups this week: ${weeklySummary.totalPushups}`);
  console.log(`Total squats this week: ${weeklySummary.totalSquats}`);
  console.log(`Total Tabata sessions this week: ${weeklySummary.totalTabata}`);

  // Show weekly report alert with "Exit" option
  let result = await showDialog(
    "Weekly Report",
    `Pushups: ${weeklySummary.totalPushups}\nSquats: ${weeklySummary.totalSquats}\nTabata: ${weeklySummary.totalTabata}`,
    ["OK"],
    true // Include "Exit" option
  );

  return result === null; // Return true if the user chose "Exit"
}

// === Function to view total report ===
async function viewTotalReport() {
  let workouts = await sendRequest(`${GOOGLE_SCRIPT_URL}?action=list`);
  let totalSummary = getTotalSummary(workouts);

  console.log(`Total Report:`);
  console.log(`Total pushups: ${totalSummary.totalPushups}`);
  console.log(`Total squats: ${totalSummary.totalSquats}`);
  console.log(`Total Tabata sessions: ${totalSummary.totalTabata}`);

  // Show success alert with "Exit" option
  let result = await showDialog(
    "Total Report",
    `Pushups: ${totalSummary.totalPushups}\nSquats: ${totalSummary.totalSquats}\nTabata: ${totalSummary.totalTabata}`,
    ["OK"],
    true
  );

  return result === null; // Return true if the user chose "Exit"
}

// === Function to edit or delete a session ===
async function editOrDeleteSession() {
  let selectedDate = await pickDate(new Date());
  let selectedDateString = DateUtils.formatDate(selectedDate); // Format date as YYYY-MM-DD

  let workouts = await sendRequest(`${GOOGLE_SCRIPT_URL}?action=listByDate&date=${encodeURIComponent(selectedDateString)}`);

  if (workouts.length === 0) {
    console.log(`No workouts found for the selected date: ${selectedDateString}`);
    return;
  }

  let alert = new Alert();
  alert.title = `Workouts on ${selectedDateString}`;
  workouts.forEach((workout, index) => {
    alert.addAction(`${workout.time} - Pushups: ${workout.pushups}, Squats: ${workout.squats}`);
  });
  alert.addCancelAction("Cancel");

  let selectedIndex = await alert.present();
  if (selectedIndex === -1) return;

  let selectedWorkout = workouts[selectedIndex];
  let action = await askChoice(["Edit", "Delete"], "What would you like to do?");

  if (action === 0) {
    // Edit the selected workout
    let selectedDate = await pickDate(DateUtils.createLocalDate(selectedWorkout.date));
    let selectedDateString = DateUtils.formatDate(selectedDate);

    let selectedTime = await pickTime(new Date(`${selectedWorkout.date}T${selectedWorkout.time}`));
    let selectedTimeString = DateUtils.formatTime(selectedTime);

    let pushups = await askNumber("New pushups:", selectedWorkout.pushups);
    let squats = await askNumber("New squats:", selectedWorkout.squats);
    let tabata = await askYesNo("Did you do Tabata?");

    let payload = {
      action: "edit",
      row: selectedWorkout.row,
      date: selectedDateString,
      time: selectedTimeString,
      pushups: pushups,
      squats: squats,
      tabata: tabata,
    };

    let response = await sendRequest(GOOGLE_SCRIPT_URL, "POST", payload, "text");
    console.log("Google Sheets response: " + response);

    // Show success alert with "Exit" option
    let result = await showDialog("Success!", response, ["OK"], true);

    return result === null; // Return true if the user chose "Exit"
  } else {
    // Delete the selected workout
    let payload = {
      action: "delete",
      row: selectedWorkout.row,
    };

    let response = await sendRequest(GOOGLE_SCRIPT_URL, "POST", payload, "text");
    console.log("Google Sheets response: " + response);

    // Show success alert with "Exit" option
    let result = await showDialog("Success!", response, ["OK"], true);

    return result === null; // Return true if the user chose "Exit"
  }
}

// === Helper functions ===
function getWeeklySummary(workouts) {
  let startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  let totalPushups = 0;
  let totalSquats = 0;
  let totalTabata = 0;

  workouts.forEach(workout => {
    let workoutDate = new Date(workout.date);
    if (workoutDate >= startOfWeek) {
      totalPushups += workout.pushups;
      totalSquats += workout.squats;
      if (workout.tabata === "Yes") totalTabata++;
    }
  });

  return { totalPushups, totalSquats, totalTabata };
}

function getTotalSummary(workouts) {
  let totalPushups = 0;
  let totalSquats = 0;
  let totalTabata = 0;

  workouts.forEach(workout => {
    totalPushups += workout.pushups;
    totalSquats += workout.squats;
    if (workout.tabata === "Yes") totalTabata++;
  });

  return { totalPushups, totalSquats, totalTabata };
}

async function askNumber(question, defaultValue = "") {
  while (true) {
    let alert = new Alert();
    alert.title = question;
    alert.addTextField("Enter a number", defaultValue.toString());
    alert.addAction("OK");
    await alert.present();

    let input = alert.textFieldValue(0);
    let number = parseInt(input);

    if (!isNaN(number)) {
      return number; // Return the valid number
    } else {
      let errorAlert = new Alert();
      errorAlert.title = "Invalid Input";
      errorAlert.message = "Please enter a valid number.";
      errorAlert.addAction("OK");
      await errorAlert.present();
    }
  }
}

async function askYesNo(question) {
  let alert = new Alert();
  alert.title = question;
  alert.addAction("Yes");
  alert.addCancelAction("No");
  let result = await alert.present();
  return result === 0;
}

async function askChoice(choices, question) {
  let alert = new Alert();
  alert.title = question;
  choices.forEach(choice => alert.addAction(choice));
  let result = await alert.present();
  return result;
}

const DateUtils = {
  formatDate(date) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat("en-CA", options).format(date); // Format as YYYY-MM-DD
  },

  formatTime(date) {
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    return new Intl.DateTimeFormat("en-CA", options).format(date); // Format as HH:mm
  },

  createLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // Months are 0-indexed in JavaScript
  }
};

async function pickDate(initialDate = new Date()) {
  let picker = new DatePicker();
  picker.initialDate = initialDate;
  return await picker.pickDate();
}

async function pickTime(initialDate = new Date()) {
  let picker = new DatePicker();
  picker.initialDate = initialDate;
  return await picker.pickTime();
}

async function sendRequest(url, method = "GET", payload = null, responseType = "json") {
  let req = new Request(url);
  req.method = method;
  if (payload) {
    req.headers = { "Content-Type": "application/json" };
    req.body = JSON.stringify(payload);
  }

  if (responseType === "json") {
    return await req.loadJSON();
  } else if (responseType === "text") {
    return await req.loadString();
  } else {
    throw new Error("Unsupported response type: " + responseType);
  }
}

// Call the main menu to start the app
await mainMenu();