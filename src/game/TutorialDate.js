import { Scene } from "phaser";

export class TutorialDate extends Scene {
  constructor() {
    super({ key: "TutorialDate" });
  }

  preload() {
    this.load.bitmapFont("PixelGame", "assets/fonts/PixelGame.png", "assets/fonts/PixelGame.xml");
    this.load.bitmapFont("ari", "assets/fonts/ari-font.png", "assets/fonts/ari-font.xml");
  }

  init(data) {
    this.exampleDay = data.exampleDay;
    this.exampleMonth = data.exampleMonth;
    this.exampleYear = data.exampleYear;

    this.currentStep = 0;
    this.calculationParts = [];
    this.finalWeekday = undefined;
    this.finalUkedag = undefined;
    this.playerInput = "";
    this.isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Precompute values
    const yy = this.exampleYear % 100;
    this.fit12 = Math.floor(yy / 12);
    this.remainder = yy % 12;
    this.div4 = Math.floor(this.remainder / 4);
    this.anchor = this.getAnchorDay(this.exampleYear);
    this.total = this.fit12 + this.remainder + this.div4 + this.anchor;
    this.doomsday = this.total % 7;

    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const ukedager = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
    this.weekday = weekdays[this.doomsday];
    this.ukedag = ukedager[this.doomsday];

    const doomsdayDates = [3, 28, 14, 4, 9, 6, 11, 8, 5, 10, 7, 12];
    if ((this.exampleYear % 4 === 0 && this.exampleYear % 100 !== 0) || (this.exampleYear % 400 === 0)) {
      doomsdayDates[0] = 4;
      doomsdayDates[1] = 29;
    }
    this.diff = this.exampleDay - doomsdayDates[this.exampleMonth - 1];
    this.doomTotal = this.doomsday + this.diff;
    this.dayNumber = ((this.doomTotal % 7) + 7) % 7;

    this.finalWeekday = weekdays[this.dayNumber];
    this.finalUkedag = ukedager[this.dayNumber];
  }

  create() {
    this.cameras.main.setBackgroundColor(0xede6d1);

    const instrFont = this.isMobile ? 20 : 28;
    const feedbackFont = this.isMobile ? 22 : 28;
    const calcFont = this.isMobile ? 20 : 24;

    // Title
    const title = this.add
      .bitmapText(this.scale.width / 2, 40, "PixelGame", "DOOMSDAY TUTORIAL", this.isMobile ? 40 : 64)
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(3.5);
    this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 1500, ease: "Back.Out" });

    this.dateText = this.add
      .bitmapText(
        this.scale.width / 2,
        100,
        "ari",
        `Example Date: ${this.exampleDay}.${this.exampleMonth}.${this.exampleYear}`,
        this.isMobile ? 22 : 28
      )
      .setOrigin(0.5);

    this.instructionText = this.add.bitmapText(20, 140, "ari", "", instrFont);
    this.inputText = this.add.bitmapText(this.scale.width / 2, 200, "ari", "", this.isMobile ? 0 : 32).setOrigin(0.5);
    this.feedbackText = this.add.bitmapText(this.scale.width / 2, 240, "ari", "", feedbackFont).setOrigin(0.5);

    this.calcText = this.add.bitmapText(this.scale.width / 2, 320, "ari", "", calcFont).setOrigin(0.5);
    this.calcDayText = this.add.bitmapText(this.scale.width / 2, 350, "ari", "", calcFont).setOrigin(0.5);

    this.createCheatSheet();
    this.createSteps();
    this.showStep();

    if (this.isMobile) {
      // Visible input field
      this.inputElement = document.createElement("input");
      this.inputElement.type = "text";
      this.inputElement.maxLength = 20;
      this.inputElement.style.position = "absolute";
      this.inputElement.style.left = this.scale.canvas.offsetLeft + this.scale.width / 2 - 100 + "px";
      this.inputElement.style.top = this.scale.canvas.offsetTop + 180 + "px";
      this.inputElement.style.width = "200px";
      this.inputElement.style.height = "40px";
      this.inputElement.style.background = "#ede6d1";
      this.inputElement.style.color = "black";
      this.inputElement.style.border = "4px solid black";
      this.inputElement.style.textAlign = "center";
      this.inputElement.style.fontSize = "20px";
      this.inputElement.style.fontFamily = "PixelGame, monospace";
      this.inputElement.style.imageRendering = "pixelated";
      this.inputElement.style.letterSpacing = "2px";

      document.body.appendChild(this.inputElement);
      this.inputElement.focus();

      this.inputElement.addEventListener("input", () => {
        this.playerInput = this.inputElement.value;
      });

      this.inputElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.checkStep();
          this.inputElement.value = "";
          this.playerInput = "";
        }
      });
    } else {
      // Desktop keyboard input
      this.keyHandler = (event) => {
        if (event.key.length === 1) {
          if (/[0-9a-z\-]/i.test(event.key) || /[\u00C0-\u017F]/.test(event.key)) {
            this.playerInput += event.key;
            this.inputText.setText(this.playerInput);
          }
        } else if (event.key === "Backspace") {
          this.playerInput = this.playerInput.slice(0, -1);
          this.inputText.setText(this.playerInput);
        } else if (event.key === "Enter") {
          this.checkStep();
        }
      };
      this.input.keyboard.on("keydown", this.keyHandler);
    }

    // Back button
    this.menuButton = this.add
      .bitmapText(this.scale.width / 2, this.scale.height - 40, "PixelGame", "Back", this.isMobile ? 24 : 32)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);
    this.menuButton.on("pointerdown", () =>
      this.scene.start("HowToScene", {
        exampleDay: this.exampleDay,
        exampleMonth: this.exampleMonth,
        exampleYear: this.exampleYear,
      })
    );
  }

  shutdown() {
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = null;
    }
    if (this.keyHandler) {
      this.input.keyboard.off("keydown", this.keyHandler);
      this.keyHandler = null;
    }
  }

  // Utility
  getAnchorDay(year) {
    const century = Math.floor(year / 100);
    const anchorMap = { 19: 3, 20: 2, 21: 0 };
    return anchorMap[century] ?? 2;
  }

  // Steps
  createSteps() {
    this.steps = [
      {
        text: () => `Step 1: Subtract the doomsday date of the month (see cheatsheet) from ${this.exampleDay}.`,
        check: () => this.playerInput === String(this.diff),
        success: "✅ Good!",
        onSuccess: (val) => (this.calculationParts[0] = val),
      },
      {
        text: () => `Step 2: Add the doomsday number of that year (${this.doomsday}).`,
        check: () => this.playerInput === String(this.doomTotal),
        success: "✅ Correct!",
        onSuccess: () => {
          this.calculationParts[1] = this.doomsday;
          this.calculationParts[2] = `mod 7 (${this.doomTotal})`;
        },
      },
      {
        text: () => "Step 3: Reduce by 7 and write the remainder.",
        check: () => this.playerInput === String(this.dayNumber),
        success: "✅ Nice, one more step!",
        onSuccess: (val) => (this.calculationParts[2] = val),
      },
      {
        text: () => `Step 4: ${this.dayNumber} = which weekday?`,
        check: () => {
          const input = this.playerInput.trim().toLowerCase();
          return input === this.finalWeekday || input === this.finalUkedag;
        },
        success: "✅ You've found the weekday!",
      },
    ];
  }

  showStep() {
    if (this.currentStep >= this.steps.length) return;
    const step = this.steps[this.currentStep];
    this.playerInput = "";
    this.inputText.setText("");
    this.instructionText.setText(typeof step.text === "function" ? step.text() : step.text);
  }

  checkStep() {
    const step = this.steps[this.currentStep];
    if (step.check()) {
      this.feedbackText.setText(step.success);
      if (step.onSuccess) step.onSuccess(this.playerInput);

      this.calcText.setText(
        `mod 7(${this.calculationParts[0] || "difference"} + ${this.calculationParts[1] || "doomsday"}) = ${
          this.calculationParts[2] || "weekday"
        }`
      );

      this.currentStep++;
      if (this.currentStep < this.steps.length) {
        this.showStep();
      } else {
        this.menuButton.setAlpha(1);
      }
    } else {
      this.feedbackText.setText("❌ Wrong, try again.");
      this.playerInput = "";
      if (!this.isMobile) this.inputText.setText("");
      if (this.isMobile && this.inputElement) this.inputElement.value = "";
    }
  }

  // Cheat sheet
  createCheatSheet() {
    const panelWidth = 320;
    const panelHeight = 460;

    this.cheatPanel = this.add.container(this.scale.width, 80);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffcc, 1);
    bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 10);
    this.cheatPanel.add(bg);

    const monthText =
      "Month Doomsdays\nJan: 3/4*   Jul:11\nFeb:28/29*  Aug: 8\nMar:14       Sep: 5\nApr: 4       Oct:10\nMay: 9       Nov: 7\nJun: 6       Dec:12";
    this.cheatPanel.add(this.add.bitmapText(15, 15, "ari", monthText, 18));

    const leapText =
      "* Leap Year Rule:\nDivisible by 4 → Leap Year\nBut divisible by 100 → NOT\nExcept divisible by 400 → Leap\n\nEffect: Jan=4, Feb=29";
    this.cheatPanel.add(this.add.bitmapText(15, 160, "ari", leapText, 16));

    const anchorText = "Century Anchors\n1900s → 3 (Wed)\n2000s → 2 (Tue)\n2100s → 0 (Sun)";
    this.cheatPanel.add(this.add.bitmapText(15, 270, "ari", anchorText, 18));

    const weekdayText =
      "Weekday Numbers\n0 = Sun   1 = Mon\n2 = Tue   3 = Wed\n4 = Thu   5 = Fri\n6 = Sat";
    this.cheatPanel.add(this.add.bitmapText(15, 360, "ari", weekdayText, 18));

    const closeBtn = this.add
      .bitmapText(panelWidth - 25, 10, "ari", "X", 20)
      .setOrigin(0.5, 0)
      .setTint(0xaa0000)
      .setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", () => {
      this.tweens.add({ targets: this.cheatPanel, x: this.scale.width, duration: 300, ease: "Power2" });
      this.arrow.setVisible(true);
      this.cheatLabel.setVisible(true);
    });
    this.cheatPanel.add(closeBtn);

    const arrowX = this.scale.width - 50;
    const arrowY = 200;
    this.arrow = this.add.graphics();
    this.arrow.fillStyle(0x333333, 1);
    this.arrow.beginPath();
    this.arrow.moveTo(0, -20);
    this.arrow.lineTo(0, 20);
    this.arrow.lineTo(30, 0);
    this.arrow.closePath();
    this.arrow.fillPath();
    this.arrow.setPosition(arrowX, arrowY);
    this.arrow.setAngle(-10);

    this.cheatLabel = this.add
      .bitmapText(arrowX - 40, arrowY, "PixelGame", "CHEAT SHEET", 24)
      .setOrigin(1, 0.5)
      .setAngle(-15);

    this.arrow.setInteractive(new Phaser.Geom.Polygon([0, -20, 0, 20, 30, 0]), Phaser.Geom.Polygon.Contains);
    this.arrow.on("pointerdown", () => {
      this.arrow.setVisible(false);
      this.cheatLabel.setVisible(false);
      this.tweens.add({
        targets: this.cheatPanel,
        x: this.scale.width - panelWidth - 10,
        duration: 300,
        ease: "Power2",
      });
    });
  }
}

