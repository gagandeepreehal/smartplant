// Start a simple HTTP server
var express = require('express');
var https = require('https');
var io = require('socket.io');
var fs = require("fs");

let numberOfClients = 0;

// Log settings
let lastUpdated = new Date();
const logIntervalMinutes = 0.1;

var app = express();
app.use(express.static(__dirname + '/public'));


var privateKey = fs.readFileSync('privatekey.pem').toString();
var certificate = fs.readFileSync('certificate.pem').toString();


var httpOptions = {key: privateKey, cert: certificate};
https.createServer(httpOptions, app).listen(8000, () => {
    console.log(">> Serving on " + 8000);
});
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
})

function updateData(sensorData) {
    const now = new Date();
    if (numberOfClients > 0)
    {
        io.sockets.emit("sensor data", { data: sensorData });
    }
    // If log interval has elapsed log entry
    if (now.getTime() - lastUpdated.getTime() > logIntervalMinutes * 60 * 1000) {
        lastUpdated = now;

        // Add timestamp property to received sensorData object
        sensorData.timestamp = now;

        // Read log file
        fs.readFile("./log.json", "utf-8", (err, data) =>
        {
            if (err) return console.log(err);

            // Parse content of file to JavaScript object
            const log = JSON.parse(data);

            // Push new data to the array
            log.entries.push(sensorData);

            // Stringify object then save back to log file
            fs.writeFile("./log.json", JSON.stringify(log), "utf8", err =>
            {
                if (err) return console.log(err);
                console.log(`Logged data: ${now}`);
            });
        });
    }
}

function start() {

    // Start listening on port 8080
    app.listen(8080, () => {
        console.log("Express server listening on port 8080");
    });

    // Respond to http GET requests with index.html page
    app.get("/", (request, response) => {
        response.sendFile(`${__dirname}/public/index.html`);
    });

    // Return log file as JSON
    app.get("/plant-data", (request, response) => {
        response.setHeader("Content-Type", "application/json");

        // Read JSON file
        fs.readFile("./log.json", "utf-8", (err, data) => {
            if (err) return console.log(err);

            // Send response to the log
            response.send(data);
        });

    });
    // Define route folder for static requests
    app.use(express.static(`${__dirname}/public`));

    // Increment client counter if someone connects
    io.on("connection", socket => {
        numberOfClients++;

        // Decrement client counter if someone disconnects
        socket.on("disconnect", () => {
            numberOfClients--;
        });
    });
}

exports.start = start;
exports.updateData = updateData;
