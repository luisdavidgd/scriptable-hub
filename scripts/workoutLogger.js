// === CONFIG ===
let fm = FileManager.iCloud();
let fileName = "workout_log.json";
let folderPath = fm.joinPath(fm.documentsDirectory(), "Data");

if (!fm.fileExists(folderPath)) {
  fm.createDirectory(folderPath, false);  // Crear carpeta 'Data' si no existe
}

let path = fm.joinPath(folderPath, fileName);

// === Cargar datos existentes ===
let data = {};
if (fm.fileExists(path)) {
  await fm.downloadFileFromiCloud(path); // Asegurarse de que el archivo esté local
  try {
    data = JSON.parse(fm.readString(path));
  } catch (e) {
    console.log("No se pudo leer el archivo. Iniciando nuevo registro.");
    data = {};
  }
} else {
  console.log("Archivo no encontrado. Se creará uno nuevo.");
}

// === Mostrar Menú ===
let alert = new Alert();
alert.title = "Workout Tracker";
alert.message = "Choose an option";
alert.addAction("Record New Workout");
alert.addAction("View Weekly Report");
alert.addAction("View Total Report");
alert.addAction("Edit or Delete a Session");
alert.addCancelAction("Cancel");

let result = await alert.present();

// === Acciones según la opción seleccionada ===
if (result === 0) {
  // Opción 1: Registrar un nuevo workout
  await recordNewWorkout();
} else if (result === 1) {
  // Opción 2: Ver reporte semanal
  viewWeeklyReport();
} else if (result === 2) {
  // Opción 3: Ver reporte total
  viewTotalReport();
} else if (result === 3) {
  // Opción 4: Editar o eliminar sesión
  await editOrDeleteSession();
}

// === Función para registrar un nuevo workout ===
async function recordNewWorkout() {
  let today = new Date();
  let timestamp = today.toISOString();

  let pushups = await askNumber("How many pushups did you do?");
  let squats = await askNumber("How many squats did you do?");
  let tabata = await askYesNo("Did you do Tabata today?");

  if (!data[today.toISOString().slice(0, 10)]) {
    data[today.toISOString().slice(0, 10)] = {};
  }

  data[today.toISOString().slice(0, 10)][timestamp] = { pushups, squats, tabata };

  let json = JSON.stringify(data, null, 2);
  fm.writeString(path, json);

  console.log("Saved to: " + path);
  console.log("Workout log:");
  console.log(json);
}

// === Función para ver reporte semanal ===
function viewWeeklyReport() {
  let weeklySummary = getWeeklySummary(data);
  console.log(`Weekly Report:`);
  console.log(`Total pushups this week: ${weeklySummary.totalPushups}`);
  console.log(`Total squats this week: ${weeklySummary.totalSquats}`);
  console.log(`Total Tabata sessions this week: ${weeklySummary.totalTabata}`);
}

// === Función para ver reporte total ===
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

// === Función de edición o eliminación ===
async function editOrDeleteSession() {
  let dateToEdit = await askDate("Enter the date of the session you want to edit or delete (YYYY-MM-DD):");

  if (!data[dateToEdit]) {
    console.log("No session found for that date.");
    return;
  }

  let sessionKeys = Object.keys(data[dateToEdit]);
  let sessionToEdit = await askChoice(sessionKeys, "Choose the session to edit or delete:");

  let action = await askChoice(["Edit", "Delete"], "What would you like to do?");

  if (action === 0) {
    // Editar la sesión
    let pushups = await askNumber("New pushups:");
    let squats = await askNumber("New squats:");
    let tabata = await askYesNo("Did you do Tabata?");

    data[dateToEdit][sessionToEdit] = { pushups, squats, tabata };
    let json = JSON.stringify(data, null, 2);
    fm.writeString(path, json);
    console.log("Session updated.");
  } else {
    // Eliminar la sesión
    delete data[dateToEdit][sessionToEdit];
    if (Object.keys(data[dateToEdit]).length === 0) {
      delete data[dateToEdit];  // Eliminar el día si no hay más sesiones
    }
    let json = JSON.stringify(data, null, 2);
    fm.writeString(path, json);
    console.log("Session deleted.");
  }
}

// === Función para obtener resumen semanal ===
function getWeeklySummary(data) {
  let startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Lunes de esta semana

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

// === Función de preguntas ===
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

async function askDate(question) {
  let alert = new Alert();
  alert.title = question;
  alert.addTextField("Enter date (YYYY-MM-DD)", "");
  alert.addAction("OK");
  await alert.present();
  return alert.textFieldValue(0);
}
