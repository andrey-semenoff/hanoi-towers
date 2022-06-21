var Timer = function() {
    let mins = 0,
        secs = 0,
        interval,
        events = {
            'tick': []
        };

    this.start = function() {
        this.reset();
        interval = setInterval(function() {
            tick();
        }, 1000);
    }

    this.stop = function() {
        clearInterval(interval);
    }

    this.reset = function() {
        mins = 0;
        secs = 0;
        notify('tick', getTime());
    }

    function getTime() {
        let minsString = mins.toString().length === 1 ? `0${mins.toString()}` : mins.toString();
        let secsString = secs.toString().length === 1 ? `0${secs.toString()}` : secs.toString();
        return `${minsString}:${secsString}`;
    }

    function tick() {
        if(secs < 60) {
            secs++;
        } else {
            secs = 0;
            if(mins < 60) {
                mins++;
            } else {
                mins = 0;
            }
        }
        notify('tick', getTime());
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
}