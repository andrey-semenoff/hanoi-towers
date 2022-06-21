var ScoresTable = function(settings) {
    const buttonTableScores = document.getElementById('btn-table-scores');
    const overlay = document.getElementById('overlay');
    const modal = document.querySelector('#modal-scores');
    const tableTabs = modal.querySelector('.table-tabs');
    const storage = settings?.storage === 'local' ? localStorage : sessionStorage;
    const maxAmount = settings?.maxAmount ?? 5;
    let tableScoresLevelChosen = storage.getItem('level') ? parseInt(storage.getItem('level')) : 1;
    const events = {
        'new-record': [],
        'new-highest-record': []
    };

    init();

    function init() {
        setupEventListeners();
        setActiveTab();
    }

    this.onNewScore = function(event) {
        const newScore = event.payload;
        const scores = getScores(newScore.level);
        const recordPlace = isNewScoreRecord(newScore, scores);
        if(recordPlace === -1 && scores.length == maxAmount) {
            return;
        }
        playSound(recordPlace);
        const otherScores = getScores().filter(function(item) {
            return item.level !== newScore.level;
        });
        newScore.playerName = getPlayerName();
        scores.push(newScore);
        scores.sort(function(a, b) {
            const timeA = timeToSeconds(a.time);
            const timeB = timeToSeconds(b.time);
            if(timeA > timeB) {
                return 1;
            } else if (timeA < timeB) {
                return -1;
            }
            if(a.moves > b.moves) {
                return 1;
            } else if (a.moves < b.moves) {
                return -1;
            }
            return 0;
        });
        if(scores.length > maxAmount) {
            scores.pop();
        }
        writeScores(scores.concat(otherScores));
        showModal(null, recordPlace);
    }

    this.onSetLevel = function(event) {
        tableScoresLevelChosen = event.payload;
        setActiveTab();
    }

    function playSound(place) {
        place === 0 ? notify('new-highest-record') : notify('new-record');
    }

    function getPlayerName() {
        const playerName = prompt('Enter your name:', storage.getItem('playerName') ?? 'Noname');
        storage.setItem('playerName', playerName);
        return playerName;
    }
    
    function setupEventListeners() {
        buttonTableScores.addEventListener('click', showModal);

        overlay.addEventListener('click', hideModal);

        modal.querySelector('.modal-close').addEventListener('click', hideModal);

        tableTabs.querySelectorAll('.tab').forEach(item => {
            item.addEventListener('click', function(e) {
                tableScoresLevelChosen = e.target.cellIndex + 1;
                tableTabs.querySelector('.tab.active').classList.remove('active');
                item.classList.add('active');
                updateTable();
            });
        })
    }

    function getScores(level) {
        let result = [];
        try {
            const scoresString = storage.getItem('scores');
            if(scoresString) {
                const allScores = JSON.parse(scoresString);
                if(level !== undefined) {
                    result = allScores.filter(function(item) {
                        return parseInt(item.level) === level;
                    });    
                } else {
                    result = allScores;
                }
            }
        } catch(e) {
            console.warn(e);
        }
        return result;
    }

    function writeScores(scores) {
        return storage.setItem('scores', JSON.stringify(scores));
    }

    function timeToSeconds(timeString) {
        const [mins, secs] = timeString.split(':');
        return parseInt(secs) + parseInt(mins) * 60;
    }

    function showModal(e, recordPlace) {
        if(e) { e.preventDefault() }
        updateTable();
        overlay.classList.add('show');
        modal.classList.add('show');
        if(recordPlace !== undefined) {
            hignlightNewRow(recordPlace);
        }
    }

    function hideModal() {
        overlay.classList.remove('show');
        modal.classList.remove('show');
    }

    function createTableBody(scores) {
        let tbody = '';
        if(scores.length) {
            tbody = scores.reduce(function(acc, el, idx) {
                let tr = `<tr>
                    <td>${idx + 1}</td>
                    <td>${el.playerName}</td>
                    <td>${el.time}</td>
                    <td>${el.moves}</td>
                </tr>`;

                return acc + tr;
            }, '');
        } else {
            tbody = `<tr><td colspan="4">There is no scores yet</td></tr>`;
        }
        return tbody;
    }

    function updateTable() {
        const scores = getScores(tableScoresLevelChosen);
        const tbodyElement = modal.querySelector('.table-scores tbody');
        tbodyElement.innerHTML = createTableBody(scores);
    }

    function setActiveTab() {
        const activeTab = tableTabs.querySelector('.tab.active');
        if(activeTab) {
            activeTab.classList.remove('active');
        }
        tableTabs.querySelector(`.tab:nth-child(${tableScoresLevelChosen})`).classList.add('active');
    }

    function isNewScoreRecord(newScore, scores) {
        return scores.findIndex(function(score) {
            const timeA = timeToSeconds(newScore.time);
            const timeB = timeToSeconds(score.time);
            if(timeA > timeB) {
                return false;
            } else {
                if(timeA < timeB) {
                    return true;
                } else {
                    if(newScore.moves > score.moves) {
                        return true;
                    }    
                }
            }
        });
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
            console.warn(`Callback for event "${eventName}" should be has type of "function"`, callback);
        }
    }
    
    function notify(type, payload) {
        const subscribers = events[type] ?? [];
        for(let i = 0; i < subscribers.length; i++) {
            subscribers[i]({
                type,
                payload
            });
        }
    }

    function hignlightNewRow(idx) {
        const tr_blinked = modal.querySelector('.table-scores tbody tr:nth-child('+idx+')');
        tr_blinked.classList.add('blink');
        setTimeout(function() {
            tr_blinked.classList.remove('blink');
        }, 3000);

    }
}