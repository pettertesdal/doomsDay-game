import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super({ key: "PlayScene" });
    this.maxMistakes = 3;
  }

  preload() {
    this.load.bitmapFont(
      "PixelGame",
      "assets/fonts/PixelGame.png",
      "assets/fonts/PixelGame.xml"
    );
    this.load.bitmapFont(
      "ari",
      "assets/fonts/ari-font.png",
      "assets/fonts/ari-font.xml"
    );
  }

  init(data) {
    // Comes from backend /api/game/start
    this.runId = data.runId;
    this.seed = data.seed;
    this.difficulty = data.difficulty;

    // Init seeded RNG
    this.rng = this.mulberry32(this.seed);
    this.currentIndex = 0;
  }

  create() {
    this.cameras.main.setBackgroundColor(0xEDE6D1);

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const fontSize = isMobile ? 20 : 24;
    const titleSize = isMobile ? 36 : 48;

    this.timeLeft = [90, 120, 150][this.difficulty] || 90;
    this.streak = 1.0;
    this.score = 0;
    this.mistakes = 0;

    // UI
    this.scoreText = this.add.bitmapText(10, 10, "ari", "Score: 0", fontSize);
    this.mistakesText = this.add.bitmapText(10, 40, "ari", "Mistakes: 0", fontSize);
    this.timerText = this.add.bitmapText(10, 70, "ari", "Time: " + this.timeLeft, fontSize);

    // First date
    this.currentDateString = this.generateSeededDate(this.currentIndex++);
    this.dateText = this.add.bitmapText(this.scale.width / 2, 110, "ari", this.currentDateString, titleSize).setOrigin(0.5);

    this.helpText = this.add.bitmapText(this.scale.width / 2, 160, "ari", "Type or tap the weekday of the date", fontSize).setOrigin(0.5);

    this.inputText = this.add.bitmapText(this.scale.width / 2, 230, "ari", "", fontSize + 8).setOrigin(0.5);
    this.inputString = "";

    // Timer
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Keyboard input (desktop only)
    if (!isMobile) {
      this.input.keyboard.on("keydown", (event) => {
        if (event.key.length === 1) {
          this.inputString += event.key;
          this.inputText.setText(this.inputString);
        } else if (event.key === "Backspace") {
          this.inputString = this.inputString.slice(0, -1);
          this.inputText.setText(this.inputString);
        } else if (event.key === "Enter") {
          this.checkAnswer();
        }
      });
    }

    // Weekday Buttons (same as before) ...
    // (not rewriting fully here to save space, keep your existing button code)
  }

  // --- Seeded RNG (mulberry32) ---
  mulberry32(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // --- Generate a seeded random integer ---
  randomInt(min, max) {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  // --- Generate a date deterministically from seed+index ---
  generateSeededDate(index) {
    let today = new Date();
    let year;

    switch (this.difficulty) {
      case 0: // Easy → this year
        year = today.getFullYear();
        break;
      case 1: // Medium
        year = this.randomInt(1900, 2099);
        break;
      case 2: // Hard
        year = this.randomInt(1000, 2099);
        break;
    }

    let month = this.randomInt(0, 11);
    let day = this.randomInt(1, 28); // safer than 31, avoids invalid dates
    this.currentDate = new Date(year, month, day);
    return `${day}.${month + 1}.${year}`;
  }

  checkAnswer() {
    const correctDay = this.calculateDoomsdayAlgorithm(this.currentDate);
    const correctDay2 = this.calculateUkedag(this.currentDate);

    if (
      this.inputString.toLowerCase() === correctDay.toLowerCase() ||
      this.inputString.toLowerCase() === correctDay2.toLowerCase()
    ) {
      const scoreAdd = [10, 20, 30][this.difficulty] || 10;
      const timeAdd = [4, 5, 6][this.difficulty] || 4;
      this.score += scoreAdd * this.streak;
      this.streak += 0.1 * (this.difficulty + 1);
      this.timeLeft += timeAdd;

      this.scoreText.setText("Score: " + this.score);
      this.tweens.add({
        targets: this.scoreText,
        scale: { from: 1.2, to: 1 },
        duration: 200,
        ease: "Back.Out",
      });
    } else {
      this.streak = 1.0;
      this.mistakes++;
      this.mistakesText.setText("Mistakes: " + this.mistakes);
      this.tweens.add({
        targets: this.mistakesText,
        scale: { from: 1.2, to: 1 },
        duration: 200,
        ease: "Back.Out",
      });

      if (this.mistakes >= this.maxMistakes) {
        this.scene.start("EndScene", {
          score: this.score,
          difficulty: this.difficulty,
          runId: this.runId,
        });
        return;
      }
    }

    // Next date
    this.inputString = "";
    this.inputText.setText("");
    this.currentDateString = this.generateSeededDate(this.currentIndex++);
    this.dateText.setText(this.currentDateString);
  }

  updateTimer() {
    this.timeLeft--;
    this.timerText.setText("Time: " + this.timeLeft);

    if (this.timeLeft <= 10) {
      this.tweens.add({
        targets: this.timerText,
        alpha: 0.3,
        yoyo: true,
        repeat: 3,
        duration: 200,
      });
    }

    if (this.timeLeft <= 0) {
      this.timer.remove(false);
      this.scene.start("EndScene", {
        score: this.score,
        difficulty: this.difficulty,
        runId: this.runId,
      });
    }
  }

  calculateDoomsdayAlgorithm(date) {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdays[date.getDay()];
  }

  calculateUkedag(date) {
    const weekdays = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
    return weekdays[date.getDay()];
  }
}

