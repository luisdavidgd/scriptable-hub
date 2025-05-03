# Workout Logger 🏋️‍♂️

## Description
**Workout Logger** is a simple and powerful script designed to help you track your workouts directly from your iPhone or iPad using the [Scriptable](https://scriptable.app/) app. It integrates seamlessly with Google Sheets to store your workout data, making it easy to log, edit, and review your progress over time.

## Features
- 📅 **Log Workouts**: Record the date, time, and details of your workout (pushups, squats, Tabata).
- 🔄 **Edit or Delete Workouts**: Update or remove existing workout entries.
- 📊 **View Reports**: Get weekly and total summaries of your workouts.
- ☁️ **Google Sheets Integration**: All data is stored in a Google Sheets spreadsheet for easy access and backup.

## How It Works
1. **Install Scriptable**: Download the Scriptable app from the App Store.
2. **Set Up Google Apps Script**: Deploy the provided Google Apps Script to handle the backend.
3. **Run the Script**: Use the Scriptable app to log and manage your workouts.

## Setup Instructions
### 1. Google Apps Script
1. Open the [Google Apps Script Editor](https://script.google.com/).
2. Copy and paste the provided Google Apps Script code into the editor.
3. Link the script to a Google Sheets spreadsheet with the following columns:
   - `date`, `time`, `pushups`, `squats`, `tabata`, `createdAt`, `updatedAt`.
4. Deploy the script as a web app:
   - Go to **Deploy > New Deployment**.
   - Select **Web app**.
   - Set access permissions to "Anyone with the link".
5. Copy the deployment URL.

### 2. Scriptable Configuration
1. Copy the `Workout Logger.js` script into the Scriptable app.
2. Create a configuration file (`workoutLogger.json`) in the Scriptable `Config` folder:
   ```json
   {
     "GOOGLE_DEPLOYMENT_ID": "YOUR_GOOGLE_DEPLOYMENT_ID_HERE"
   }
   ```
3. Replace `YOUR_GOOGLE_DEPLOYMENT_ID_HERE` with the deployment ID from Google Apps Script.

## Usage

### Main Menu
When you run the script, you'll see the following options:

1. Record New Workout: Log a new workout by selecting the date, time, and workout details.
2. View Weekly Report: See a summary of your workouts for the current week.
3. View Total Report: Get a summary of all your logged workouts.
4. Edit or Delete a Session: Modify or remove an existing workout entry.

### Example Workflow
1. Log a Workout:
- Select "Record New Workout".
- Choose the date and time of your workout.
- Enter the number of pushups, squats, and whether you did Tabata.
2. View Your Progress:
- Select "View Weekly Report" to see your progress for the week.
- Select "View Total Report" for an all-time summary.
3. Edit a Workout:
- Select "Edit or Delete a Session".
- Choose a workout from the list and update the details.

### Example Code
Here’s an example of how the script interacts with Google Apps Script:

```javascript
// Add a new workout
addWorkout({
  action: "create",
  date: "2025-05-02",
  time: "10:00",
  pushups: 20,
  squats: 30,
  tabata: "Yes"
});
```

### Notes
Ensure your Google Sheets spreadsheet has the correct columns before using the script.
The script uses the local time of your device for logging workouts.

### Screenshots
(Add screenshots of the Scriptable app in action, showing the menu and workflow.)

### License
This project is open-source and available under the MIT License.

##
Happy logging! 💪