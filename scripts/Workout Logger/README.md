# Workout Logger

## Description
This script allows you to log, list, edit, and delete workouts in a Google Sheets spreadsheet. It is useful for tracking your exercise routines.

## Usage
The script exposes the following functions:

- `addWorkout(params)`: Adds a new workout.
- `listWorkouts(params)`: Lists all registered workouts.
- `editWorkout(params)`: Edits an existing workout.
- `deleteWorkout(params)`: Deletes a workout.

### Parameters
- `date`: The date of the workout (format `YYYY-MM-DD`).
- `time`: The time of the workout (format `HH:mm`).
- `pushups`: The number of pushups performed.
- `squats`: The number of squats performed.
- `tabata`: Indicates whether a Tabata workout was performed (`Yes` or `No`).

## Dependencies
- Google Apps Script.
- A Google Sheets spreadsheet with the following columns:
  - `date`, `time`, `pushups`, `squats`, `tabata`, `createdAt`, `updatedAt`.

## Notes
- Ensure the spreadsheet has the correct columns before using the script.
- The UUID is automatically generated when adding a new workout.

## Example
```javascript
// Add a new workout
addWorkout({
  action: "create"
  date: "2025-05-02",
  time: "10:00",
  pushups: 20,
  squats: 30,
  tabata: "Yes"
});