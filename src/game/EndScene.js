import { Scene } from "phaser";

export class EndScene extends Scene {
  constructor() {
    super({ key: "EndScene" });
    this.inputElement = null;
  }

  preload() {
    this.load.bitmapFont(
      "PixelGame",
      "assets/fonts/PixelGame.png",
      "assets/fonts/PixelGame.xml"
    );
  }

  async create(data) {
    this.cameras.main.setBackgroundColor(0xede6d1);

    // --- Title ---
    const title = this.add
      .bitmapText(
        this.scale.width / 2,
        100,
        "PixelGame",
        "GAME OVER!",
        64
      )
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(4);

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 1500,
      ease: "Back.Out",
    });

    // --- Score ---
    const scoreText = this.add
      .bitmapText(
        this.scale.width / 2,
        200,
        "PixelGame",
        "Score: " + data.score,
        32
      )
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      duration: 1000,
      delay: 1500,
      ease: "Power2",
    });

    // --- Handle leaderboard ---
    await this.handleLeaderboard(data.score);

    // --- Menu Button ---
    const menuButton = this.add
      .bitmapText(
        this.scale.width / 2,
        this.scale.height - 80,
        "PixelGame",
        "Back to Menu",
        32
      )
      .setOrigin(0.5)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: menuButton,
      alpha: 1,
      duration: 1000,
      delay: 2000,
      ease: "Power2",
    });

    menuButton.on("pointerover", () => {
      menuButton.setTint(0x00ff00);
      this.tweens.add({
        targets: menuButton,
        scale: 1.2,
        duration: 100,
        ease: "Power1",
      });
    });

    menuButton.on("pointerout", () => {
      menuButton.clearTint();
      this.tweens.add({
        targets: menuButton,
        scale: 1,
        duration: 100,
        ease: "Power1",
      });
    });

    menuButton.on("pointerdown", () =>
      this.scene.start("MenuScene", { skipIntro: true })
    );
  }

  // --- API helpers ---
  async postScore(name, score, difficulty) {
  const res = await fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score, difficulty })
  })
  return res.json()
}

async getLeaderboard(difficulty) {
  const res = await fetch(`/api/leaderboard?difficulty=${difficulty}`)
  return res.json()
}


  // --- Leaderboard logic ---
  async handleLeaderboard(score) {
  const difficulty = this.scene.settings.data.difficulty
  let leaderboard = await this.getLeaderboard(difficulty)

  const qualifies =
    leaderboard.length < 10 ||
    score > leaderboard[leaderboard.length - 1].score

  if (qualifies) {
    this.showNameEntry(score, difficulty)
  } else {
    this.showLeaderboard(leaderboard, 260)
  }
}

  showNameEntry(score) {
    const promptText = this.add
      .bitmapText(
        this.scale.width / 2,
        260,
        "PixelGame",
        "You made the leaderboard!\nEnter your name:",
        24
      )
      .setOrigin(0.5);

    // HTML input element overlay
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 12;

    // Position it
    input.style.position = "absolute";
    input.style.left =
      this.scale.canvas.offsetLeft + this.scale.width / 2 - 100 + "px";
    input.style.top = this.scale.canvas.offsetTop + 300 + "px";
    input.style.width = "200px";
    input.style.height = "40px";

    // Styling for pixel look
    input.style.background = "#ede6d1";
    input.style.color = "black";
    input.style.border = "4px solid black";
    input.style.outline = "none";
    input.style.textAlign = "center";
    input.style.fontSize = "24px";
    input.style.fontFamily = "PixelGame, monospace";
    input.style.fontWeight = "bold";
    input.style.imageRendering = "pixelated";
    input.style.letterSpacing = "2px";
    input.autocomplete = "off";
    input.spellcheck = false;

    document.body.appendChild(input);
    this.inputElement = input;
    input.focus();

    input.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        const playerName = input.value || "Anon";
        const leaderboard = await this.postScore(playerName, score, difficulty);

        input.remove();
        this.inputElement = null;
        promptText.destroy();

        this.showLeaderboard(leaderboard, 260);
      }
    });
  }

  showLeaderboard(leaderboard, startY) {
    this.add
      .bitmapText(
        this.scale.width / 2,
        startY,
        "PixelGame",
        "Leaderboard",
        32
      )
      .setOrigin(0.5);

    leaderboard.forEach((entry, i) => {
      this.add
        .bitmapText(
          this.scale.width / 2,
          startY + 40 + i * 30,
          "PixelGame",
          `${i + 1}. ${entry.name} - ${entry.score}`,
          24
        )
        .setOrigin(0.5);
    });
  }

  // Cleanup input box if scene changes
  shutdown() {
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = null;
    }
  }
}

