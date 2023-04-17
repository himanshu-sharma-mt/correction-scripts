const fs = require('fs');

const logFilePath = 'updatedUsers.txt'; // Replace with the path of your log file

// Function to write logs into a file
function writeLog(log) {
    // Append the log to the file with a newline character
    fs.appendFile(logFilePath, log + '\n', (err) => {
        if (err) {
            console.error('Error writing log:', err);
        } else {
            console.log('Log written to file:', log);
        }
    });
}

exports.writeLog = writeLog;