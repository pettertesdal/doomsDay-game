import { Scene } from "phaser";

export class HowToScene extends Scene {
  constructor() {
    super({ key: 'HowToScene' });
  }

  preload() {
    this.load.bitmapFont('PixelGame', 'assets/fonts/PixelGame.png', 'assets/fonts/PixelGame.xml');
    this.load.bitmapFont("ari", "assets/fonts/ari-font.png", "assets/fonts/ari-font.xml");
  }

  init(data) {
    if (data.exampleDay) {
      this.exampleDay = data.exampleDay;
      this.exampleMonth = data.exampleMonth;
      this.exampleYear = data.exampleYear;
    } else {
      this.exampleYear = Phaser.Math.Between(1900, 2099);
      this.exampleMonth = Phaser.Math.Between(1, 12);
      const daysInMonth = new Date(this.exampleYear, this.exampleMonth, 0).getDate();
      this.exampleDay = Phaser.Math.Between(1, daysInMonth);
    }
  }

  create() {
    this.cameras.main.setBackgroundColor(0xEDE6D1);

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const fontSize = isMobile ? 18 : 24;
    const titleSize = isMobile ? 48 : 64;
    const lineHeight = isMobile ? 30 : 40;

    this.createCheatSheet(isMobile);

    // --- Title ---
    const title = this.add.bitmapText(this.scale.width / 2, 50, 'PixelGame', 'HOW TO PLAY', titleSize)
    .setOrigin(0.5)
    .setAlpha(0)
    .setScale(3);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 1200,
      ease: 'Back.Out'
    });

    // --- Instructions ---
    const instructions = [
      "Things to know:",
      "Doomsdays: Each year we know a few dates", 
      "that always have the same weekday",
      "These are doomsdays, Therefore we need to find",
      "what weekday that is during that year.",
      "Then you can do simple subtraction to find", 
      "what day a specific date is.",
      "Check the cheatsheet for info on specific dates",
      "Century Anchor: the number you add, depending on what century you are in",
    ];

    let startY = 120;
    instructions.forEach((line, i) => {
      const txt = this.add.bitmapText(this.scale.width / 2, startY + i * lineHeight, 'PixelGame', line, fontSize)
      .setOrigin(0.5)
      .setAlpha(0);

      this.tweens.add({
        targets: txt,
        alpha: 1,
        duration: 500,
        delay: i * 150,
        ease: 'Power2'
      });
    });

    // --- Date info ---
    const fullDateText = `${this.exampleDay}.${this.exampleMonth}.${this.exampleYear}`;
    this.dateText = this.add.bitmapText(this.scale.width / 2, startY + instructions.length * lineHeight + 20, "ari", "", fontSize + 4)
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: this.dateText,
      alpha: 1,
      duration: 500,
      delay: instructions.length * 150
    });

    this.time.addEvent({
      delay: 100,
      repeat: fullDateText.length - 1,
      callback: () => {
        this.dateText.text += fullDateText[this.dateText.text.length];
      }
    });

    // --- Buttons ---
    const buttonY = startY + instructions.length * lineHeight + 100;
    this.makeButton(this.scale.width / 2, buttonY, "Step-by-Step Tutorial", () => {
      this.scene.start('TutorialDoomsday', {
        exampleDay: this.exampleDay,
        exampleMonth: this.exampleMonth,
        exampleYear: this.exampleYear
      });
    }, isMobile);

    this.makeButton(this.scale.width / 2, buttonY + 60, "Date calculation tutorial", () => {
      this.scene.start('TutorialDate', {
        exampleDay: this.exampleDay,
        exampleMonth: this.exampleMonth,
        exampleYear: this.exampleYear
      });
    }, isMobile);

    this.makeButton(this.scale.width / 2, buttonY + 120, "Reroll Date", () => this.rerollDate(), isMobile);

    this.makeButton(this.scale.width / 2, buttonY + 200, "Back to Menu", () => {
      this.scene.start("MenuScene", { skipIntro: true });
    }, isMobile);

    // Keyboard shortcut
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('MenuScene'));
  }

  makeButton(x, y, label, callback, isMobile) {
    const fontSize = isMobile ? 28 : 32;
    const txt = this.add.bitmapText(x, y, 'PixelGame', label, fontSize).setOrigin(0.5);

    if (isMobile) {
      const pad = 20;
      const rect = this.add.rectangle(x, y, txt.width + pad * 2, txt.height + pad * 2, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback);
      txt.setDepth(1);
    } else {
      txt.setInteractive({ useHandCursor: true })
        .on('pointerdown', callback)
        .on('pointerover', () => {
          this.tweens.add({ targets: txt, scale: 1.2, duration: 200, ease: 'Power2' });
          txt.setTint(0x00ff00);
        })
        .on('pointerout', () => {
          this.tweens.add({ targets: txt, scale: 1, duration: 200, ease: 'Power2' });
          txt.clearTint();
        });
    }
  }

  rerollDate() {
    this.exampleYear = Phaser.Math.Between(1900, 2099);
    this.exampleMonth = Phaser.Math.Between(1, 12);
    const daysInMonth = new Date(this.exampleYear, this.exampleMonth, 0).getDate();
    this.exampleDay = Phaser.Math.Between(1, daysInMonth);

    const newFullDate = `${this.exampleDay}.${this.exampleMonth}.${this.exampleYear}`;
    this.dateText.text = "";
    this.dateText.alpha = 0;

    this.tweens.add({ targets: this.dateText, alpha: 1, duration: 500 });
    this.time.addEvent({
      delay: 100,
      repeat: newFullDate.length - 1,
      callback: () => {
        this.dateText.text += newFullDate[this.dateText.text.length];
      }
    });
  }

  createCheatSheet(isMobile) {
    const panelWidth = isMobile ? this.scale.width * 0.8 : 320;
    const panelHeight = isMobile ? this.scale.height * 0.6 : 460;

    this.cheatPanel = this.add.container(this.scale.width, 80);
    this.cheatPanel.setDepth(999); // 👈 always on top

    const bg = this.add.graphics();
    bg.fillStyle(0xffffcc, 1);
    bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 10);
    this.cheatPanel.add(bg);

    const fontSize = isMobile ? 14 : 18;

    // Month Doomsdays
    const monthText = "Month Doomsdays\nJan: 3 / 4*   Jul:11\nFeb:28 / 29*  Aug: 8\nMar:14        Sep: 5\nApr: 4        Oct:10\nMay: 9        Nov: 7\nJun: 6        Dec:12";
    this.cheatPanel.add(this.add.bitmapText(15, 15, "ari", monthText, fontSize));

    // Leap year
    const leapText = "* Leap Year Rule:\nDiv by 4 → Leap Year\nBut div by 100 → NOT\nExcept div by 400 → Leap\n\nEffect: Jan=4, Feb=29";
    this.cheatPanel.add(this.add.bitmapText(15, 160, "ari", leapText, fontSize - 2));

    // Century Anchors
    const anchorText = "Century Anchors\n1900s → 3 (Wed)\n2000s → 2 (Tue)\n2100s → 0 (Sun)";
    this.cheatPanel.add(this.add.bitmapText(15, 260, "ari", anchorText, fontSize));

    // Weekday numbers
    const weekdayText = "Weekday Numbers\n0=Sun 1=Mon\n2=Tue 3=Wed\n4=Thu 5=Fri\n6=Sat";
    this.cheatPanel.add(this.add.bitmapText(15, 340, "ari", weekdayText, fontSize));

    // Close button
    const closeBtn = this.add.bitmapText(panelWidth - 25, 10, "ari", "X", fontSize)
    .setOrigin(0.5, 0)
    .setTint(0xaa0000)
    .setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", () => {
      this.tweens.add({ targets: this.cheatPanel, x: this.scale.width, duration: 300, ease: "Power2" });
      this.arrow.setVisible(true);
      this.cheatLabel.setVisible(true);
    });
    this.cheatPanel.add(closeBtn);

    // Arrow open
    const arrowX = this.scale.width - 40;
    const arrowY = this.scale.height / 2;
    this.arrow = this.add.graphics();
    this.arrow.fillStyle(0x333333, 1);
    this.arrow.beginPath();
    this.arrow.moveTo(0, -20);
    this.arrow.lineTo(0, 20);
    this.arrow.lineTo(30, 0);
    this.arrow.closePath();
    this.arrow.fillPath();
    this.arrow.setPosition(arrowX, arrowY);

    this.cheatLabel = this.add.bitmapText(arrowX - 10, arrowY, "PixelGame", "CHEAT SHEET", fontSize)
      .setOrigin(1, 0.5)
      .setAngle(-10);

    this.arrow.setInteractive(new Phaser.Geom.Polygon([0, -20, 0, 20, 30, 0]), Phaser.Geom.Polygon.Contains);
    this.arrow.on("pointerdown", () => {
      this.arrow.setVisible(false);
      this.cheatLabel.setVisible(false);
      this.tweens.add({ targets: this.cheatPanel, x: this.scale.width - panelWidth - 10, duration: 300, ease: "Power2" });
    });
  }
}

