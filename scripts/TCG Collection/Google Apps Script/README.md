# TCG Collection API Backend

## Description
This Google Apps Script serves as an API backend for managing and retrieving data from a Google Sheets spreadsheet that tracks a Trading Card Game (TCG) collection. It provides an endpoint to fetch the collection data in JSON format.

## Endpoints
The script exposes the following API endpoint:

### `getCollection`
- **Description**: Retrieves the TCG collection data from the spreadsheet.
- **Request**: Send a POST request with the following payload:
  ```json
  {
    "action": "getCollection"
  }
  ```

- Response: Returns a JSON object containing the collection data. Each card in the collection includes:
    - `qty` (number): The quantity of the card owned.
    - `name` (string): The name of the card.
    - `set` (string): The set to which the card belongs.
    - `number` (string): The card's number within the set.

### Example Response
```json
{
  "data": [
    {
      "qty": 2,
      "name": "Pikachu",
      "set": "Base Set",
      "number": "25"
    },
    {
      "qty": 1,
      "name": "Charizard",
      "set": "Base Set",
      "number": "4"
    }
  ]
}
```

## Dependencies
- Google Sheets: The script interacts with a Google Sheets spreadsheet that must have the following columns:
    - `Normal`: The quantity of the card owned.
    - `Name`: The name of the card.
    - `Set`: The set to which the card belongs.
    - `Number`: The card's number within the set.

## Setup
1. Open the Google Apps Script editor.
2. Link the script to a Google Sheets spreadsheet.
3. Ensure the spreadsheet has a sheet named `collection` with the required columns `(Normal`, `Name`, `Set`, `Number`).
4. Deploy the script as a web app:
- Go to Deploy > New deployment.
- Select Web app.
- Set the access permissions to "Anyone with the link" if you want public access.
5. Copy the deployment URL for use in your frontend or other clients.

## Example Usage

### Fetching the Collection
Send a POST request to the deployed web app URL with the following payload:

```json
{
  "action": "getCollection"
}
```

### Example Request in JavaScript

```javascript
const url = "YOUR_DEPLOYED_WEB_APP_URL";
const payload = {
  action: "getCollection"
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));
```

## Notes
- Ensure the spreadsheet is properly set up with the required columns before using the API.
- The script currently supports only the getCollection action. Any unsupported actions will return an error.

## Security
- Restrict access to the API by setting permissions in the Google Apps Script deployment.
- Consider adding authentication (e.g., OAuth2) if sensitive data is being managed.