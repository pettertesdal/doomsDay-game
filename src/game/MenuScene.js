import { Scene } from "phaser";

export class MenuScene extends Scene {
  constructor () {
    super({ key: 'MenuScene' });
  }

  preload () {
    this.load.bitmapFont(
      'PixelGame',                 // key you’ll use later
      'assets/fonts/PixelGame.png', // path to PNG
      'assets/fonts/PixelGame.xml'  // or .fnt / .json file
    );
  }


  create () {
    // --- Step 1: Big animated title ---
    const title = this.add.bitmapText(
      this.scale.width / 2, 
      this.scale.height / 2, 
      'PixelGame', 
      'DOOMSDAY', 
      64
    ).setOrigin(0.5)
    .setAlpha(0)
    .setScale(4); // start large for a zoom-in effect

    // Animate title in
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 1500,
      ease: 'Back.Out',
      onComplete: () => {
        // After a pause, fade out and show menu
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: title,
            alpha: 0,
            duration: 800,
            onComplete: () => this.showMenu()
          });
        });
      }
    });
  }

  showMenu () {
    // --- Step 2: Animated menu options ---
    const items = [
      { text: "Welcome to Doomsday!", y: 100, size: 24 },
      { text: "Choose a difficulty", y: 140, size: 24 },
      { text: "Easy", y: 200, size: 24, callback: () => this.scene.start("PlayScene", { difficulty: 0 }) },
      { text: "Medium", y: 240, size: 24, callback: () => this.scene.start("PlayScene", { difficulty: 1 }) },
      { text: "Hard", y: 280, size: 24, callback: () => this.scene.start("PlayScene", { difficulty: 2 }) },
      { text: "How to play", y: 320, size: 24, callback: () => this.scene.start("HowToScene")}
    ];

    items.forEach((item, i) => {
      const txt = this.add.bitmapText(
        100,
        item.y,
        'PixelGame',
        item.text,
        item.size
      ).setAlpha(0);

      // Animate each line in sequence
      this.tweens.add({
        targets: txt,
        alpha: 1,
        x: 120,
        duration: 500,
        delay: i * 200,
        ease: 'Power2'
      });

      if (item.callback) {
        txt.setInteractive({ useHandCursor: true })
          .on('pointerdown', item.callback)
          .on('pointerover', () => txt.setTint(0x00ff00))
          .on('pointerout', () => txt.clearTint());
      }
    });
  }
}

