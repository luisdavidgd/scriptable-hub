# Fixture Generator

## Description
The **Fixture Generator** is a script designed to create and manage tournament fixtures. It automates the process of generating match schedules for tournaments, leagues, or other competitive events.

## Features
- Automatically generates fixtures for a given number of teams.
- Supports round-robin or knockout formats.
- Outputs the schedule in a structured format for easy use.

## Usage
### Parameters
- `teams` (array): A list of team names participating in the tournament.
- `format` (string): The tournament format (`round-robin` or `knockout`).
- `startDate` (string): The start date of the tournament (format `YYYY-MM-DD`).
- `interval` (number): The number of days between matches.

### Example Input
```javascript
const params = {
  teams: ["Team A", "Team B", "Team C", "Team D"],
  format: "round-robin",
  startDate: "2025-05-01",
  interval: 2
};
```

### Example Output
For a round-robin format:
```json
[
  { "match": 1, "team1": "Team A", "team2": "Team B", "date": "2025-05-01" },
  { "match": 2, "team1": "Team C", "team2": "Team D", "date": "2025-05-03" },
  { "match": 3, "team1": "Team A", "team2": "Team C", "date": "2025-05-05" },
  { "match": 4, "team1": "Team B", "team2": "Team D", "date": "2025-05-07" },
  { "match": 5, "team1": "Team A", "team2": "Team D", "date": "2025-05-09" },
  { "match": 6, "team1": "Team B", "team2": "Team C", "date": "2025-05-11" }
]
```

## Setup
1. Copy the script into your preferred environment (e.g., Scriptable, Node.js, or a browser-based JavaScript runtime).
2. Provide the required parameters (`teams`, `format`, `startDate`, `interval`).
3. Run the script to generate the fixtures.

## Notes
- The script assumes all teams play an equal number of matches in a round-robin format.
- For knockout tournaments, the script generates matches for each round until a winner is determined.
- Ensure the `startDate` is provided in the correct format (`YYYY-MM-DD`).

## Example Workflow
1. Define the list of teams and tournament format.
2. Run the script with the desired parameters.
3. Use the generated fixture schedule for managing the tournament.

## Dependencies
- None. The script is standalone and does not require external libraries.

## License
This project is open-source and available under the MIT License.