import { Scene } from "phaser";

export class MenuScene extends Scene {
  constructor () {
    super({ key: 'MenuScene' });
    this.skipIntro = false; // ✅ plain JS property
  }

  preload () {
    this.load.bitmapFont(
      'PixelGame',
      'assets/fonts/PixelGame.png',
      'assets/fonts/PixelGame.xml'
    );
  }

  init (data) {
    // read skip flag (default false)
    this.skipIntro = data && data.skipIntro ? true : false;
  }

  create () {
    if (this.skipIntro) {
      // --- Skip straight to menu ---
      this.add.bitmapText(
        this.scale.width / 2,
        80,
        'PixelGame',
        'DOOMSDAY',
        64
      ).setOrigin(0.5);

      this.showMenu();
      return;
    }

    // --- Otherwise, play intro ---
    const title = this.add.bitmapText(
      this.scale.width / 2,
      this.scale.height / 2,
      'PixelGame',
      'DOOMSDAY',
      64
    ).setOrigin(0.5)
     .setAlpha(0)
     .setScale(4);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 1500,
      ease: 'Back.Out',
      onComplete: () => {
        this.time.delayedCall(600, () => {
          this.tweens.add({
            targets: title,
            y: 80,
            duration: 1000,
            ease: 'Back.InOut'
          });

          this.time.delayedCall(200, () => this.showMenu());
        });
      }
    });
  }

  showMenu () {
    const items = [
      { text: "Welcome to Doomsday!", y: 160, size: 24 },
      { text: "Choose a difficulty", y: 200, size: 24 },
      { text: "Easy", y: 280, size: 28, callback: () => this.scene.start("PlayScene", { difficulty: 0 }) },
      { text: "Medium", y: 330, size: 28, callback: () => this.scene.start("PlayScene", { difficulty: 1 }) },
      { text: "Hard", y: 380, size: 28, callback: () => this.scene.start("PlayScene", { difficulty: 2 }) },
      { text: "How to play", y: 440, size: 24, callback: () => this.scene.start("HowToScene")}
    ];

    items.forEach((item, i) => {
      const txt = this.add.bitmapText(
        this.skipIntro ? 120 : -200,
        item.y,
        'PixelGame',
        item.text,
        item.size
      ).setAlpha(this.skipIntro ? 1 : 0);

      if (!this.skipIntro) {
        this.tweens.add({
          targets: txt,
          alpha: 1,
          x: 120,
          duration: 600,
          delay: i * 200,
          ease: 'Back.Out'
        });
      }

      if (item.callback) {
        txt.setInteractive({ useHandCursor: true })
          .on('pointerdown', item.callback)
          .on('pointerover', () => {
            this.tweens.add({
              targets: txt,
              scale: 1.2,
              duration: 200,
              ease: 'Power2'
            });
            txt.setTint(0x00ff00);
          })
          .on('pointerout', () => {
            this.tweens.add({
              targets: txt,
              scale: 1,
              duration: 200,
              ease: 'Power2'
            });
            txt.clearTint();
          });
      }
    });
  }
}

