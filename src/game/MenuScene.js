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
        .setScale(2.0);

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
      .setScale(2.0);

    const endScale = this.autoScaleTitle(title, isMobile, false);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scaleX: endScale,
      scaleY: endScale,
      duration: 1200,
      ease: "Back.Out",
      onComplete: () => {
        this.time.delayedCall(400, () => {
          this.time.delayedCall(250, () => this.showMenu(isMobile));
          this.tweens.add({
            targets: title,
            y: 80,
            duration: 800,
            ease: "Back.InOut",
            onComplete: () => this.addBreathingTween(title, endScale),
          });
        });
      },
    });
  }

  autoScaleTitle(title, isMobile, skippingIntro) {
    // On desktop shrink more (fit 50% width), on mobile keep ~70%
    const maxWidth = this.scale.width * (isMobile ? 0.7 : 0.2);
    const rawWidth = title.width / (title.scaleX || 1);

    let newScale = maxWidth / rawWidth;

    if (isMobile) {
      newScale *= 0.9;
    }

    if (skippingIntro) {
      title.setScale(newScale);
      return newScale;
    }

    return newScale + 0.1;
  }

  addBreathingTween(target, base) {
    this.tweens.add({
      targets: target,
      scaleX: { from: base, to: base + 0.04 },
      scaleY: { from: base, to: base + 0.04 },
      duration: 1400,
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
      const fontSize = isMobile ? Math.round(item.size * 1.3) : item.size;

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

