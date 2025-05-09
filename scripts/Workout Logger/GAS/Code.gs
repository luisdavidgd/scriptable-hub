function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const year = Utils.getYearFromParams(params);
  const sheet = Utils.getSpreadsheetByYear(year);

  if (params.action === "create") {
    return Crud.createWorkout(sheet, params);
  } else if (params.action === "edit") {
    return Crud.editWorkout(sheet, params);
  } else if (params.action === "delete") {
    return Crud.deleteWorkout(sheet, params);
  }

  return ContentService.createTextOutput("Unsupported POST action");
}

function doGet(e) {
  var params = JSON.parse(JSON.stringify(e.parameter));
  const year = Utils.getYearFromParams(params);
  const sheet = Utils.getSpreadsheetByYear(year);

  if (params.action === "list") {
    return Crud.listWorkouts(sheet, params);
  } else if (params.action === "read") {
    return Crud.readWorkouts(sheet, params);
  } else if (params.action === "listByDate") {
    return Crud.listWorkoutsByDate(sheet, params);
  }

  return ContentService.createTextOutput("Unsupported GET action");
}