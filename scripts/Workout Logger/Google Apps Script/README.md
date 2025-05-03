# Google Apps Script API Backend

## Description
This Google Apps Script serves as the backend API for managing workout data stored in a Google Sheets spreadsheet. It provides endpoints for creating, reading, updating, and deleting workout records.

## Endpoints
The script exposes the following API endpoints:

### `addWorkout(params)`
- **Description**: Adds a new workout record to the spreadsheet.
- **Parameters**:
  - `date` (string): The date of the workout (format `YYYY-MM-DD`).
  - `time` (string): The time of the workout (format `HH:mm`).
  - `pushups` (number): The number of pushups performed.
  - `squats` (number): The number of squats performed.
  - `tabata` (string): Indicates whether a Tabata workout was performed (`Yes` or `No`).

### `listWorkouts()`
- **Description**: Retrieves all workout records from the spreadsheet.
- **Response**: Returns an array of workout objects, each containing:
  - `id` (string): Unique UUID for the workout.
  - `date`, `time`, `pushups`, `squats`, `tabata`, `createdAt`, `updatedAt`.

### `editWorkout(params)`
- **Description**: Updates an existing workout record identified by its `id`.
- **Parameters**:
  - `id` (string): The unique identifier of the workout to edit.
  - Any other fields (`date`, `time`, `pushups`, `squats`, `tabata`) can be updated.

### `deleteWorkout(params)`
- **Description**: Deletes a workout record identified by its `id`.
- **Parameters**:
  - `id` (string): The unique identifier of the workout to delete.

## Dependencies
- **Google Sheets**: The script interacts with a Google Sheets spreadsheet that must have the following columns:
  - `id` (Unique UUID for each record).
  - `date`, `time`, `pushups`, `squats`, `tabata`, `createdAt`, `updatedAt`.

## Setup
1. Open the Google Apps Script editor.
2. Link the script to a Google Sheets spreadsheet.
3. Deploy the script as a web app:
   - Go to **Deploy > New deployment**.
   - Select **Web app**.
   - Set the access permissions to "Anyone with the link" if you want public access.
4. Copy the deployment URL for use in your frontend or other clients.

## Example Usage
### Adding a Workout
Send a POST request to the deployed web app URL with the following payload:
```json
{
  "action": "create",
  "date": "2025-05-02",
  "time": "10:00",
  "pushups": 20,
  "squats": 30,
  "tabata": "Yes"
}
```

### Listing Workouts
Send a GET request to the deployed web app URL with the following query:

```javascript
?action=listWorkouts
```

### Editing a Workout
Send a POST request to the deployed web app URL with the following payload:

```json
{
  "action": "edit",
  "row": "row-number-here",
  "pushups": 25
}
```

### Deleting a Workout
Send a POST request to the deployed web app URL with the following payload:

```json
{
  "action": "delete",
  "row": "row-number-here",
}
```

## Notes
- Ensure the spreadsheet is properly set up with the required columns before using the API.
- The id field is automatically generated when adding a new workout and is required for editing or deleting records.
- Handle API responses and errors appropriately in your client application.

## Security
- Restrict access to the API by setting permissions in the Google Apps Script deployment.
- Consider adding authentication (e.g., OAuth2) if sensitive data is being managed.