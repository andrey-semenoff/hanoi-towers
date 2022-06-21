var Game = function(settings) {
    const columnsAmount = 3;
    const timerDashboard = document.querySelector('.timer-inner');
    const movesDashboard = document.querySelector('.moves-inner .counter');
    const settingsLevel = document.getElementById('settings-level');
    const labelLevelValue = document.getElementById('label-level');
    const buttonStartStop = document.getElementById('button_start_stop');
    const countdownOverlay = document.getElementById('countdown');
    const timer = settings?.timer;
    const audioPlayer = settings?.audioPlayer;
    const storage = settings?.storage === 'local' ? localStorage : sessionStorage;
    const countdown = settings?.countdown ? settings?.countdown : 0;
    let blocksAmount = 3;
    let startColumnIndex = 1;
    let columns = [];
    let activeColumnIndex = null;
    let isRunning = false;
    let moves = 0;
    const events = {
        'new-score': [],
        'set-level': []
    };

    init();

    function init() {
        setupEventListeners();
        setupColumns();
        prepare();
        createCountdown();
    }

    this.onTimerUpdate = function(event) {
        if(event?.type === 'tick') {
            timerDashboard.innerHTML = event.payload;
        }
    }

    this.onNewRecord = function(event) {
        audioPlayer.playSoundRecord();
    }

    this.onNewHighestRecord = function(event) {
        audioPlayer.playSoundHighestRecord();
    }

    function setMoveCouter(moves) {
        movesDashboard.innerHTML = moves;
    }

    function prepare() {
        blocks = [];
        setGameLevel();
        resetColumns();
        renderColumns();
        setStartStopButtonState('start');
        moves = 0;
        setMoveCouter(moves);
    }

    function start() {
        prepare();
        setStartStopButtonState('stop');
        timer.reset();
        if(countdown) {
            runCountdown();
            audioPlayer.playSoundCountdown();
            setTimeout(go, countdown * 1000);
        } else {
            go();
        }
    }

    function go() {
        isRunning = true;
        columns[1].activateColumn();
        enableColumns();
        timer.start();
        audioPlayer.playMusic(true, true);  
    }

    function stop() {
        isRunning = false;
        disableColumns();
        setStartStopButtonState('start');
        timer.stop();
        audioPlayer.stop();
    }

    function setGameLevel(level) {
        if(level === undefined) {
            const levelPrev = storage.getItem('level');
            level = levelPrev ? parseInt(levelPrev) : 1;
            settingsLevel.value = level;
        }
        blocksAmount = level + 2;
        labelLevelValue.innerHTML = level;
        storage.setItem('level', level);
        notify('set-level', level);
    }

    function setupEventListeners() {
        // Moving blocks using keyboard arrows
        document.addEventListener('keyup', function(e) {
            let columnActive = null;
            let isMove = false;
            switch(e.key) {
                case 'ArrowUp':
                    columnActive = columns[activeColumnIndex];
                    if(!columnActive.isColumnHovered()) {
                        columnActive.getElement().click();
                        isMove = true;
                    }
                    break;
                case 'ArrowDown':
                    columnActive = columns[activeColumnIndex];
                    if(columnActive.isColumnHovered()) {
                        columnActive.getElement().click();
                        isMove = true;
                    }
                    break;
                case 'ArrowLeft':
                    if(activeColumnIndex > 0) {
                        columns[activeColumnIndex - 1].getElement().click();
                        isMove = true;
                    }
                    break;
                case 'ArrowRight':
                    if(activeColumnIndex < columns.length - 1) {
                        columns[activeColumnIndex + 1].getElement().click();
                        isMove = true;
                    }
            }

            if(isRunning && isMove) {
                setMoveCouter(++moves);
            }
        });

        // Click start/stop button
        buttonStartStop.addEventListener('click', function() {
            if(!isRunning) {
                start();
            } else {
                stop();
            }
        });

        // Change game level
        settingsLevel.addEventListener('change', function(e) {
            if(!isRunning) {
                setGameLevel(parseInt(e.target.value));
                resetColumns();
                renderColumns();
            }
        });
    }

    function setupColumns() {
        for(let i = 0; i < columnsAmount; i++) {
            let column = new Column(i);
            let columnElement = column.getElement();
            columnElement.addEventListener('click', function(e) {
                if(column.isColumnDisabled()) {
                    return;
                }
                if(!column.isColumnActive()) {
                    if(columns[activeColumnIndex].isColumnHovered()) {
                        let block = columns[activeColumnIndex].takeBlock();
                        if(block) {
                            column.addBlock(block);
                            column.setHasHoveredBlock(true);
                        }
                    }
                    inactivateColumns();
                    activeColumnIndex = i;
                }
                column.click();
                renderColumns();
                checkWin();
            });
            columns.push(column);
        }
    }

    function resetColumns() {
        disableColumns();
        inactivateColumns();
        columns[0].clear();
        columns[1].setBlocks(createBlocks());
        columns[2].clear();
        activeColumnIndex = 1;
    }

    function renderColumns() {
        for(let i = 0; i < columns.length; i++) {
            columns[i].render();
        }
    }

    function setStartStopButtonState(state) {
        if(state === 'start') {
            buttonStartStop.innerHTML = 'start';
            buttonStartStop.classList.add('button_start');
            buttonStartStop.classList.remove('button_stop');
        } else if (state === 'stop') {
            buttonStartStop.innerHTML = 'stop';
            buttonStartStop.classList.add('button_stop');
            buttonStartStop.classList.remove('button_start');
        }
    }

    function checkWin() {
        for(let i = 0; i < columns.length; i++) {
            if(i !== startColumnIndex && columns[i].check(blocksAmount)) {
                stop();
                audioPlayer.playSoundWin();
                notify('new-score', {
                    level: parseInt(settingsLevel.value),
                    time: timerDashboard.innerHTML,
                    moves
                });
                break;
            }
        }
    }

    function inactivateColumns(index) {
        for(let i = 0; i < columns.length; i++) {
            columns[i].inactivateColumn();
        }
    }

    function enableColumns() {
        for(let i = 0; i < columns.length; i++) {
            columns[i].enableColumn();
        }
    }

    function disableColumns() {
        for(let i = 0; i < columns.length; i++) {
            columns[i].disableColumn();
        }
    }

    function createBlocks() {
        let blocks = [];
        for(let i = 0; i < blocksAmount; i++) {
            let block = new Block(i);
            blocks.push(block);
        }
        return blocks;
    }

    this.on = function(eventName, callback) {
        if(eventName && typeof eventName === 'string') {
            if(!events.hasOwnProperty(eventName)) {
                return console.warn(`There is no event with type "${eventName}" in ${this.__proto__.constructor.name} object`);
            }
        } else {
            return console.warn('EventName should be has type of "string"', eventName);
        }

        if(typeof callback === 'function') {
            events[eventName].push(callback);
        } else {
            console.warn('Callback should be has type of "function"', callback);
        }
    }

    function notify(type, payload) {
        const subscribers = events[type];
        for(let i = 0; i < subscribers.length; i++) {
            subscribers[i]({
                type,
                payload
            });
        }
    }

    function createCountdown() {
        if(countdown) {
            for(let i = countdown; i > 0; i--) {
                const span = document.createElement('span', null);
                span.innerText = i;
                countdownOverlay.appendChild(span);
            }
        }
    }

    function runCountdown() {
        const numbers = countdownOverlay.querySelectorAll('span');
        let counter = 0;
        if(numbers.length) {
            countdownOverlay.classList.add('show');
            setTimeout(function() {
                countdownOverlay.classList.add('fadein');
            }, 0);
            setTimeout(function() {
                numbers[counter].classList.add('in');
                counter++;
            }, 0);

            const interval = setInterval(function() {
                numbers[counter - 1].classList.remove('in');
                numbers[counter].classList.add('in');
                if(++counter === numbers.length) {
                    clearInterval(interval);
                    setTimeout(function() {
                        numbers[counter - 1].classList.remove('in');
                        countdownOverlay.classList.remove('show');    
                    }, 1000);
                }
            }, 1000);
        }
    }
}