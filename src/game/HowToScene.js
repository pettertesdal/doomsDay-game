import { Scene } from "phaser";

export class HowToScene extends Scene {
  constructor() {
    super({ key: 'HowToScene' });
  }

  preload() {
    this.load.bitmapFont('PixelGame', 'assets/fonts/PixelGame.png', 'assets/fonts/PixelGame.xml');
    this.load.bitmapFont(
      "ari",
      "assets/fonts/ari-font.png",
      "assets/fonts/ari-font.xml"
    );
  }

  init(data) {
    if (data.exampleDay) {
      console.log("in if")
      this.exampleDay = data.exampleDay;
      this.exampleMonth = data.exampleMonth;
      this.exampleYear = data.exampleYear;
    } else {
      console.log("in else")
      this.exampleYear = Phaser.Math.Between(1900, 2099);
      this.exampleMonth = Phaser.Math.Between(1, 12);
      const daysInMonth = new Date(this.exampleYear, this.exampleMonth, 0).getDate();
      this.exampleDay = Phaser.Math.Between(1, daysInMonth);
    }
  }

  create() {
    this.cameras.main.setBackgroundColor(0xEDE6D1);

    const title = this.add.bitmapText(this.scale.width / 2, 50, 'PixelGame', 'HOW TO PLAY', 64)
    .setOrigin(0.5)
    .setAlpha(0)
    .setScale(4);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 1500,
      ease: 'Back.Out'
    });

    const instructions = [
      "1. Things to remember",
      "",
      "Press ENTER to go back to menu."
    ];

    let startY = 150;
    instructions.forEach((line, i) => {
      const txt = this.add.bitmapText(50, startY + i * 40, 'PixelGame', line, 24)
      .setAlpha(0);

      this.tweens.add({
        targets: txt,
        alpha: 1,
        duration: 500,
        delay: i * 150,
        ease: 'Power2'
      });
    });

    // Add this helper function inside the class


    // Back to Menu button
    const menuButton = this.add.bitmapText(
      this.scale.width / 2,
      startY + instructions.length * 40 + 160 + 60,
      'PixelGame',
      'Back to Menu',
      32
    ).setOrigin(0.5)
    .setAlpha(0)
    .setInteractive({ useHandCursor: true });

    this.dateText = this.add
      .bitmapText(this.scale.width / 2, 120, "ari", 
        `Target date`, 20)
      .setOrigin(0.5);


    // Animated date text
    const fullDateText = `${this.exampleDay}.${this.exampleMonth}.${this.exampleYear}`;
    this.dateText = this.add
      .bitmapText(this.scale.width / 2, 170, "ari", "", 28)
      .setOrigin(0.5)
      .setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: this.dateText,
      alpha: 1,
      duration: 500,
      delay: instructions.length * 150, // sync with other text
    });

    // Typewriter effect
    this.time.addEvent({
      delay: 100,
      repeat: fullDateText.length - 1,
      callback: () => {
        this.dateText.text += fullDateText[this.dateText.text.length];
      }
    });




    this.tweens.add({
      targets: menuButton,
      alpha: 1,
      duration: 1000,
      delay: instructions.length * 150,
      ease: 'Power2'
    });

    menuButton.on('pointerover', () => {
      menuButton.setTint(0x00ff00);
      this.tweens.add({ targets: menuButton, scale: 1.2, duration: 100, ease: 'Power1' });
    });

    menuButton.on('pointerout', () => {
      menuButton.clearTint();
      this.tweens.add({ targets: menuButton, scale: 1, duration: 100, ease: 'Power1' });
    });

    menuButton.on('pointerdown', () => this.scene.start("MenuScene", { skipIntro: true }));

    // Tutorial button
    const tutorialDoomsdayButton = this.add.bitmapText(
      this.scale.width / 2,
      startY + instructions.length * 40 + 100,
      'PixelGame',
      'Step-by-Step Tutorial',
      32
    ).setOrigin(0.5)
    .setAlpha(0)
    .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: tutorialDoomsdayButton,
      alpha: 1,
      duration: 1000,
      delay: instructions.length * 150 + 200,
      ease: 'Power2'
    });

    tutorialDoomsdayButton.on('pointerover', () => {
      tutorialDoomsdayButton.setTint(0x00ff00);
      this.tweens.add({ targets: tutorialDoomsdayButton, scale: 1.2, duration: 100, ease: 'Power1' });
    });

    tutorialDoomsdayButton.on('pointerout', () => {
      tutorialDoomsdayButton.clearTint();
      this.tweens.add({ targets: tutorialDoomsdayButton, scale: 1, duration: 100, ease: 'Power1' });
    });

    tutorialDoomsdayButton.on('pointerdown', () => this.scene.start('TutorialDoomsday', {exampleDay: this.exampleDay, exampleMonth: this.exampleMonth, exampleYear: this.exampleYear}));

    const tutorialDateButton = this.add.bitmapText(
      this.scale.width / 2,
      startY + instructions.length * 40 + 160,
      'PixelGame',
      'Date calculation tutorial',
      32
    ).setOrigin(0.5)
    .setAlpha(0)
    .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: tutorialDateButton,
      alpha: 1,
      duration: 1000,
      delay: instructions.length * 150 + 200,
      ease: 'Power2'
    });

    tutorialDateButton.on('pointerover', () => {
      tutorialDateButton.setTint(0x00ff00);
      this.tweens.add({ targets: tutorialDateButton, scale: 1.2, duration: 100, ease: 'Power1' });
    });

    tutorialDateButton.on('pointerout', () => {
      tutorialDateButton.clearTint();
      this.tweens.add({ targets: tutorialDateButton, scale: 1, duration: 100, ease: 'Power1' });
    });

    tutorialDateButton.on('pointerdown', () => this.scene.start('TutorialDate', {exampleDay: this.exampleDay, exampleMonth: this.exampleMonth, exampleYear: this.exampleYear}));
    // Allow Enter key to go back
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('MenuScene'));

    // Reroll Date button
    const rerollButton = this.add.bitmapText(
      this.scale.width / 2,
      startY + 75, // below the other buttons
      'PixelGame',
      'Reroll Date',
      32
    ).setOrigin(0.5)
    .setAlpha(0)
    .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: rerollButton,
      alpha: 1,
      duration: 1000,
      delay: instructions.length * 150 + 400,
      ease: 'Power2'
    });

    rerollButton.on('pointerover', () => {
      rerollButton.setTint(0x00ff00);
      this.tweens.add({ targets: rerollButton, scale: 1.2, duration: 100, ease: 'Power1' });
    });

    rerollButton.on('pointerout', () => {
      rerollButton.clearTint();
      this.tweens.add({ targets: rerollButton, scale: 1, duration: 100, ease: 'Power1' });
    });

    rerollButton.on('pointerdown', () => this.rerollDate());

  }

  rerollDate() {
    // Pick a new random date
    this.exampleYear = Phaser.Math.Between(1900, 2099);
    this.exampleMonth = Phaser.Math.Between(1, 12);
    const daysInMonth = new Date(this.exampleYear, this.exampleMonth, 0).getDate();
    this.exampleDay = Phaser.Math.Between(1, daysInMonth);

    const newFullDate = `${this.exampleDay}.${this.exampleMonth}.${this.exampleYear}`;

    // Reset the date text
    this.dateText.text = "";
    this.dateText.alpha = 0;

    // Fade in
    this.tweens.add({
      targets: this.dateText,
      alpha: 1,
      duration: 500,
    });

    // Typewriter effect
    this.time.addEvent({
      delay: 100,
      repeat: newFullDate.length - 1,
      callback: () => {
        this.dateText.text += newFullDate[this.dateText.text.length];
      }
    });
  }

}
