# TCG Collection Manager

## Description
The **TCG Collection Manager** is a project designed to help manage and track a Trading Card Game (TCG) collection. It consists of two main components:

1. **Google Apps Script API Backend**: A backend service that interacts with a Google Sheets spreadsheet to store and retrieve collection data.
2. **Scriptables**: Frontend scripts designed to fetch, process, and display the collection data on devices like iPhones or iPads using the Scriptable app.

This project allows users to:
- Track their TCG collection.
- Check which cards they own and which are missing.
- Compare their collection against a deck list.
- Keep the collection data synchronized between devices.

## Structure
The project is organized as follows:

### `Google Apps Script/`
Contains the backend API implemented in Google Apps Script. This script interacts with a Google Sheets spreadsheet to manage the collection data.

- **Purpose**: Acts as the data source for the Scriptables.
- **Endpoints**:
  - `getCollection`: Fetches the collection data in JSON format.

### `Poke Vault.js`
A Scriptable script that fetches the collection data from the Google Apps Script API and allows users to search for specific cards in their collection.

- **Features**:
  - Fetches and caches the collection data locally.
  - Allows searching for cards by name.
  - Displays results, including owned and missing cards.

### `Deck Checker.js`
A Scriptable script that compares a deck list against the user's collection to identify missing cards.

- **Features**:
  - Parses a deck list provided as input.
  - Compares the deck list against the collection data.
  - Displays a report of owned and missing cards, along with suggestions for replacements.

## Setup
### Google Apps Script
1. Open the Google Apps Script editor.
2. Link the script to a Google Sheets spreadsheet.
3. Ensure the spreadsheet has a sheet named `collection` with the following columns:
   - `Normal`: Quantity of the card owned.
   - `Name`: Name of the card.
   - `Set`: Set to which the card belongs.
   - `Number`: Card's number within the set.
4. Deploy the script as a web app and copy the deployment URL.

### Scriptables
1. Install the Scriptable app on your iPhone or iPad.
2. Copy the `Poke Vault.js` and `Deck Checker.js` scripts into the Scriptable app.
3. Update the `GOOGLE_DEPLOYMENT_ID` in the configuration files (`pokeVault.json` and `deckChecker.json`) with the deployment ID of your Google Apps Script.

## Usage
### Poke Vault
1. Run the `Poke Vault.js` script in Scriptable.
2. Enter a search term (e.g., "Pikachu").
3. View the results, including owned and missing cards.

### Deck Checker
1. Run the `Deck Checker.js` script in Scriptable.
2. Provide a deck list as input.
3. View the comparison report, including owned cards, missing cards, and suggestions for replacements.

## Notes
- The collection data is cached locally in the `Data/ptcgp.csv` file and is updated every 48 hours.
- Ensure the Google Apps Script API is deployed and accessible before running the Scriptables.

## Example Workflow
1. Add your TCG collection data to the Google Sheets spreadsheet.
2. Use the `Poke Vault.js` script to search for specific cards in your collection.
3. Use the `Deck Checker.js` script to compare your collection against a deck list.

## Dependencies
- **Google Apps Script**: For the backend API.
- **Scriptable App**: For running the frontend scripts on iOS devices.

## License
This project is open-source and available under the [MIT License](LICENSE).