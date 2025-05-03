const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Workout");

function doPost(e) {
  const params = JSON.parse(e.postData.contents);

  if (params.action === "create") {
    return createWorkout(sheet, params);
  } else if (params.action === "read") {
    return readWorkouts(sheet, params);
  } else if (params.action === "edit") {
    return editWorkout(sheet, params);
  } else if (params.action === "delete") {
    return deleteWorkout(sheet, params);
  } else if (params.action === "list") {
    return listWorkouts(sheet);
  } else if (params.action === "listByDate") {
    return listWorkoutsByDate(sheet, params);
  } else if (params.action === "test") {
    return testFunction(params);
  }

  return ContentService.createTextOutput("Unsupported action");
}

function doGet(e) {
  var params = JSON.parse(JSON.stringify(e.parameter));
  if (params.action === "list") {
    return listWorkouts(sheet);
  }
  return ContentService.createTextOutput(JSON.stringify(params)).setMimeType(ContentService.MimeType.JSON);
}