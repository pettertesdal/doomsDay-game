import { Scene } from "phaser";
import { createCheatSheet } from "./CheatSheet.js";

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
    this.instructionText = this.add.bitmapText(
  this.isMobile ? 50 : this.scale.width / 2,
  150,
  "ari",
  "",
  instrFont
).setOrigin(this.isMobile ? 0 : 0.5, 0);

    this.inputText = this.add.bitmapText(this.scale.width / 2, 200, "ari", "", this.isMobile ? 0 : 32).setOrigin(0.5);
    this.feedbackText = this.add.bitmapText(this.scale.width / 2, 240, "ari", "", feedbackFont).setOrigin(0.5);

    this.calcText = this.add.bitmapText(this.scale.width / 2, 320, "ari", "", calcFont).setOrigin(0.5);
    this.calcDayText = this.add.bitmapText(this.scale.width / 2, 350, "ari", "", calcFont).setOrigin(0.5);

    // ✅ Cheat sheet (with arrow, input hide/show)
    this.cheatUI = createCheatSheet(this, this.isMobile);

    this.createSteps();

    if (this.isMobile) {
      // Visible input field
      this.inputElement = document.createElement("input");
      this.inputElement.type = "text";
      this.inputElement.maxLength = 20;
      this.inputElement.style.position = "absolute";
      this.inputElement.style.left = this.scale.canvas.offsetLeft + this.scale.width / 2 - 100 + "px";
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
    this.menuButton.on("pointerdown", () => {
      this.cleanupInput();
      this.scene.start("HowToScene", {
        exampleDay: this.exampleDay,
        exampleMonth: this.exampleMonth,
        exampleYear: this.exampleYear,
      });
    });

    // ✅ Now safe to show the first step
    this.showStep();

    // Cleanup on stop/destroy
    this.events.on("shutdown", this.cleanupInput, this);
    this.events.on("destroy", this.cleanupInput, this);
  }

  cleanupInput() {
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

    const stepText = typeof step.text === "function" ? step.text() : step.text;
    const maxChars = this.isMobile ? 22 : 35;
    const wrapped = stepText.replace(new RegExp(`(.{1,${maxChars}})(\\s|$)`, "g"), "$1\n");
    this.instructionText.setText(wrapped);

    const instrBounds = this.instructionText.getBounds();

    if (this.isMobile && this.inputElement) {
      this.inputElement.style.top = this.scale.canvas.offsetTop + instrBounds.bottom + 20 + "px";
      this.feedbackText.setY(instrBounds.bottom + 80);
      this.calcText.setY(instrBounds.bottom + 140);
      this.calcDayText.setY(instrBounds.bottom + 170);
      this.menuButton.setY(instrBounds.bottom + 230);
    } else {
      this.inputText.setY(instrBounds.bottom + 50);
      this.feedbackText.setY(instrBounds.bottom + 100);
      this.calcText.setY(instrBounds.bottom + 160);
      this.calcDayText.setY(instrBounds.bottom + 190);
      this.menuButton.setY(instrBounds.bottom + 250);
    }
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
}

