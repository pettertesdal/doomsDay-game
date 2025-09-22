import { Scene } from "phaser";

export class HowToScene extends Scene {
    constructor() {
        super({ key: 'HowToScene' });
    }

    preload() {
        // Make sure the pixel font is loaded
        this.load.bitmapFont('PixelGame', 'assets/fonts/PixelGame.png', 'assets/fonts/PixelGame.xml');
    }

    create() {
        // Bone-paper background
        this.cameras.main.setBackgroundColor(0xEDE6D1);

        // Title
        const title = this.add.bitmapText(
            this.scale.width / 2,
            50,
            'PixelGame',
            'HOW TO PLAY',
            64
        ).setOrigin(0.5).setAlpha(0).setScale(4);

        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            duration: 1500,
            ease: 'Back.Out'
        });

        // Instructions
        const instructions = [
            "1. The Doomsday Algorithm helps",
            "   you find the weekday of any date.",
            "",
            "2. Steps to calculate:",
            "   a) Take the last two digits of the year.",
            "   b) Divide by 12 → quotient + remainder.",
            "   c) Divide remainder by 4 → add quotient + remainder + result.",
            "   d) Add anchor day of the century.",
            "   e) Mod 7 → number represents the weekday.",
            "",
            "3. Practice by typing the correct",
            "   weekday for each given date.",
            "",
            "Press ENTER to go back to menu."
        ];

        let startY = 150;
        instructions.forEach((line, i) => {
            const txt = this.add.bitmapText(50, startY + i * 40, 'PixelGame', line, 24)
                .setAlpha(0);

            // Fade-in each line
            this.tweens.add({
                targets: txt,
                alpha: 1,
                duration: 500,
                delay: i * 150,
                ease: 'Power2'
            });
        });

        // Input to go back
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('MenuScene');
        });

        // Optional clickable button
        const menuButton = this.add.bitmapText(
            this.scale.width / 2,
            startY + instructions.length * 40 + 50,
            'PixelGame',
            'Back to Menu',
            32
        ).setOrigin(0.5)
          .setAlpha(0)
          .setInteractive({ useHandCursor: true });

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

        menuButton.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}

