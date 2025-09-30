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

  create(data) {
    this.cameras.main.setBackgroundColor(0xEDE6D1);

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const fontSize = isMobile ? 20 : 24;
    const titleSize = isMobile ? 36 : 48;

    this.difficulty = data.difficulty;
    this.timeLeft = [90, 120, 150][this.difficulty] || 90;

    this.streak = 1.0;
    this.score = 0;
    this.mistakes = 0;

    // Score, mistakes, timer
    this.scoreText = this.add.bitmapText(10, 10, "ari", "Score: 0", fontSize);
    this.mistakesText = this.add.bitmapText(
      10,
      40,
      "ari",
      "Mistakes: 0",
      fontSize
    );
    this.timerText = this.add.bitmapText(
      10,
      70,
      "ari",
      "Time: " + this.timeLeft,
      fontSize
    );

    // Current date
    this.currentDateString = this.generateRandomDate();
    this.dateText = this.add
      .bitmapText(
        this.scale.width / 2,
        110,
        "ari",
        this.currentDateString,
        titleSize
      )
      .setOrigin(0.5);

    this.helpText = this.add
      .bitmapText(
        this.scale.width / 2,
        160,
        "ari",
        "Type or tap the weekday of the date",
        fontSize
      )
      .setOrigin(0.5);

    // Player input
    this.inputText = this.add
      .bitmapText(this.scale.width / 2, 230, "ari", "", fontSize + 8)
      .setOrigin(0.5);
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

    // Hidden input for mobile (to bring up keyboard if needed)
    this.hiddenInput = document.createElement("input");
    this.hiddenInput.type = "text";
    this.hiddenInput.style.position = "fixed";
    this.hiddenInput.style.bottom = "-100px"; // offscreen
    this.hiddenInput.style.left = "-100px";
    this.hiddenInput.style.width = "1px";
    this.hiddenInput.style.height = "1px";
    this.hiddenInput.style.opacity = 0;
    this.hiddenInput.style.pointerEvents = "none";

    document.body.appendChild(this.hiddenInput);

    this.hiddenInput.addEventListener("input", () => {
      this.playerInput = this.hiddenInput.value;
      this.inputText.setText(this.playerInput);
      this.inputString = this.playerInput;
    });

    this.hiddenInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.checkAnswer();
        this.hiddenInput.value = "";
        this.inputString = "";
        this.inputText.setText("");
      }
    });

    // --- Weekday Buttons ---
    const weekdaysEN = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const buttonYStart = isMobile ? 380 : 320;
    const buttonSpacingY = isMobile ? 40 : 50;
    const buttonCols = isMobile ? 2 : 4;
    const buttonSpacingX = isMobile ? 160 : 180;

    const totalRows = Math.ceil(weekdaysEN.length / buttonCols);

    weekdaysEN.forEach((day, i) => {
      const row = Math.floor(i / buttonCols);
      const col = i % buttonCols;

      // Items in this row
      const itemsInRow =
        row === totalRows - 1 && weekdaysEN.length % buttonCols !== 0
          ? weekdaysEN.length % buttonCols
          : buttonCols;

      // Row width in pixels
      const rowWidth = (itemsInRow - 1) * buttonSpacingX;

      // Left offset so that row is centered
      const startX = this.scale.width / 2 - rowWidth / 2;

      const x = startX + col * buttonSpacingX;
      const y = buttonYStart + row * buttonSpacingY;

      const btn = this.add
        .bitmapText(x, y, "PixelGame", day, fontSize)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setTint(0x0000ff);

      btn.on("pointerdown", () => {
        this.inputString = day; // simulate typing
        this.inputText.setText(day);
        this.checkAnswer();
      });

      btn.on("pointerover", () => btn.setTint(0x00ff00));
      btn.on("pointerout", () => btn.setTint(0x0000ff));
    });
  }

  shutdown() {
    if (this.hiddenInput) {
      document.body.removeChild(this.hiddenInput);
      this.hiddenInput = null;
    }
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
        });
        return;
      }
    }

    this.inputString = "";
    this.inputText.setText("");
    this.currentDateString = this.generateRandomDate();
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
      this.scene.start("EndScene", { score: this.score, difficulty: this.difficulty });
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

  // pick a month between 0–11
  let month = Phaser.Math.Between(0, 11);

  // find the last day of this month in this year
  let daysInMonth = new Date(year, month + 1, 0).getDate();

  // pick a valid day
  let day = Phaser.Math.Between(1, daysInMonth);

  this.currentDate = new Date(year, month, day);

  // format: day.month.year (1-based month)
  return `${day}.${month + 1}.${year}`;
}


  calculateDoomsdayAlgorithm(date) {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return weekdays[date.getDay()];
  }

  calculateUkedag(date) {
    const weekdays = [
      "Søndag",
      "Mandag",
      "Tirsdag",
      "Onsdag",
      "Torsdag",
      "Fredag",
      "Lørdag",
    ];
    return weekdays[date.getDay()];
  }
}

