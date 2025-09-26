import { Game, AUTO, Scale, Scene } from "phaser";
import { PlayScene } from "../game/PlayScene.js";
import { EndScene } from "../game/EndScene.js";
import { HowToScene } from "../game/HowToScene.js";
import { MenuScene } from "../game/MenuScene.js";
import { TutorialDoomsday } from "../game/TutorialDoomsday.js";
import { TutorialDate } from "../game/TutorialDate.js";

export function launch() {
    return new Game ({
        type: AUTO,
        scale: {
            mode: Scale.RESIZE,
            width: window.innerWidth * window.devicePixelRatio,
            autoCenter: Scale.CENTER_BOTH,
            height: window.innerHeight * window.devicePixelRatio,
        },
        parent: "game",
        backgroundColor: '0xEDE6D1',
        physics: {
            default: "arcade",
        },
        scene: [MenuScene, PlayScene, EndScene, HowToScene, TutorialDoomsday, TutorialDate]
    });
}
