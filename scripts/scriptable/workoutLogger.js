// === CONFIG ===
let fm = FileManager.iCloud();
let configFolderPath = fm.joinPath(fm.documentsDirectory(), "Config");
let configFilePath = fm.joinPath(configFolderPath, "workoutLogger.cfg");

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
    throw new Error("Invalid configuration file. Please check workoutLogger.cfg.");
  }
} else {
  console.log("Configuration file not found. Creating a new one with default values.");
  config = {
    GOOGLE_SCRIPT_URL: "https://example.com/default-hash", // Default value
  };
  fm.writeString(configFilePath, JSON.stringify(config, null, 2)); // Save default config
  console.log("Default configuration file created at:", configFilePath);
}

// Extract the Google Script URL from the configuration
const GOOGLE_SCRIPT_URL = config.GOOGLE_SCRIPT_URL;
if (!GOOGLE_SCRIPT_URL) {
  throw new Error("GOOGLE_SCRIPT_URL is missing in the configuration file.");
}

// === WORKOUT LOGGER ===
let fileName = "workout_log.json";
let folderPath = fm.joinPath(fm.documentsDirectory(), "Data");

if (!fm.fileExists(folderPath)) {
  fm.createDirectory(folderPath, false); // Create 'Data' folder if it doesn't exist
}

let path = fm.joinPath(folderPath, fileName);

// === Load existing data ===
let data = {};
if (fm.fileExists(path)) {
  await fm.downloadFileFromiCloud(path); // Ensure the file is local
  try {
    data = JSON.parse(fm.readString(path));
  } catch (e) {
    console.log("Unable to read the file. Starting a new log.");
    data = {};
  }
} else {
  console.log("File not found. A new one will be created.");
}

// === Show Menu ===
let alert = new Alert();
alert.title = "Workout Tracker";
alert.message = "Choose an option";
alert.addAction("Record New Workout");
alert.addAction("View Weekly Report");
alert.addAction("View Total Report");
alert.addAction("Edit or Delete a Session");
alert.addCancelAction("Cancel");

let result = await alert.present();

// === Actions based on selected option ===
if (result === 0) {
  await recordNewWorkout();
} else if (result === 1) {
  await viewWeeklyReport();
} else if (result === 2) {
  await viewTotalReport();
} else if (result === 3) {
  await editOrDeleteSession();
}

// === Function to record a new workout ===
async function recordNewWorkout() {
  let picker = new DatePicker();
  let selectedDate = await picker.pickDate();
  let today = selectedDate.toISOString().slice(0, 10);
  let timeKey = selectedDate.toISOString().slice(11, 19);

  let pushups = await askNumber("How many pushups did you do?");
  let squats = await askNumber("How many squats did you do?");
  let tabata = await askYesNo("Did you do Tabata today?");

  let payload = {
    action: "create",
    date: today,
    time: timeKey,
    pushups: pushups,
    squats: squats,
    tabata: tabata,
  };

  let req = new Request(GOOGLE_SCRIPT_URL);
  req.method = "POST";
  req.headers = { "Content-Type": "application/json" };
  req.body = JSON.stringify(payload);
  let res = await req.loadString();
  console.log("Google Sheets response: " + res);
}

// === Function to view weekly report ===
async function viewWeeklyReport() {
  let req = new Request(GOOGLE_SCRIPT_URL);
  req.method = "POST";
  req.headers = { "Content-Type": "application/json" };
  req.body = JSON.stringify({ action: "list" });

  let workouts = await req.loadJSON();
  let weeklySummary = getWeeklySummary(workouts);

  console.log(`Weekly Report:`);
  console.log(`Total pushups this week: ${weeklySummary.totalPushups}`);
  console.log(`Total squats this week: ${weeklySummary.totalSquats}`);
  console.log(`Total Tabata sessions this week: ${weeklySummary.totalTabata}`);
}

// === Function to view total report ===
async function viewTotalReport() {
  let req = new Request(GOOGLE_SCRIPT_URL);
  req.method = "POST";
  req.headers = { "Content-Type": "application/json" };
  req.body = JSON.stringify({ action: "list" });

  let workouts = await req.loadJSON();
  let totalSummary = getTotalSummary(workouts);

  console.log(`Total Report:`);
  console.log(`Total pushups: ${totalSummary.totalPushups}`);
  console.log(`Total squats: ${totalSummary.totalSquats}`);
  console.log(`Total Tabata sessions: ${totalSummary.totalTabata}`);
}

// === Function to edit or delete a session ===
async function editOrDeleteSession() {
  let req = new Request(GOOGLE_SCRIPT_URL);
  req.method = "POST";
  req.headers = { "Content-Type": "application/json" };
  req.body = JSON.stringify({ action: "list" });

  let workouts = await req.loadJSON();

  let alert = new Alert();
  alert.title = "Select a Workout";
  workouts.forEach((workout, index) => {
    alert.addAction(`${workout.date} ${workout.time} - Pushups: ${workout.pushups}, Squats: ${workout.squats}`);
  });
  alert.addCancelAction("Cancel");

  let selectedIndex = await alert.present();
  if (selectedIndex === -1) return;

  let selectedWorkout = workouts[selectedIndex];
  let action = await askChoice(["Edit", "Delete"], "What would you like to do?");

  if (action === 0) {
    let pushups = await askNumber("New pushups:");
    let squats = await askNumber("New squats:");
    let tabata = await askYesNo("Did you do Tabata?");

    let payload = {
      action: "edit",
      row: selectedWorkout.row,
      pushups: pushups,
      squats: squats,
      tabata: tabata,
    };

    let req = new Request(GOOGLE_SCRIPT_URL);
    req.method = "POST";
    req.headers = { "Content-Type": "application/json" };
    req.body = JSON.stringify(payload);
    let res = await req.loadString();
    console.log("Google Sheets response: " + res);
  } else {
    let payload = {
      action: "delete",
      row: selectedWorkout.row,
    };

    let req = new Request(GOOGLE_SCRIPT_URL);
    req.method = "POST";
    req.headers = { "Content-Type": "application/json" };
    req.body = JSON.stringify(payload);
    let res = await req.loadString();
    console.log("Google Sheets response: " + res);
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

async function askNumber(question) {
  let alert = new Alert();
  alert.title = question;
  alert.addTextField("Enter a number", "");
  alert.addAction("OK");
  await alert.present();
  return parseInt(alert.textFieldValue(0)) || 0;
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