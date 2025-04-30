function doPost(e) {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("collection");

    if (data.action === "getCollection") {
        return getCollection(sheet);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: "Unsupported action" }))
        .setMimeType(ContentService.MimeType.JSON);
}

function getCollection(sheet) {
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const idxNormal = headers.indexOf("Normal");
    const idxName = headers.indexOf("Name");
    const idxSet = headers.indexOf("Set");
    const idxNumber = headers.indexOf("Number");

    const collection = data.map(row => ({
        qty: row[idxNormal] || 0,
        name: row[idxName] || "",
        set: row[idxSet] || "",
        number: row[idxNumber] || "",
    }));

    return ContentService.createTextOutput(JSON.stringify({ data: collection }))
        .setMimeType(ContentService.MimeType.JSON);
}