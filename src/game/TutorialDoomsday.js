import { Scene } from "phaser";

export class TutorialDoomsday extends Scene {
  constructor() {
    super({ key: "TutorialDoomsday" });
  }

  preload() {
    this.load.bitmapFont(
      "PixelGame",
      "assets/fonts/PixelGame.png",
      "assets/fonts/PixelGame.xml"
    );
    this.load.bitmapFont(
      "pixel",
      "assets/fonts/pixel.png",
      "assets/fonts/pixel.xml"
    );
  }

  init(data) {
    // Store data
    this.exampleDay = data.exampleDay;
    this.exampleMonth = data.exampleMonth;
    this.exampleYear = data.exampleYear;

    console.log("Init got:", data);

    // Reset state each time
    this.currentStep = 0;
    this.calculationParts = [];
    this.dayDiff = undefined;
    this.finalWeekday = undefined;
    this.playerInput = "";

    // --- Precompute values for tutorial ---
    const yy = this.exampleYear % 100;
    this.fit12 = Math.floor(yy / 12);
    this.remainder = yy % 12;
    this.div4 = Math.floor(this.remainder / 4);
    this.anchor = this.getAnchorDay(this.exampleYear);
    this.total = this.fit12 + this.remainder + this.div4 + this.anchor;
    this.doomsday = this.total % 7; // final number 0=Sun..6=Sat

    const weekdays = ["sunday", "monday", "tuesday", "wedensday", "thursday", "friday", "saturday"];
    this.weekday = weekdays[this.doomsday];
  }

  create() {
    this.cameras.main.setBackgroundColor(0xede6d1);

    // Title
    const title = this.add
    .bitmapText(this.scale.width / 2, 50, "PixelGame", "DOOMSDAY TUTORIAL", 64)
    .setOrigin(0.5)
    .setAlpha(0)
    .setScale(4);
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 1500,
      ease: "Back.Out",
    });

    this.dateText = this.add
      .bitmapText(
        this.scale.width / 2,
        120,
        "PixelGame",
        `Example Date: ${this.exampleDay}.${this.exampleMonth}.${this.exampleYear}`,
        28
      )
      .setOrigin(0.5);

    // Instruction + input + feedback
    this.instructionText = this.add.bitmapText(50, 150, "PixelGame", "", 28);
    this.inputText = this.add
      .bitmapText(this.scale.width / 2, 220, "PixelGame", "", 32)
      .setOrigin(0.5);
    this.feedbackText = this.add
      .bitmapText(this.scale.width / 2, 270, "PixelGame", "", 28)
      .setOrigin(0.5);

    this.calcText = this.add
      .bitmapText(this.scale.width / 2, 390, "pixel", "", 24)
      .setOrigin(0.5);
    this.calcDayText = this.add
      .bitmapText(this.scale.width / 2, 430, "pixel", "", 24)
      .setOrigin(0.5);

    // Cheat sheet panel (offscreen)
    this.createCheatSheet();

    // Tutorial steps
    this.createSteps();
    this.showStep();

    // Keyboard input (⚠️ keep reference if you later want to clean it up)
    this.keyHandler = (event) => {
      if (event.key.length === 1) {
        if (/[0-9-]/.test(event.key)) {
          // numbers and dash
          this.playerInput += event.key;
        } else if (/[a-z]/i.test(event.key)) {
          // letters
          this.playerInput += event.key;
        }
        this.inputText.setText(this.playerInput);
      } else if (event.key === "Backspace") {
        this.playerInput = this.playerInput.slice(0, -1);
        this.inputText.setText(this.playerInput);
      } else if (event.key === "Enter") {
        this.checkStep();
      }
    };

    this.input.keyboard.on("keydown", this.keyHandler);

    // Back to Menu button
    this.menuButton = this.add
      .bitmapText(this.scale.width / 2, 500, "PixelGame", "Back", 32)
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
    this.menuButton.on("pointerover", () => {
      this.menuButton.setTint(0x00ff00);
      this.menuButton.setScale(1.2);
    });
    this.menuButton.on("pointerout", () => {
      this.menuButton.clearTint();
      this.menuButton.setScale(1);
    });

    // Cleanup keyboard listener
    this.events.on("shutdown", () => {
      if (this.keyHandler) {
        this.input.keyboard.off("keydown", this.keyHandler);
        this.keyHandler = null;
      }
    });
  }

  // --- Utility ---
  getAnchorDay(year) {
    const century = Math.floor(year / 100);
    const anchorMap = { 19: 3, 20: 2, 21: 0 }; // Sat=0..Fri=6 mapping
    return anchorMap[century] ?? 2;
  }

  // --- Steps ---
  createSteps() {
    this.steps = [
      {
        text: () => `Step 1: How many times does 12 fit into the last two numbers of the year?`,
        check: () => this.playerInput === String(this.fit12),
        success: "✅ Good!",
        onSuccess: (val) => (this.calculationParts[0] = val),
      },
      {
        text: () => `Step 2: What is left, after the last step?`,
        check: () => this.playerInput === String(this.remainder),
        success: "✅ Correct!",
        onSuccess: (val) => (this.calculationParts[1] = val),
      },
      {
        text: () => `Step 3: Divide the remainder (${this.remainder}) by 4`,
        check: () => this.playerInput === String(this.div4),
        success: "✅ Nice! Next, add the century anchor day.",
        onSuccess: (val) => (this.calculationParts[2] = val),
      },
      {
        text: () => `Step 4: Add the century anchor. What is it? (see the cheat sheet)`,
        check: () => this.playerInput === String(this.anchor),
        success: "✅ Almost there!",
        onSuccess: (val) => (this.calculationParts[3] = val),
      },
      {
        text: () => `Step 5: Add them all together. What total do you get?`,
        check: () => this.playerInput === String(this.total),
        success: "✅ Correctomundo",
        onSuccess: (val) => (this.calculationParts[5] = "mod 7("+val+")"),
      },
      {
        text: () => `Step 6: Reduce the total modulo 7 (0=Sun..6=Sat).`,
        check: () => this.playerInput === String(this.doomsday),
        success: "✅ Yes! You have the number, but what day is it?",
        onSuccess: (val) => (this.calculationParts[5] = val),
      },
      {
        text: () => `Step 7: Which weekday is ${this.doomsday}?`,
        check: () => {
          return (
            this.playerInput.trim().toLowerCase() ===
              this.weekday
          );
        },
        success: `✅ Correct! ${this.weekday} is the doomsday of year ${this.exampleYear}!`,
        onSuccess: (val) => (this.finalWeekday = val),
      }
    ];
  }

  showStep() {
    if (this.currentStep >= this.steps.length) {
      console.warn("No step to show, currentStep =", this.currentStep);
      return;
    }
    const step = this.steps[this.currentStep];
    this.playerInput = "";
    this.inputText.setText("");
    this.instructionText.setText(
      typeof step.text === "function" ? step.text() : step.text
    );
  }

  checkStep() {
    const step = this.steps[this.currentStep];
    if (step.check()) {
      this.feedbackText.setText(step.success);
      if (step.onSuccess) step.onSuccess(this.playerInput);

      // Update calculation formula text
      this.calcText.setText(
        `mod 7(${this.calculationParts[0] || "fit12"} + ${this.calculationParts[1] || "remainder"} + ${
this.calculationParts[2] || "fit4"
} + ${this.calculationParts[3] || "century anchor"}) = ${
this.calculationParts[5] || "Doomsday"
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
      this.inputText.setText("");
    }
  }

  // --- Cheat sheet UI unchanged ---
  createCheatSheet() {
    const panelWidth = 250;
    const panelHeight = 400;

    this.cheatPanel = this.add.container(this.scale.width, 100);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffcc, 1);
    bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 10);
    this.cheatPanel.add(bg);

    const text = this.add.bitmapText(
      10,
      10,
      "PixelGame",
      "Month Doomsdays:\nJan:3\nFeb:28\nMar:14\nApr:4\nMay:9\nJun:6\nJul:11\nAug:8\nSep:5\nOct:10\nNov:7\nDec:12\n\nCentury Anchors:\n1900s:3\n2000s:2\n2100s:0",
      18
    );
    this.cheatPanel.add(text);

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

    this.arrow.setInteractive(
      new Phaser.Geom.Polygon([0, -20, 0, 20, 30, 0]),
      Phaser.Geom.Polygon.Contains
    );
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

    this.cheatPanel.setSize(panelWidth, panelHeight);
    this.cheatPanel.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, panelWidth, panelHeight),
      Phaser.Geom.Rectangle.Contains
    );
    this.cheatPanel.on("pointerdown", () => {
      this.tweens.add({
        targets: this.cheatPanel,
        x: this.scale.width,
        duration: 300,
        ease: "Power2",
      });
      this.arrow.setVisible(true);
      this.cheatLabel.setVisible(true);
    });
  }
}

