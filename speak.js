const say = require("say");
const interval = 1;
let lastSpoken = new Date();
const express = require("express");
const app = express();
const socket = io();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";
recognition.continuous = true;
document.querySelector('button').addEventListener('click', () => {
  recognition.start();
});
recognition.addEventListener('result', (e) => {
  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;
  socket.emit('chat message', text);
  console.log('Confidence: ' + e.results[0][0].confidence);

});
recognition.onresult = function(event) {
    console.info(`You said : ${event.results[i][0].transcript}`);
    socket.emit('chat message', text);
    }
plant = {
    answer: {
        greet: [
            "Hello amigos!",
            "Namaste sir ji!",
            "Good day."
        ],
        intro: [
            "I am a talking plant!",
            "My name is smart plant."
        ],
        reply: [
            "That's what she said! Haha!"
        ]
    },
    complain: {
        hot: [
            "It's too hot in here.",
            "It's really warm in here",
            "I can't take this temperature",
            "My leaves are burning",
            "Can someone turn off the heating please?"
        ],
        cold: [
            "It's too cold in here.",
            "It's really cold in here",
            "It's freezing",
            "I can't take this temperature",
            "Can someone turn up the heating please?"
        ]
    }
}
function interpret(sensorData) {
    let message = "";
    const now = new Date();
    const currentHour = now.getHours();
    if(app.matchWords(
        ["weather", "temperature", "hot", "cold", "warm"], text))
    {
        app.answer(
            plant.answer.greet(Math.floor(Math.random()*plant.answer.greet.length)) + " " + sensorData.celsius + " degrees");
    }
    if(app.matchWords(
        ["name", "plant", "introduction", "hello"], text))
    {
        app.answer(
            plant.answer.intro(Math.floor(Math.random()*plant.answer.intro.length)) + " ");
    }
    if(app.matchWords(
        ["looking", "smart", "handsome", "good"], text))
    {
        app.answer(
            plant.answer.reply(Math.floor(Math.random()*plant.answer.reply.length)) + " ");
    }
    if (sensorData.celsius < 18) {
        message += plant.complain.cold(Math.floor(Math.random()*plant.complain.cold.length)) + `It's ${sensorData.celsius} degrees in here. Turn on the heating or put me out in the sun.`;

    } else if (sensorData.celsius > 25) {
        message += plant.complain.cold(Math.floor(Math.random()*plant.complain.cold.length)) + `It's ${sensorData.celsius} degrees in here. Open the window or move me away from the sun.`;
    }

    if (sensorData.light < 25 && currentHour < 20 && currentHour > 6) {
        message += "It's too dark in here. I'm scared. Switch the lights on!";
    }

    if (sensorData.moisture < 35) {
        message += "I'm thirsty. Water me please! My soil is dry.";
    }

    if (message === "") {
        message += "I'm happy right now! Everything is fine. By the way, are you happy too?";
    }
    if (now.getTime() - lastSpoken.getTime() > interval * 1000 * 15) {
        say.speak(message);
        lastSpoken = now;
    }
}

exports.interpret = interpret;
