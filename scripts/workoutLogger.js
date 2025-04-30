// === CONFIG ===
let fm = FileManager.iCloud();
let fileName = "workout_log.json";
let folderPath = fm.joinPath(fm.documentsDirectory(), "Data");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwA-otr7KxXAH-J-TGPGam4zQc1HU4AmTo8nWO6Z1SNWNxyGsYFmVUODiUVYFFQzXga/exec"; // <-- paste yours

if (!fm.fileExists(folderPath)) {
  fm.createDirectory(folderPath, false);  // Create 'Data' folder if it doesn't exist
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
  // Option 1: Record a new workout
  await recordNewWorkout();
} else if (result === 1) {
  // Option 2: View weekly report
  viewWeeklyReport();
} else if (result === 2) {
  // Option 3: View total report
  viewTotalReport();
} else if (result === 3) {
  // Option 4: Edit or delete a session
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

  // === Send to Google Sheets ===
  let payload = {
    action: "create",
    date: today,
    time: timeKey,
    pushups: pushups,
    squats: squats,
    tabata: tabata
  };

  let req = new Request(GOOGLE_SCRIPT_URL);
  req.method = "POST";
  req.headers = { "Content-Type": "application/json" };
  req.body = JSON.stringify(payload);
  let res = await req.loadString();
  console.log("Google Sheets response: " + res);
}

// === Function to view weekly report ===
function viewWeeklyReport() {
  let weeklySummary = getWeeklySummary(data);
  console.log(`Weekly Report:`);
  console.log(`Total pushups this week: ${weeklySummary.totalPushups}`);
  console.log(`Total squats this week: ${weeklySummary.totalSquats}`);
  console.log(`Total Tabata sessions this week: ${weeklySummary.totalTabata}`);
}

// === Function to view total report ===
function viewTotalReport() {
  let totalPushups = 0;
  let totalSquats = 0;
  let totalTabata = 0;

  for (let date in data) {
    for (let session in data[date]) {
      totalPushups += data[date][session].pushups;
      totalSquats += data[date][session].squats;
      if (data[date][session].tabata) totalTabata++;
    }
  }

  console.log(`Total Report:`);
  console.log(`Total pushups: ${totalPushups}`);
  console.log(`Total squats: ${totalSquats}`);
  console.log(`Total Tabata sessions: ${totalTabata}`);
}

// === Function to edit or delete a session ===
async function editOrDeleteSession() {
  let picker = new DatePicker();
  let selectedDate = await picker.pickDate();
  let dateToEdit = selectedDate.toISOString().slice(0, 10);

  if (!data[dateToEdit]) {
    console.log("No session found for that date.");
    return;
  }

  let sessionKeys = Object.keys(data[dateToEdit]);
  console.warn(sessionKeys)
  let sessionToEdit = await askChoice(sessionKeys, "Choose the session to edit or delete:");
  console.error(sessionToEdit)

  let action = await askChoice(["Edit", "Delete"], "What would you like to do?");

  if (action === 0) {
    // Edit the session
    let timeKey = sessionToEdit; // Directly use the selected session key to update
    let pushups = 2//await askNumber("New pushups:");
    let squats = 2//await askNumber("New squats:");
    let tabata = 2//await askYesNo("Did you do Tabata?");

    console.warn(data[dateToEdit][timeKey])

    data[dateToEdit][timeKey] = { pushups, squats, tabata }; // Update the session using the exact time key
    let json = JSON.stringify(data, null, 2);
    console.error(json)
    fm.writeString(path, json);
    console.log("Session updated.");
  } else {
    // Delete the session
    delete data[dateToEdit][sessionToEdit];
    if (Object.keys(data[dateToEdit]).length === 0) {
      delete data[dateToEdit];  // Remove the date if there are no more sessions
    }
    let json = JSON.stringify(data, null, 2);
    fm.writeString(path, json);
    console.log("Session deleted.");
  }
}

// === Function to get weekly summary ===
function getWeeklySummary(data) {
  let startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Monday of this week

  let totalPushups = 0;
  let totalSquats = 0;
  let totalTabata = 0;

  for (let date in data) {
    let exerciseDate = new Date(date);
    if (exerciseDate >= startOfWeek) {
      for (let session in data[date]) {
        totalPushups += data[date][session].pushups;
        totalSquats += data[date][session].squats;
        if (data[date][session].tabata) totalTabata++;
      }
    }
  }

  return {
    totalPushups,
    totalSquats,
    totalTabata,
  };
}

// === Function to ask for number input ===
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
