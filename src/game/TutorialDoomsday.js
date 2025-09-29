import { Scene } from "phaser";

export class TutorialDoomsday extends Scene {
  constructor() {
    super({ key: "TutorialDoomsday" });
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
  }

  create() {
    this.cameras.main.setBackgroundColor(0xede6d1);

    const title = this.add
      .bitmapText(this.scale.width / 2, 50, "PixelGame", "DOOMSDAY TUTORIAL", this.isMobile ? 40 : 64)
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(3);

    this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 1200, ease: "Back.Out" });

    this.dateText = this.add
      .bitmapText(
        this.scale.width / 2,
        120,
        "ari",
        `Example Date: ${this.exampleDay}.${this.exampleMonth}.${this.exampleYear}`,
        this.isMobile ? 20 : 28
      )
      .setOrigin(0.5);

    const instructionFontSize = this.isMobile ? 18 : 28;
    const feedbackFontSize = this.isMobile ? 20 : 28;

    this.instructionText = this.add.bitmapText(50, 150, "ari", "", instructionFontSize);
    this.inputText = this.add.bitmapText(this.scale.width / 2, 220, "ari", "", this.isMobile ? 0 : 32).setOrigin(0.5);
    this.feedbackText = this.add.bitmapText(this.scale.width / 2, 270, "ari", "", feedbackFontSize).setOrigin(0.5);

    this.calcText = this.add.bitmapText(this.scale.width / 2, 370, "ari", "", this.isMobile ? 18 : 24).setOrigin(0.5);

    this.createCheatSheet();
    this.createSteps();
    this.showStep();

    if (this.isMobile) {
      // Proper visible input field
      this.inputElement = document.createElement("input");
      this.inputElement.type = "text";
      this.inputElement.maxLength = 20;
      this.inputElement.style.position = "absolute";
      this.inputElement.style.left = this.scale.canvas.offsetLeft + this.scale.width / 2 - 100 + "px";
      this.inputElement.style.top = this.scale.canvas.offsetTop + 200 + "px";
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
      // Desktop: listen to keys directly
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

    this.menuButton = this.add
      .bitmapText(this.scale.width / 2, this.isMobile ? 460 : 500, "PixelGame", "Back", this.isMobile ? 24 : 32)
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

  getAnchorDay(year) {
    const century = Math.floor(year / 100);
    const anchorMap = { 19: 3, 20: 2, 21: 0 };
    return anchorMap[century] ?? 2;
  }

  createSteps() {
    this.steps = [
      { text: () => `Step 1: How many times does 12 fit into the last two numbers of the year?`,
        check: () => this.playerInput === String(this.fit12),
        success: "✅ Good!",
        onSuccess: (val) => (this.calculationParts[0] = val),
      },
      { text: () => `Step 2: What is remaining, after the last step?`,
        check: () => this.playerInput === String(this.remainder),
        success: "✅ Correct!",
        onSuccess: (val) => (this.calculationParts[1] = val),
      },
      { text: () => `Step 3: Divide the remainder (${this.remainder}) by 4 and round down`,
        check: () => this.playerInput === String(this.div4),
        success: "✅ Nice!",
        onSuccess: (val) => (this.calculationParts[2] = val),
      },
      { text: () => `Step 4: Add the century anchor. What is it? (see the cheat sheet)`,
        check: () => this.playerInput === String(this.anchor),
        success: "✅ Almost there!",
        onSuccess: (val) => (this.calculationParts[3] = val),
      },
      { text: () => `Step 5: Add them all together. What total do you get?`,
        check: () => this.playerInput === String(this.total),
        success: "✅ Correct!",
        onSuccess: (val) => (this.calculationParts[5] = "mod 7("+val+")"),
      },
      { text: () => `Step 6: Reduce the total by 7 as many times as you can, and write what is remaining.`,
        check: () => this.playerInput === String(this.doomsday),
        success: "✅ Yes! You have the number, but what day is it?",
        onSuccess: (val) => (this.calculationParts[5] = val),
      },
      { text: () => `Step 7: Which weekday is ${this.doomsday}?`,
        check: () => {
          const input = this.playerInput.trim().toLowerCase();
          return input === this.weekday || input === this.ukedag;
        },
        success: `✅ Correct! ${this.weekday} is the doomsday of year ${this.exampleYear}!`,
        onSuccess: (val) => (this.finalWeekday = val),
      }
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
  }

  checkStep() {
    const step = this.steps[this.currentStep];
    if (step.check()) {
      this.feedbackText.setText(step.success);
      if (step.onSuccess) step.onSuccess(this.playerInput);

      this.calcText.setText(
        `mod 7(${this.calculationParts[0] || "fit12"} + ${this.calculationParts[1] || "rem"} + ${this.calculationParts[2] || "÷4"} + ${this.calculationParts[3] || "anchor"}) = ${this.calculationParts[5] || "?"}`
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

  createCheatSheet() {
    const panelWidth = 320;
    this.cheatPanel = this.add.container(this.scale.width, 80);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffcc, 1);
    bg.fillRoundedRect(0, 0, panelWidth, 460, 10);
    this.cheatPanel.add(bg);

    this.cheatPanel.add(this.add.bitmapText(15, 15, "ari",
      "Month Doomsdays\nJan: 3/4* Jul:11\nFeb:28/29* Aug: 8\nMar:14 Sep: 5\nApr: 4 Oct:10\nMay: 9 Nov: 7\nJun: 6 Dec:12",
      this.isMobile ? 14 : 18
    ));
  }
}

