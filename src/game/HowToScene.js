import { Scene } from "phaser";

export class HowToScene extends Scene {
    constructor() {
        super({ key: 'HowToScene' });
    }

    preload() {
        this.load.bitmapFont('PixelGame', 'assets/fonts/PixelGame.png', 'assets/fonts/PixelGame.xml');
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
            "1. The Doomsday Algorithm helps",
            "   you find the weekday of any date.",
            "   Before starting it may be useful to think of the days in numbers",
            "   Sunday-0, Monday-1, Tuesday-2, Wedensday-3",
            "   Thuesday-4, Friday-5, Saturday-6",
            "",
            "2. Steps to calculate:",
            "   a) How many times does the number 12 fit as a whole into the two last digits of the year number?",
            "   b) What is the difference between the two last digits of the year number and the product of the multiples of 12 from calculation a?",
            "   c) How many times does the number 4 fit into the result of calculation b?",
            "   d) What is the century's anchor day?",
            "   e) Add up all the results.",
            "   f) Subtract whole multiples of 7 from the result of calculation 5.",
            "   This will result in a number between 0 and 6, which corresponds to the doomsday of the year.",
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

        // Animated example calculation
        const exampleDate = "March 14, 2025 → Friday";
        const exampleText = this.add.bitmapText(80, startY + instructions.length * 40 + 20, 'PixelGame', '', 28)
            .setAlpha(0);

        this.tweens.add({
            targets: exampleText,
            alpha: 1,
            duration: 500,
            delay: instructions.length * 150,
        });

        this.time.addEvent({
            delay: 100,
            repeat: exampleDate.length - 1,
            callback: () => {
                exampleText.text += exampleDate[exampleText.text.length];
            }
        });

        // Back to Menu button
        const menuButton = this.add.bitmapText(
            this.scale.width / 2,
            startY + instructions.length * 40 + 100,
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
            delay: instructions.length * 150 + exampleDate.length * 100,
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

        // Tutorial button
        const tutorialButton = this.add.bitmapText(
            this.scale.width / 2,
            startY + instructions.length * 40 + 160,
            'PixelGame',
            'Step-by-Step Tutorial',
            32
        ).setOrigin(0.5)
          .setAlpha(0)
          .setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: tutorialButton,
            alpha: 1,
            duration: 1000,
            delay: instructions.length * 150 + exampleDate.length * 100 + 200,
            ease: 'Power2'
        });

        tutorialButton.on('pointerover', () => {
            tutorialButton.setTint(0x00ff00);
            this.tweens.add({ targets: tutorialButton, scale: 1.2, duration: 100, ease: 'Power1' });
        });

        tutorialButton.on('pointerout', () => {
            tutorialButton.clearTint();
            this.tweens.add({ targets: tutorialButton, scale: 1, duration: 100, ease: 'Power1' });
        });

        tutorialButton.on('pointerdown', () => this.scene.start('TutorialScene'));

        // Allow Enter key to go back
        this.input.keyboard.on('keydown-ENTER', () => this.scene.start('MenuScene'));
    }
}

