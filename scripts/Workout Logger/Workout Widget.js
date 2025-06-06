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

// Load configuration
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
  throw new Error("Configuration file not found. Please create workoutLogger.json.");
}

// Extract the Google Script URL from the configuration
const GOOGLE_SCRIPT_URL = `https://script.google.com/macros/s/${config.GOOGLE_DEPLOYMENT_ID}/exec`;
if (!GOOGLE_SCRIPT_URL) {
  throw new Error("GOOGLE_SCRIPT_URL is missing in the configuration file.");
}

// === Fetch Weekly Report ===
async function fetchWeeklyWorkouts() {
  const url = `${GOOGLE_SCRIPT_URL}?action=list`;
  return await sendRequest(url, "GET");
}

async function fetchAllWorkouts() {
  const url = `${GOOGLE_SCRIPT_URL}?action=list`;
  return await sendRequest(url, "GET");
}

// === Create Widget ===
async function createWidget(reportType = "weekly") {
  let summary;

  if (reportType === "total") {
    const workouts = await fetchAllWorkouts();
    summary = getTotalSummary(workouts);
  } else {
    const workouts = await fetchWeeklyWorkouts();
    summary = getWeeklySummary(workouts);
  }

  let widget = new ListWidget();

  // Define dynamic colors for light and dark mode
  const backgroundColor = Color.dynamic(new Color("#ffffff"), new Color("#1a1a1a")); // Light: white, Dark: dark gray
  const textColor = Color.dynamic(new Color("#000000"), new Color("#ffffff")); // Light: black, Dark: white
  const footerColor = Color.dynamic(new Color("#555555"), new Color("#aaaaaa")); // Light: gray, Dark: light gray

  widget.backgroundColor = backgroundColor;

  let title = widget.addText(
    reportType === "total" ? "Total Report 🏋️‍♂️" : "Weekly Report 🏋️‍♂️"
  );
  title.font = Font.boldSystemFont(16);
  title.textColor = textColor;
  widget.addSpacer(8);

  let pushups = widget.addText(`Pushups: ${summary.totalPushups}`);
  pushups.font = Font.systemFont(14);
  pushups.textColor = textColor;

  let squats = widget.addText(`Squats: ${summary.totalSquats}`);
  squats.font = Font.systemFont(14);
  squats.textColor = textColor;

  let tabata = widget.addText(`Tabata: ${summary.totalTabata}`);
  tabata.font = Font.systemFont(14);
  tabata.textColor = textColor;

  widget.addSpacer();

  let footer = widget.addText("Workout Logger");
  footer.font = Font.italicSystemFont(10);
  footer.textColor = footerColor;

  // Set the widget to refresh after 15 minutes
  widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

  return widget;
}

// === Helper Functions ===
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

async function sendRequest(url, method = "GET", payload = null) {
  let req = new Request(url);
  req.method = method;
  if (payload) {
    req.headers = { "Content-Type": "application/json" };
    req.body = JSON.stringify(payload);
  }
  return await req.loadJSON();
}

// === Run Script ===
const reportType = args.widgetParameter || "weekly"; // Default to "weekly"

if (config.runsInWidget) {
  let widget = await createWidget(reportType);
  Script.setWidget(widget);
  Script.complete();
} else {
  let widget = await createWidget(reportType);
  widget.presentMedium();
}