import { Scene } from "phaser";
import { PlayScene } from "./PlayScene";

export class EndScene extends Scene {
    constructor() {
        super({ key: 'EndScene' }) 
    }

    create(data) {
        this.add.text(100, 100, 'Game Over! Your score: ' + data.score, { fontSize: "32px", fill: '#ffffff' });
        let button = this.add.text(100, 200 , "Start again?", { fontSize: '24px', fill: '#0F0' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('PlayScene'));
    }
}
