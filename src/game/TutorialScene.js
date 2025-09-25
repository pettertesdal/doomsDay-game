import { Scene } from "phaser";

export class TutorialScene extends Scene {
  constructor() {
    super({ key: "TutorialScene" });
    this.currentStep = 0;
    this.calculationParts = [];
    this.dayDiff = undefined;
    this.finalWeekday = undefined;
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

    // Random date
    this.exampleYear = Phaser.Math.Between(1900, 2099);
    this.exampleMonth = Phaser.Math.Between(1, 12);
    const daysInMonth = new Date(this.exampleYear, this.exampleMonth, 0).getDate();
    this.exampleDay = Phaser.Math.Between(1, daysInMonth);

    this.dateText = this.add
      .bitmapText(this.scale.width / 2, 120, "PixelGame", 
        `Example Date: ${this.exampleDay}.${this.exampleMonth}.${this.exampleYear}`, 28)
      .setOrigin(0.5);

    // Instruction + input + feedback
    this.instructionText = this.add.bitmapText(50, 150, "PixelGame", "", 28);
    this.inputText = this.add.bitmapText(this.scale.width / 2, 220, "PixelGame", "", 32).setOrigin(0.5);
    this.feedbackText = this.add.bitmapText(this.scale.width / 2, 270, "PixelGame", "", 28).setOrigin(0.5);
    this.playerInput = "";

    // Blackboard formulas
    this.formulaText = this.add
      .bitmapText(this.scale.width / 2, 350, "pixel", "(fit12 + remainder + fit4 + anchor) mod 7 = Doomsday", 24)
      .setOrigin(0.5);
    this.calcText = this.add.bitmapText(this.scale.width / 2, 390, "pixel", "", 24).setOrigin(0.5);
    this.calcDayText = this.add.bitmapText(this.scale.width / 2, 430, "pixel", "", 24).setOrigin(0.5);

    // Cheat sheet panel (offscreen)
    this.createCheatSheet();

    // Tutorial steps
    this.createSteps();

    this.showStep();

    // Keyboard input
    this.input.keyboard.on("keydown", (event) => {
      if (event.key.length === 1 && /[0-9-]/.test(event.key)) {
        this.playerInput += event.key;
        this.inputText.setText(this.playerInput);
      } else if (event.key === "Backspace") {
        this.playerInput = this.playerInput.slice(0, -1);
        this.inputText.setText(this.playerInput);
      } else if (event.key === "Enter") {
        this.checkStep();
      }
    });

    // Hidden input for mobile
    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'text';
    this.hiddenInput.style.position = 'absolute';
    this.hiddenInput.style.opacity = 0;   // invisible
    this.hiddenInput.style.pointerEvents = 'none'; // don’t block clicks
    document.body.appendChild(this.hiddenInput);

    // Listen to changes
    this.hiddenInput.addEventListener('input', () => {
      this.playerInput = this.hiddenInput.value;
      this.inputText.setText(this.playerInput);
    });

    // Enter = check step
    this.hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.checkStep();
        this.hiddenInput.value = '';
        this.playerInput = '';
        this.inputText.setText('');
      }
    });

    // When scene starts, focus the input
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      this.input.on("pointerdown", () => {
        this.hiddenInput.focus();
      });
    }

    // Back to Menu button
    this.menuButton = this.add
      .bitmapText(this.scale.width / 2, 500, "PixelGame", "Back to Menu", 32)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);
    this.menuButton.on("pointerdown", () => this.scene.start("MenuScene"));
    this.menuButton.on("pointerover", () => {
      this.menuButton.setTint(0x00ff00);
      this.menuButton.setScale(1.2);
    });
    this.menuButton.on("pointerout", () => {
      this.menuButton.clearTint();
      this.menuButton.setScale(1);
    });
  }

  createSteps() {
    const getAnchorDay = (year) => {
      const century = Math.floor(year / 100);
      const anchorMap = {19: 3, 20: 2, 21: 0}; // Sat=0..Fri=6 mapping
      return anchorMap[century] ?? 2;
    };

    this.steps = [
      {
        text: () => `Step 1: How many times does 12 fit into the last two numbers of the year?`,
        check: () => this.playerInput === String(Math.floor((this.exampleYear % 100) / 12)),
        success: "✅ Good! Press Enter for remainder step.",
        onSuccess: (val) => (this.calculationParts[0] = val),
      },
      {
        text: () => `Step 2: What is left, after the last step?`,
        check: () => this.playerInput === String(Math.floor((this.exampleYear % 100) % 12)),
        success: "✅ Good! Press Enter to continue.",
        onSuccess: (val) => (this.calculationParts[1] = val),
      },
      {
        text: () => `Step 3: Divide the remainder ${this.exampleYear % 100 % 12} by 4 → type the result`,
        check: () => this.playerInput === String(Math.floor((this.exampleYear % 100 % 12) / 4)),
        success: "✅ Nice! Next, add the century anchor day.",
        onSuccess: (val) => (this.calculationParts[2] = val),
      },
      {
        text: () => `Step 4: Add the century anchor. What is it?`,
        check: () => this.playerInput === String(getAnchorDay(this.exampleYear)),
        success: "✅ Almost there! Press Enter to reduce mod 7.",
        onSuccess: (val) => (this.calculationParts[3] = val),
      },
      {
        text: () => `Step 5: Reduce total mod 7 (0=Sun..6=Sat)`,
        check: () => {
          const total = Math.floor((this.exampleYear % 100) / 12) + (this.exampleYear % 100 % 12) + Math.floor((this.exampleYear % 100 % 12)/4) + getAnchorDay(this.exampleYear);
          return this.playerInput === String(total % 7);
        },
        success: "✅ Correct! This is the year's Doomsday.",
        onSuccess: (val) => (this.calculationParts[4] = val),
      },
      {
        text: () => {
          const doomsdayDates = [3,28,14,4,9,6,11,8,5,10,7,12];
          if ((this.exampleYear%4===0 && this.exampleYear%100!==0) || (this.exampleYear%400===0)) {
            doomsdayDates[0]=4; doomsdayDates[1]=29;
          }
          const dd = doomsdayDates[this.exampleMonth-1];
          return `Step 6: Subtract doomsday date for month (${dd}) from today (${this.exampleDay})`;
        },
        check: () => {
          const doomsdayDates = [3,28,14,4,9,6,11,8,5,10,7,12];
          if ((this.exampleYear%4===0 && this.exampleYear%100!==0) || (this.exampleYear%400===0)) {
            doomsdayDates[0]=4; doomsdayDates[1]=29;
          }
          const diff = this.exampleDay - doomsdayDates[this.exampleMonth-1];
          return this.playerInput === String(diff);
        },
        success: "✅ Good! Press Enter to finish.",
        onSuccess: (val) => (this.dayDiff = val),
      },
      {
        text: () => `Step 7: Add your difference to the Doomsday weekday mod 7.`,
        check: () => {
          const total = Math.floor((this.exampleYear % 100) / 12) + (this.exampleYear % 100 % 12) + Math.floor((this.exampleYear % 100 % 12)/4) + getAnchorDay(this.exampleYear);
          const weekday = total % 7;
          const doomsdayDates = [3,28,14,4,9,6,11,8,5,10,7,12];
          if ((this.exampleYear%4===0 && this.exampleYear%100!==0) || (this.exampleYear%400===0)) {
            doomsdayDates[0]=4; doomsdayDates[1]=29;
          }
          const diff = this.exampleDay - doomsdayDates[this.exampleMonth-1];
          return this.playerInput === String((weekday+diff+7)%7);
        },
        success: "✅ You've found the weekday!",
        onSuccess: (val) => (this.finalWeekday = val),
      }
    ];
  }

  showStep() {
    const step = this.steps[this.currentStep];
    this.playerInput = "";
    this.inputText.setText("");
    this.feedbackText.setText("");
    this.instructionText.setText(typeof step.text==="function"?step.text():step.text);
  }

  checkStep() {
    const step = this.steps[this.currentStep];
    if(step.check()) {
      this.feedbackText.setText(step.success);
      if(step.onSuccess) step.onSuccess(this.playerInput);

      // Update calculation formula text
      this.calcText.setText(
        `(${this.calculationParts[0]||'?'} + ${this.calculationParts[1]||'?'} + ${this.calculationParts[2]||'?'} + ${this.calculationParts[3]||'?'} ) mod 7 = ${this.calculationParts[4]||'?'}`
      );

      if(this.dayDiff!==undefined) {
        this.calcDayText.setText(
          `(${this.calculationParts[4]} + ${this.dayDiff}) mod 7 = ${this.finalWeekday||'?'}`
        );
      }

      this.currentStep++;
      if(this.currentStep<this.steps.length) {
        this.input.keyboard.once("keydown-ENTER",()=>this.showStep());
      } else {
        this.menuButton.setAlpha(1);
      }
    } else {
      this.feedbackText.setText("❌ Wrong, try again.");
      this.playerInput="";
      this.inputText.setText("");
    }
  }

  createCheatSheet() {
    const panelWidth = 250;
    const panelHeight = 400;

    this.cheatPanel = this.add.container(this.scale.width, 100);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffcc, 1);
    bg.fillRoundedRect(0,0,panelWidth,panelHeight,10);
    this.cheatPanel.add(bg);

    const text = this.add.bitmapText(10, 10, "PixelGame",
      "Month Doomsdays:\nJan:3\nFeb:28\nMar:14\nApr:4\nMay:9\nJun:6\nJul:11\nAug:8\nSep:5\nOct:10\nNov:7\nDec:12\n\nCentury Anchors:\n1900s:3\n2000s:2\n2100s:0", 18
    );
    this.cheatPanel.add(text);

    // Arrow
    const arrowX = this.scale.width - 50;
    const arrowY = 200;
    this.arrow = this.add.graphics();
    this.arrow.fillStyle(0x333333,1);
    this.arrow.beginPath();
    this.arrow.moveTo(0,-20);
    this.arrow.lineTo(0,20);
    this.arrow.lineTo(30,0);
    this.arrow.closePath();
    this.arrow.fillPath();
    this.arrow.setPosition(arrowX, arrowY);
    this.arrow.setAngle(-10);

    this.cheatLabel = this.add.bitmapText(arrowX-40,arrowY,"PixelGame","CHEAT SHEET",24).setOrigin(1,0.5).setAngle(-15);

    // Arrow interactive
    this.arrow.setInteractive(new Phaser.Geom.Polygon([0,-20,0,20,30,0]), Phaser.Geom.Polygon.Contains);
    this.arrow.on("pointerdown", () => {
      this.arrow.setVisible(false);
      this.cheatLabel.setVisible(false);
      this.tweens.add({targets:this.cheatPanel,x:this.scale.width-panelWidth-10,duration:300,ease:"Power2"});
    });

    // Cheat panel interactive
    this.cheatPanel.setSize(panelWidth,panelHeight);
    this.cheatPanel.setInteractive(new Phaser.Geom.Rectangle(0,0,panelWidth,panelHeight),Phaser.Geom.Rectangle.Contains);
    this.cheatPanel.on("pointerdown",()=>{
      this.tweens.add({targets:this.cheatPanel,x:this.scale.width,duration:300,ease:"Power2"});
      this.arrow.setVisible(true);
      this.cheatLabel.setVisible(true);
    });
  }
}

