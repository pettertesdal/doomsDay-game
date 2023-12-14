import { Scene } from "phaser";

export class MenuScene extends Scene {
    constructor () {
        super ({ key: 'MenuScene' })
    }

    preload ()

    {
        this.load.image('logo', 'assets/logo.svg');

    }
    create () {
        this.add.text(100, 100, 'Welcome to doomsday!', { font: "24px Courier", fill: "#ffffff", });
        this.add.text(100, 140, 'Choose a difficulty', { font: "24px Courier", fill: "#ffffff", });
        let easyButton = this.add.text(100, 200, "Easy", { fontSize: '24px', fill: '#0F0' })
        .setInteractive()
        .on('pointerdown', () => this.scene.start("PlayScene", { difficulty: 0 }));
        let mediumButton = this.add.text(100, 240, "Medium", { fontSize: '24px', fill: '#0F0' })
        .setInteractive()
        .on('pointerdown', () => this.scene.start("PlayScene", { difficulty: 1 }));
        let hardButton = this.add.text(100, 280, "Hard", { fontSize: '24px', fill: '#0F0' })
        .setInteractive()
        .on('pointerdown', () => this.scene.start("PlayScene", { difficulty: 2}));
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
        let year = new Date().getFullYear();
        let month = Phaser.Math.Between(0, 11);
        let day = Phaser.Math.Between(1, 31);
        return new Date(day, month, year);

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
        this.currentDate = this.generateRandomDate();
        this.dateText.setText(this.currentDate.getDate() + "." + this.currentDate.getMonth() + "." + this.currentDate.getFullYear());
    }

    calculateDoomsdayAlgorithm(date) {
        let day = date.getDay();
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
