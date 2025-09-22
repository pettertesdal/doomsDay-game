import { Scene } from "phaser";

export class PlayScene extends Scene {
    constructor () {
        super({ key: 'PlayScene' });
        this.maxMistakes = 3;
    }

    preload () {
        this.load.bitmapFont('PixelGame', 'assets/fonts/PixelGame.png', 'assets/fonts/PixelGame.xml');
    }

    create(data) {
        this.cameras.main.setBackgroundColor(0xEDE6D1);

        this.score = 0;
        this.mistakes = 0;
        this.timeLeft = 120;
        this.difficulty = data.difficulty;

        // Score, mistakes, timer
        this.scoreText = this.add.bitmapText(10, 10, 'PixelGame', 'Score: 0', 24);
        this.mistakesText = this.add.bitmapText(10, 50, 'PixelGame', 'Mistakes: 0', 24);
        this.timerText = this.add.bitmapText(10, 90, 'PixelGame', 'Time: ' + this.timeLeft, 24);

        // Current date
        this.currentDateString = this.generateRandomDate();
        this.dateText = this.add.bitmapText(this.scale.width / 2, 150, 'PixelGame', this.currentDateString, 48)
            .setOrigin(0.5);

        // Player input
        this.inputText = this.add.bitmapText(this.scale.width / 2, 250, 'PixelGame', '', 32).setOrigin(0.5);
        this.inputString = '';

        // Timer
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Keyboard input
        this.input.keyboard.on('keydown', (event) => {
            if (event.key.length === 1) {
                // Add letter
                this.inputString += event.key;
                this.inputText.setText(this.inputString);
            } else if (event.key === 'Backspace') {
                this.inputString = this.inputString.slice(0, -1);
                this.inputText.setText(this.inputString);
            } else if (event.key === 'Enter') {
                this.checkAnswer();
            }
        });
    }

    checkAnswer() {
        const correctDay = this.calculateDoomsdayAlgorithm(this.currentDate);

        if (this.inputString.toLowerCase() === correctDay.toLowerCase()) {
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            this.tweens.add({ targets: this.scoreText, scale: { from: 1.2, to: 1 }, duration: 200, ease: 'Back.Out' });
        } else {
            this.mistakes++;
            this.mistakesText.setText('Mistakes: ' + this.mistakes);
            this.tweens.add({ targets: this.mistakesText, scale: { from: 1.2, to: 1 }, duration: 200, ease: 'Back.Out' });

            if (this.mistakes >= this.maxMistakes) {
                this.scene.start('EndScene', { score: this.score });
                return;
            }
        }

        // Reset input and generate new date
        this.inputString = '';
        this.inputText.setText('');
        this.currentDateString = this.generateRandomDate();
        this.dateText.setText(this.currentDateString);
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText('Time: ' + this.timeLeft);

        if (this.timeLeft <= 10) {
            this.tweens.add({ targets: this.timerText, alpha: 0.3, yoyo: true, repeat: 3, duration: 200 });
        }

        if (this.timeLeft <= 0) {
            this.timer.remove(false);
            this.scene.start('EndScene', { score: this.score });
        }
    }

    generateRandomDate() {
        let today = new Date();
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
        month++;
        return day + "." + month + "." + year;
    }

    calculateDoomsdayAlgorithm(date) {
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return weekdays[date.getDay()];
    }
}

