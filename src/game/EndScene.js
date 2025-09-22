import { Scene } from "phaser";

export class EndScene extends Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    preload() {
        // Make sure the pixel font is loaded
        this.load.bitmapFont('PixelGame', 'assets/fonts/PixelGame.png', 'assets/fonts/PixelGame.xml');
    }

    create(data) {
        // Bone-paper background
        this.cameras.main.setBackgroundColor(0xEDE6D1);

        // Game Over title
        const title = this.add.bitmapText(
            this.scale.width / 2,
            100,
            'PixelGame',
            'GAME OVER!',
            64
        ).setOrigin(0.5).setAlpha(0).setScale(4);

        // Animate the title
        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            duration: 1500,
            ease: 'Back.Out'
        });

        // Score display
        const scoreText = this.add.bitmapText(
            this.scale.width / 2,
            200,
            'PixelGame',
            'Your score: ' + data.score,
            32
        ).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: scoreText,
            alpha: 1,
            duration: 1000,
            delay: 1500,
            ease: 'Power2'
        });

        // Restart / Back to menu button
        const menuButton = this.add.bitmapText(
            this.scale.width / 2,
            300,
            'PixelGame',
            'Back to Menu',
            32
        ).setOrigin(0.5).setAlpha(0)
          .setInteractive({ useHandCursor: true });

        // Animate button in
        this.tweens.add({
            targets: menuButton,
            alpha: 1,
            duration: 1000,
            delay: 2000,
            ease: 'Power2'
        });

        // Hover effect
        menuButton.on('pointerover', () => {
            menuButton.setTint(0x00ff00);
            this.tweens.add({ targets: menuButton, scale: 1.2, duration: 100, ease: 'Power1' });
        });

        menuButton.on('pointerout', () => {
            menuButton.clearTint();
            this.tweens.add({ targets: menuButton, scale: 1, duration: 100, ease: 'Power1' });
        });

        // Click to go back to menu
        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

