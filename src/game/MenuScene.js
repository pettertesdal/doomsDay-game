import { Scene } from "phaser";

export class MenuScene extends Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.skipIntro = false;
  }

  preload() {
    this.load.bitmapFont(
      "PixelGame",
      "assets/fonts/PixelGame.png",
      "assets/fonts/PixelGame.xml"
    );
  }

  init(data) {
    this.skipIntro = !!(data && data.skipIntro);
  }

  create() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (this.skipIntro) {
      const title = this.add
        .bitmapText(this.scale.width / 2, 80, "PixelGame", "DOOMSDAY", 64)
        .setOrigin(0.5)
        .setAlpha(0)
        .setScale(3.5);

      const endScale = this.autoScaleTitle(title, isMobile, true);

      this.tweens.add({
        targets: title,
        alpha: 1,
        scaleX: endScale,
        scaleY: endScale,
        duration: 800,
        ease: "Back.Out",
        onComplete: () => this.addBreathingTween(title, endScale),
      });

      this.showMenu(isMobile);
      return;
    }

    // Intro flow
    const title = this.add
      .bitmapText(
        this.scale.width / 2,
        this.scale.height / 2,
        "PixelGame",
        "DOOMSDAY",
        64
      )
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(3.5);

    const endScale = this.autoScaleTitle(title, isMobile, false);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scaleX: endScale,
      scaleY: endScale,
      duration: 1500,
      ease: "Back.Out",
      onComplete: () => {
        this.time.delayedCall(600, () => {
          this.time.delayedCall(250, () => this.showMenu(isMobile));
          this.tweens.add({
            targets: title,
            y: 80,
            duration: 1000,
            ease: "Back.InOut",
            onComplete: () => this.addBreathingTween(title, endScale),
          });
        });
      },
    });
  }

  autoScaleTitle(title, isMobile, skippingIntro) {
    // Fit title to ~80% of screen width
    const maxWidth = this.scale.width * 0.8;
    const rawWidth = title.width / (title.scaleX || 1);

    let newScale = maxWidth / rawWidth;

    // Slightly smaller on mobile to avoid overflow
    if (isMobile) {
      newScale *= 0.9;
    }

    // If skipping intro, land directly at final scale
    if (skippingIntro) {
      title.setScale(newScale);
      return newScale;
    }

    // During intro animation, add a little extra "bounce" (like before)
    return newScale + 0.2;
  }

  addBreathingTween(target, base) {
    this.tweens.add({
      targets: target,
      scaleX: { from: base, to: base + 0.05 },
      scaleY: { from: base, to: base + 0.05 },
      duration: 1500,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });
  }

  showMenu(isMobile) {
    const baseY = this.scale.height * 0.25;
    const gap = isMobile ? 60 : 70;

    const items = [
      { text: "Welcome to Doomsday!", y: baseY, size: 24 },
      { text: "Choose a difficulty", y: baseY + gap, size: 24 },
      {
        text: "Easy",
        y: baseY + gap * 2,
        size: 28,
        callback: () => this.scene.start("PlayScene", { difficulty: 0 }),
      },
      {
        text: "Medium",
        y: baseY + gap * 3,
        size: 28,
        callback: () => this.scene.start("PlayScene", { difficulty: 1 }),
      },
      {
        text: "Hard",
        y: baseY + gap * 4,
        size: 28,
        callback: () => this.scene.start("PlayScene", { difficulty: 2 }),
      },
      {
        text: "How to play",
        y: baseY + gap * 5,
        size: 24,
        callback: () => this.scene.start("HowToScene"),
      },
    ];

    items.forEach((item, i) => {
      const posX = isMobile ? this.scale.width / 2 : 120;
      const fontSize = isMobile ? Math.round(item.size * 1.4) : item.size;

      // Create the label
      const txt = this.add
        .bitmapText(
          this.skipIntro ? posX : -200,
          item.y,
          "PixelGame",
          item.text,
          fontSize
        )
        .setOrigin(isMobile ? 0.5 : 0, 0.5)
        .setAlpha(this.skipIntro ? 1 : 0);

      if (!this.skipIntro) {
        this.tweens.add({
          targets: txt,
          alpha: 1,
          x: posX,
          duration: 600,
          delay: i * 200,
          ease: "Back.Out",
        });
      }

      if (item.callback) {
        if (isMobile) {
          const pad = 16;
          const rect = this.add
            .rectangle(
              txt.x,
              txt.y,
              txt.width + pad * 2,
              txt.height + pad * 2,
              0x000000,
              0
            )
            .setOrigin(txt.originX, txt.originY)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", item.callback);

          if (!this.skipIntro) {
            rect.alpha = 0;
            this.tweens.add({
              targets: rect,
              alpha: 1,
              x: posX,
              duration: 600,
              delay: i * 200,
              ease: "Back.Out",
            });
          }

          txt.setDepth(1);
          rect.setDepth(0);
        } else {
          txt.setInteractive({ useHandCursor: true })
            .on("pointerdown", item.callback)
            .on("pointerover", () => {
              this.tweens.add({
                targets: txt,
                scale: 1.2,
                duration: 200,
                ease: "Power2",
              });
              txt.setTint(0x00ff00);
            })
            .on("pointerout", () => {
              this.tweens.add({
                targets: txt,
                scale: 1,
                duration: 200,
                ease: "Power2",
              });
              txt.clearTint();
            });
        }
      }
    });
  }
}

