function testCreate() {

    let { date, time } = getDateAndTime()
    let pushups = getRandomNumber(60)
    let squats = getRandomNumber(80)
    let tabata = getRandomBoolean()


    let payload = {
        action: "create",
        date: date,
        time: time,
        pushups: pushups,
        squats: squats,
        tabata: tabata,
    }

    console.log(payload)
    return createWorkout(sheet, payload)
}

function testList() {
    let list = listWorkouts(sheet).getContent()
    console.log(list)
    // return listWorkouts(sheet)
}

function testListWorkoutsByDate() {

    let payload = {
        action: "listByDate",
        date: "2025-05-02",
    }

    console.log(payload)
    let list = listWorkoutsByDate(sheet, payload).getContent()
    console.log(list)
}

// === UTILS ===

function getRandomNumber(max) {
    return Math.floor(Math.random() * max) + 1
}

function getRandomBoolean() {
    return Math.random() < 0.5; // Returns true or false randomly
}

function getDateAndTime() {
    const now = new Date();
    console.log(now.toUTCString())


    // Get the date in YYYY-MM-DD format
    const date = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd") // Format date as YYYY-MM-DD
    // const date = now.toISOString().split("T")[0];

    // Get the time in HH:mm:ss format
    //const time = now.toISOString().split("T")[1].slice(0, 5);
    const time = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm") // Format time as HH:mm


    return { date, time };
}