var AudioPlayer = function() {
    const player = new Audio();
    const musicTracks = {
        'arabic': 'audio/music/Arabic-music.mp3',
        'brazillian-drummers': 'audio/music/Brazillian-drummers.mp3',
        'curious-news': 'audio/music/Curious-news.mp3',
        'dragon-punch': 'audio/music/Dragon-Punch.mp3',
        'flower-of-desert': 'audio/music/Flower-of-desert.mp3',
        'indian-treasure': 'audio/music/Indian-Treasure.mp3',
        'ronin': 'audio/music/Ronin.mp3',
        'thrill-of-the-chase': 'audio/music/Thrill-of-the-chase.mp3',
    };
    const soundTracks = {
        'achievement': 'audio/sound/achievement.mp3',
        'countdown-1': 'audio/sound/countdown_1.mp3',
        'countdown-2': 'audio/sound/countdown_2.mp3',
        'countdown-3': 'audio/sound/countdown_3.mp3',
        'fanfare-1': 'audio/sound/fanfare_1.mp3',
        'fanfare-2': 'audio/sound/fanfare_2.mp3',
        'fanfare-3': 'audio/sound/fanfare_3.mp3',
    };
    let music = musicTracks['brazillian-drummers'];
    const soundCountdown = soundTracks['countdown-1'];
    const soundWin = soundTracks['fanfare-1'];
    const soundRecord = soundTracks['achievement'];
    const soundHigestRecord = soundTracks['fanfare-2'];
    
    this.play = function(fadeIn, repeat) {
        if(fadeIn) {
            player.volume = 0;
            const interval = setInterval(() => {
                player.volume = player.volume + 0.1;
            }, 200);
            setTimeout(function() {
                clearInterval(interval);
            }, 2000);
        }
        player.play();

        if(repeat) {
            player.addEventListener('ended', function() {
                player.play();
            });    
        }
    }

    this.stop = function(fadeOut) {
        player.pause();
    }

    this.playMusic = function(fadeIn) {
        this.stop();
        player.src = music;
        this.play(fadeIn);
    }

    this.playSoundCountdown = function() {
        this.stop();
        player.src = soundCountdown;
        this.play();
    }

    this.playSoundWin = function() {
        this.stop();
        player.src = soundWin;
        this.play();
    }

    this.playSoundRecord = function() {
        this.stop();
        player.src = soundRecord;
        this.play();
    }

    this.playSoundHighestRecord = function() {
        this.stop();
        player.src = soundHigestRecord;
        this.play();
    }
}