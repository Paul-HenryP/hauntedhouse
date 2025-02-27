// Event listener for the "Enter" key.
document.getElementById("command").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        processCommand(); // Calls the function when Enter is pressed.
    }
});

document.addEventListener("DOMContentLoaded", function() {
    //document.getElementById('main').style.display = 'none';
    //document.getElementById('footer').style.display = 'none';
    
    const instructionContent = document.getElementById("instructionContent");
    const toggleButton = document.getElementById("toggleInstructions");

    // Toggle the 'open' class to expand content initially.
    /*instructionContent.classList.toggle("open");
    toggleButton.classList.toggle("open");*/
    
});

// Event listener for the "Copy Log" button.
document.getElementById('copyLogButton').addEventListener('click', copyLogToClipboard);

// Initializes the leaderboard display when the page loads.
window.onload = function() {
    updateLeaderboardDisplay();
};

//To collapse instructions.
function toggleInstructions() {
    const instructionContent = document.getElementById("instructionContent");
    const toggleButton = document.getElementById("toggleInstructions");

    // Toggle the 'open' class to collapse/expand content.
    instructionContent.classList.toggle("open");
    toggleButton.classList.toggle("open");

    // Adjust the max-height for smooth transition.
    if (instructionContent.classList.contains("open")) {
        instructionContent.style.maxHeight = instructionContent.scrollHeight + "px";
    } else {
        instructionContent.style.maxHeight = "0";
    }
}

// Game state.
let playerPosition = "C1";
let keyPosition = "A1";
let ghostPosition = "B2"; // Ghost starts at B2 during the key-finding phase.
let doorPosition = null; // Initially, there is no door.
let hasKey = false;
let gameOver = false;
let layoutChanged = false; // Indicates if the layout has changed.
let ghostMovementComplete = false; // Indicates if the ghost has stopped moving.
let ghostBlockedDoor = false; // Indicates if the ghost has blocked the door in A3.
let ghostAlreadyMovedDownOnce = false; //Ghost has already moved down once.
let startTime = null; // Tracks the start time of the game.
let endTime = null;   // Tracks the end time of the game.
let stepCount = 0; // Tracks the number of steps taken by the player.
let moveLog = []; // Tracks the player's moves.


// Mapping of rooms and their directional neighbors
const roomMap = {
    "A1": { üles: null, alla: "A2", vasak: null, parem: "B1" },
    "A2": { üles: "A1", alla: "A3", vasak: null, parem: "B2" },
    "A3": { üles: "A2", alla: null, vasak: null, parem: "B3" },
    "B1": { üles: null, alla: "B2", vasak: "A1", parem: "C1" },
    "B2": { üles: "B1", alla: "B3", vasak: "A2", parem: "C2" },
    "B3": { üles: "B2", alla: null, vasak: "A3", parem: "C3" },
    "C1": { üles: null, alla: "C2", vasak: "B1", parem: null },
    "C2": { üles: "C1", alla: "C3", vasak: "B2", parem: null },
    "C3": { üles: "C2", alla: null, vasak: "B3", parem: null }
};

function copyLogToClipboard() {
    // Gets the moves log content.
    const movesLogContent = document.getElementById('movesLogContent').innerText;
    // Creates a temporary textarea element.
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = movesLogContent;
    document.body.appendChild(tempTextArea);
    // Selects the text and copy it to the clipboard.
    tempTextArea.select();
    document.execCommand('copy');
    // Removes the temporary textarea element.
    document.body.removeChild(tempTextArea);
    // Displays a message indicating that the log has been copied.
    alert('Käikude logi kopeeritud teie lõikelauale!');
}

// Processes player's command.
function processCommand() {
    if (gameOver) return;

    // Records the start time if the game is starting.
    if (!startTime) {
        startTime = new Date(); // Records the current time when the first move is made.
    }
    const command = document.getElementById("command").value.trim().toLowerCase();
    movePlayerByDirection(command);
    document.getElementById("command").value = "";
}

// Moves the player based on the direction.
function movePlayerByDirection(direction) {
    if (!["üles", "alla", "vasak", "parem"].includes(direction)) {
        displayMessage("Vale käsk. Palun sisesta korrektne käsk Näiteks: 'üles', 'alla', 'vasak', või 'parem'.");
        return;
    }

    const newRoom = roomMap[playerPosition][direction];
    if (newRoom) {
        moveLog.push(`Käik: ${direction}, ruumi: ${newRoom}`); // Logs the move.
        playerPosition = newRoom;
        stepCount++; // Increment.
        checkRoom();
    } else {
        moveLog.push(`Proovisid liikuda ${direction} aga seal oli sein.`); // Logs invalid move.
        stepCount++;
        displayMessage("Sa ei saa sinna liikuda. ");
    }
}

// Saves the score to the leaderboard.
function saveScore(timeTaken, steps) {
    // Get the existing leaderboard from localStorage, or start with an empty array.
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Formats the date in European style.
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed.
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}`;

    // Adds the new score to the leaderboard.
    leaderboard.push({ time: timeTaken.toFixed(2), steps: steps, date: formattedDate });

    // Sorts the leaderboard by time in ascending order (fastest times first).
    leaderboard.sort((a, b) => a.time - b.time);

    // Keep sonly the top 5 scores.
    leaderboard = leaderboard.slice(0, 5);

    // Saves the updated leaderboard back to localStorage.
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}


// Displays the leaderboard.
function updateLeaderboardDisplay() {
    // Gets the leaderboard data from localStorage
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    // Gets the leaderboard element
    const leaderboardElement = document.getElementById("leaderboard");
    // Clears the existing leaderboard display
    leaderboardElement.innerHTML = "<h2>Edetabel</h2>";

    // Adds each score to the leaderboard display
    leaderboard.forEach((entry, index) => {
        const scoreItem = document.createElement("p");
        scoreItem.textContent = `${index + 1}. Aeg: ${entry.time} sekundit, samme: ${entry.steps}, kuupäev: ${entry.date}`;
        leaderboardElement.appendChild(scoreItem);
    });
}



// Moves player to the specified room code. (Old function, not in use)
/*
function movePlayer(targetRoom) {
    const validRooms = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];

    // Checks if the target room is a valid room.
    if (validRooms.includes(targetRoom)) {
        // Checks if the target room is adjacent to the current room.
        if (isNearby(targetRoom)) {
            playerPosition = targetRoom;
            stepCount++;
            checkRoom();
        } else {
            stepCount++;
            displayMessage("Sa ei saa sinna liikuda. ");
        }
    } else {
        displayMessage("Vale käsk. Palun sisesta korrektne käsk (Näiteks: üles, alla, vasak, parem).");
    }
} */

// Checks current room status.
function checkRoom() {
    let message = "";

    if (playerPosition === ghostPosition) {
        endGame("Mäng läbi - kohtasid kummitust!");
        return;
    }

    if (playerPosition === keyPosition) {
        message += "Leidsid võtme! Teid ei hoiatata enam, kui kummitus on läheduses.";
        hasKey = true;
        keyPosition = null; // Removes the key from the room.
    }

    if (playerPosition === "A3") {
        if (ghostBlockedDoor) {
            endGame("Mäng läbi - Kohtasid kummitust!");
        } else if (!layoutChanged) {
            message += "Siin pole midagi huvitavat.";
        } else {
            endGame("Palju õnne! Olete pääsenud kummituste majast!");
        }
        displayMessage(message);
        return;
    }

    if (playerPosition === "C1" && hasKey && !layoutChanged) {
        // Layout changes once the player returns to C1 with the key.
        layoutChanged = true;
        doorPosition = "A3"; // Moves the door to A3.
        message += "Maja planeering on muutunud. Uks on liikunud ruumi, mis on teie praegusest ruumist maksimaalsel kaugusel. ";
    } else if ((playerPosition === "B1" || playerPosition === "C2") && layoutChanged && !ghostMovementComplete && !ghostAlreadyMovedDownOnce) {
        // Moves the ghost down by one room when the player reaches C2 or B1 after layout change.
        if (ghostPosition === "B2") {
            ghostPosition = "B3";
            ghostAlreadyMovedDownOnce = true;
            message += "Kummitus on liikunud ühe toa võrra allapoole. ";
        }
    } else if (playerPosition === "A2" && layoutChanged && !ghostMovementComplete && !ghostBlockedDoor) {
        // Moves the ghost left by one room when the player reaches A2 (ghost blocks the door).
        ghostPosition = "A3";
        ghostBlockedDoor = true; // Updates the flag since the ghost is now at A3.
        message += "Kummitus on liikunud ühe toa võrra vasakule. ";
    } else if ((playerPosition === "A1" || playerPosition === "B2") && layoutChanged && ghostBlockedDoor && !ghostMovementComplete) {
        // Move the ghost two rooms to the right when the player moves from A1 or B2.
        ghostBlockedDoor = false; // Updates the flag since the ghost is now not at A3.
        if (ghostPosition === "A2") {
            ghostPosition = "C2"; // Move the ghost from A2 to C2.
        } else if (ghostPosition === "A3") {
            ghostPosition = "C3"; // Move the ghost from A3 to C3.
        }
        message += "Kummitus on liikunud kaks tuba paremale. ";
        ghostMovementComplete = true; // The ghost will no longer move after this.
    }

    // Checks for nearby entities if no special event has occurred.
    checkForNearbyEntities(message);
}

// Modified checkForNearbyEntities to accept a message parameter.
function checkForNearbyEntities(existingMessage) {
    let messages = [];
    if (isNearby(ghostPosition) && !layoutChanged && !hasKey) {
        messages.push("Kummitus on läheduses. ");
    }
    if (isNearby(keyPosition) && !hasKey) {
        messages.push("Võti on läheduses. ");
    }
    let combinedMessage = existingMessage + " " + messages.join(" ").trim();
    if (combinedMessage.trim()) {
        displayMessage(combinedMessage);
    } else {
        displayMessage("Siin pole midagi huvitavat. ");
    }
}

// Checks if a position is adjacent.
function isNearby(position) {
    const adjacentRooms = {
        "A1": ["A2", "B1"], "B1": ["A1", "B2", "C1"], "C1": ["B1", "C2"],
        "A2": ["A1", "A3", "B2"], "B2": ["B1", "B3", "A2", "C2"], "C2": ["B2", "C3", "C1"],
        "A3": ["A2", "B3"], "B3": ["A3", "B2", "C3"], "C3": ["B3", "C2"]
    };
    return position && adjacentRooms[playerPosition].includes(position);
}

// Displays the messages with an optional additional class.
function displayMessage(msg, extraClass = null) {
    if (!msg || !msg.trim()) return; // Does nothing if the message is empty or just whitespace.

    const output = document.getElementById("output");

    // Clears the existing highlight for older messages.
    Array.from(output.children).forEach(child => {
        child.classList.remove("latest-message");
    });

    // Creates a new message element and add the latest-message class.
    const newMessage = document.createElement("p");
    newMessage.innerHTML = msg;
    newMessage.classList.add("latest-message");

    // If an extra class is provided (e.g., "success-message"), adds it.
    if (extraClass) {
        newMessage.classList.add(extraClass);
    }
    // Adds the new message to the top of the output.
    output.prepend(newMessage);
}

function openMovesLogModal() {
    // Populates the moves log content.
    var movesLogContent = document.getElementById('movesLogContent');
    movesLogContent.innerHTML = ''; // Clears previous content.

    moveLog.forEach(move => {
        var logEntry = document.createElement('p');
        logEntry.textContent = move;
        movesLogContent.appendChild(logEntry);
    });

    // Displays the modal.
    modal.style.display = 'block';
}

function endGame(message) {
    gameOver = true;
    // Records the end time.
    endTime = new Date();
    // Calculates the total time taken.
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds.
    // Combines the game result, time taken, and step count into a single message.
    const finalMessage = `${message} Aega kulus: ${timeTaken.toFixed(2)} sekundit. Samme: ${stepCount}.`;
    // Checks if the game was won or lost.
    const isSuccess = message.includes("pääsenud kummituste majast");
    // Displays the final message with the success-message class if the game was won.
    displayMessage(finalMessage, isSuccess ? "success-message" : null);
    // Saves the score to the leaderboard only if the player escaped successfully.
    if (isSuccess) {
        saveScore(timeTaken, stepCount);
        updateLeaderboardDisplay();
    }
    
    // openMovesLogModal();
}

var modal = document.getElementById('movesLogModal');
// Get the <span> element that closes the modal.
var span = document.getElementsByClassName('close')[0];
// When the user clicks on <span> (x), closes the modal.
span.onclick = function() {
    modal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, closes it.
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}


 /*
//languageModal
function redirectEng() {
    window.location.href = "index.html"; //the eng version URL
}

function closeModal() {
    document.getElementById('languageModal').style.display = 'none';
    document.getElementById('main').style.display = 'block'; // Shows stuff.
    document.getElementById('footer').style.display = 'block';
}
*/
