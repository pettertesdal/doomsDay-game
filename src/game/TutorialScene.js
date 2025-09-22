import { Scene } from "phaser";

export class TutorialScene extends Scene {
    constructor() {
        super({ key: 'TutorialScene' });
        this.currentStep = 0;
    }

    preload() {
        this.load.bitmapFont('PixelGame', 'assets/fonts/PixelGame.png', 'assets/fonts/PixelGame.xml');
    }

    create() {
        this.cameras.main.setBackgroundColor(0xEDE6D1);

        // Title
        const title = this.add.bitmapText(this.scale.width / 2, 50, 'PixelGame', 'DOOMSDAY TUTORIAL', 64)
            .setOrigin(0.5)
            .setAlpha(0)
            .setScale(4);
        this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 1500, ease: 'Back.Out' });

        // Example date
        this.exampleYear = 2025;
        this.exampleMonth = 3; // March
        this.exampleDay = 14;

        // Instruction and input texts
        this.instructionText = this.add.bitmapText(50, 150, 'PixelGame', '', 28);
        this.inputText = this.add.bitmapText(this.scale.width / 2, 220, 'PixelGame', '', 32).setOrigin(0.5);
        this.feedbackText = this.add.bitmapText(this.scale.width / 2, 270, 'PixelGame', '', 28).setOrigin(0.5);

        this.playerInput = '';

        // Steps of the algorithm
        this.steps = [
            { 
                text: `Step 1: Type the last two digits of the year ${this.exampleYear}`, 
                check: () => this.playerInput === String(this.exampleYear % 100),
                success: "✅ Correct! Press Enter to continue."
            },
            {
                text: () => `Step 2: Divide ${this.exampleYear % 100} by 12 → type the quotient`,
                check: () => this.playerInput === String(Math.floor((this.exampleYear % 100) / 12)),
                success: "✅ Good! Press Enter for remainder step."
            },
            {
                text: () => `Step 3: Divide remainder by 4 → type the result`,
                check: () => {
                    const remainder = (this.exampleYear % 100) % 12;
                    return this.playerInput === String(Math.floor(remainder / 4));
                },
                success: "✅ Nice! Next, add the century anchor day."
            },
            {
                text: () => `Step 4: Add the century's anchor day (Tuesday=2) → type the sum`,
                check: () => {
                    const remainder = (this.exampleYear % 100) % 12;
                    const step3 = Math.floor(remainder / 4);
                    const anchor = 2; // Century anchor for 2000s
                    return this.playerInput === String(Math.floor((this.exampleYear % 100) / 12) + remainder + step3 + anchor);
                },
                success: "✅ Almost there! Press Enter to get the weekday."
            },
            {
                text: () => `Step 5: Mod 7 → weekday (0=Sunday, 1=Monday, ...)`,
                check: () => {
                    const remainder = (this.exampleYear % 100) % 12;
                    const step3 = Math.floor(remainder / 4);
                    const anchor = 2;
                    const total = Math.floor((this.exampleYear % 100) / 12) + remainder + step3 + anchor;
                    const weekday = total % 7;
                    return this.playerInput === String(weekday);
                },
                success: "✅ Correct! You've calculated the Doomsday!"
            }
        ];

        this.showStep();

        // Keyboard input
        this.input.keyboard.on('keydown', (event) => {
            if (event.key.length === 1 && /[0-9]/.test(event.key)) {
                this.playerInput += event.key;
                this.inputText.setText(this.playerInput);
            } else if (event.key === 'Backspace') {
                this.playerInput = this.playerInput.slice(0, -1);
                this.inputText.setText(this.playerInput);
            } else if (event.key === 'Enter') {
                this.checkStep();
            }
        });

        // Back to Menu button
        this.menuButton = this.add.bitmapText(this.scale.width / 2, 500, 'PixelGame', 'Back to Menu', 32)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setAlpha(0);
        this.menuButton.on('pointerdown', () => this.scene.start('MenuScene'));
        this.menuButton.on('pointerover', () => { this.menuButton.setTint(0x00ff00); this.menuButton.setScale(1.2); });
        this.menuButton.on('pointerout', () => { this.menuButton.clearTint(); this.menuButton.setScale(1); });
    }

    showStep() {
        const step = this.steps[this.currentStep];
        this.playerInput = '';
        this.inputText.setText('');
        this.feedbackText.setText('');
        this.instructionText.setText(typeof step.text === 'function' ? step.text() : step.text);
    }

    checkStep() {
        const step = this.steps[this.currentStep];
        if (step.check()) {
            this.feedbackText.setText(step.success);
            this.currentStep++;
            if (this.currentStep < this.steps.length) {
                this.input.keyboard.once('keydown-ENTER', () => this.showStep());
            } else {
                // Tutorial finished
                this.menuButton.setAlpha(1);
            }
        } else {
            this.feedbackText.setText('❌ Wrong, try again.');
            this.playerInput = '';
            this.inputText.setText('');
        }
    }
}


