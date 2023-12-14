import { Scene } from "phaser";

export class PlayScene extends Scene {
    constructor () {
        super ({ key: 'PlayScene' })
        this.keyMap = {
            '48': 'Sunday',    // Key code for '0'
            '49': 'Monday',    // Key code for '1'
            '50': 'Tuesday',   // Key code for '2'
            '51': 'Wednesday', // Key code for '3'
            '52': 'Thursday',  // Key code for '4'
            '53': 'Friday',    // Key code for '5'
            '54': 'Saturday',  // Key code for '6'
        };
    }

    preload ()

    {
        this.load.image('logo', 'assets/logo.svg');

    }
    create (data) {
        //this.add.text(100, 100, 'PlayScene', { font: "24px Courier", fill: "#ffffff", });
        this.score = 0;
        this.timeLeft = 120;
        this.difficulty = data.difficulty;

        this.timerText = this.add.text(10, 10, 'Time: 120', { fontSize: '32px', fill: '#FFF' });
        this.scoreText = this.add.text(10, 50, 'score: 0', { fontSize: '32px', fill: '#FFF' });

        this.currentDateString = this.generateRandomDate();
        this.dateText = this.add.text(100, 100, this.currentDateString, { fontSize: '32px', fill: '#FFF' });

        this.createDayButtons();

        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.input.keyboard.on('keydown', (event) => {
            if (this.keyMap[event.keyCode]) {
                this.checkAnswers(this.keyMap[event.keyCode]);
                console.log("pressed " + this.keyMap[event.keyCode])
            }
        })
        this.input.keyboard.on('keydown_ZERO', () => this.checkAnswers('Sunday'));
        this.input.keyboard.on('keydown_ONE', () => this.checkAnswers('Monday'));
        this.input.keyboard.on('keydown_TWO', () => this.checkAnswers('Tuesday'));
        this.input.keyboard.on('keydown_THREE', () => this.checkAnswers('Wedensday'));
        this.input.keyboard.on('keydown_FOUR', () => this.checkAnswers('Thursday'));
        this.input.keyboard.on('keydown_FIVE', () => this.checkAnswers('Friday'));
        this.input.keyboard.on('keydown_SIX', () => this.checkAnswers('Saturday'));
        
    }
    
    updateTimer() {
        this.timeLeft--;
        this.timerText.setText('Time: ' + this.timeLeft);

        if (this.timeLeft <= 0) {
            this.timer.remove(false);

            this.scene.start('EndScene', { score: this.score });
        }
    }

    generateRandomDate() {
        // For now it only generates for this year
        let today = new Date()
        let year;
        
        switch (this.difficulty) {
            case 0:
                year = today.getFullYear();
                break;
            case 1:
                year = Phaser.Math.Between(1900, 2099);
                break;
            case 2:
                year = Phaser.Math.Between(1000, 2099);
                break;
        }

        let month = Phaser.Math.Between(0, 11);
        let day = Phaser.Math.Between(1, 31);
        this.currentDate = new Date(year, month, day);
        month++ 
        return (day + "." + month + "." + year)
    }

    createDayButtons() {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wedensday', 'Thursday', 'Friday', 'Saturday'];
        daysOfWeek.forEach((day, index) => {
            let button = this.add.text(100, 200 + (index * 40), day, { fontSize: '24px', fill: '#0F0' })
            .setInteractive()
            .on('pointerdown', () => this.checkAnswers(day));
        });
    }

    checkAnswers(selectedDay) {
        let correctDay = this.calculateDoomsdayAlgorithm(this.currentDate);
        if (selectedDay == correctDay) {
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
        }
        this.currentDateString = this.generateRandomDate();
        this.dateText.setText(this.currentDateString);
        console.log(correctDay)
    }

    calculateDoomsdayAlgorithm(date) {
        console.log(date)
        let day = date.getDay();
        console.log(day)
        let weekday = "";
        switch (day) {
            case 0:
                weekday = "Sunday";
                break;
            case 1:
                weekday = "Monday";
                break;
            case 2:
                weekday = "Tuesday";
                break;
            case 3:
                weekday = "Wedensday";
                break;
            case 4:
                weekday = "Thursday";
                break;
            case 5:
                weekday = "Friday";
                break;
            case 6:
                weekday = "Saturday";
                break;
        }
        return weekday
    }
}
