"use strict"

var timer = new Timer();
var audioPlayer = new AudioPlayer();
var game = new Game({
    timer, 
    audioPlayer,
    countdown: 3
});
var scoresTable = new ScoresTable();
timer.on('tick', game.onTimerUpdate);
game.on('new-score', scoresTable.onNewScore);
game.on('set-level', scoresTable.onSetLevel);
scoresTable.on('new-record', game.onNewRecord);
scoresTable.on('new-highest-record', game.onNewHighestRecord);