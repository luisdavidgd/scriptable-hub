function doGet() {
    try {
      const doc = DocumentApp.getActiveDocument();
      const body = doc.getBody().getText();
      return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.TEXT);
    } catch (error) {
      return ContentService.createTextOutput(`Error: ${error.message}`).setMimeType(ContentService.MimeType.TEXT);
    }
  }

  function doPost(e) {
    try {
      const params = JSON.parse(e.postData.contents);
      const newContent = params.content;
  
      if (!newContent) {
        return ContentService.createTextOutput("Missing 'content' parameter").setMimeType(ContentService.MimeType.TEXT);
      }
  
      const doc = DocumentApp.getActiveDocument();
      const body = doc.getBody();
      body.setText(newContent);
  
      return ContentService.createTextOutput("Document updated successfully").setMimeType(ContentService.MimeType.TEXT);
    } catch (error) {
      return ContentService.createTextOutput(`Error: ${error.message}`).setMimeType(ContentService.MimeType.TEXT);
    }
  }