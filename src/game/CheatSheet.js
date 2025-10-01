// CheatSheet.js
export function createCheatSheet(scene, isMobile) {
  const panelWidth = isMobile ? scene.scale.width * 0.8 : 320;
  const panelHeight = isMobile ? scene.scale.height * 0.6 : 460;

  const cheatPanel = scene.add.container(scene.scale.width, 80);
  cheatPanel.setDepth(999);

  const bg = scene.add.graphics();
  bg.fillStyle(0xffffcc, 1);
  bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 10);
  cheatPanel.add(bg);

  const fontSize = isMobile ? 14 : 18;

  // Month Doomsdays
  const monthText =
    "Month Doomsdays\nJan: 3/4*   Jul:11\nFeb:28/29*  Aug: 8\nMar:14      Sep: 5\nApr: 4      Oct:10\nMay: 9      Nov: 7\nJun: 6      Dec:12";
  cheatPanel.add(scene.add.bitmapText(15, 15, "ari", monthText, fontSize));

  // Leap year
  const leapText =
    "* Leap Year Rule:\nDiv by 4 → Leap Year\nBut div by 100 → NOT\nExcept div by 400 → Leap\n\nEffect: Jan=4, Feb=29";
  cheatPanel.add(scene.add.bitmapText(15, 160, "ari", leapText, fontSize - 2));

  // Century Anchors
  const anchorText = "Century Anchors\n1900s → 3 (Wed)\n2000s → 2 (Tue)\n2100s → 0 (Sun)";
  cheatPanel.add(scene.add.bitmapText(15, 260, "ari", anchorText, fontSize));

  // Weekday numbers
  const weekdayText = "Weekday Numbers\n0=Sun 1=Mon\n2=Tue 3=Wed\n4=Thu 5=Fri\n6=Sat";
  cheatPanel.add(scene.add.bitmapText(15, 340, "ari", weekdayText, fontSize));

  // Close button
  const closeBtn = scene.add.bitmapText(panelWidth - 25, 10, "ari", "X", fontSize)
    .setOrigin(0.5, 0)
    .setTint(0xaa0000)
    .setInteractive({ useHandCursor: true });

  cheatPanel.add(closeBtn);

  // --- Arrow to open ---
  const arrowX = scene.scale.width - 40;
  const arrowY = scene.scale.height / 2;

  const arrow = scene.add.graphics();
  arrow.fillStyle(0x333333, 1);
  arrow.beginPath();
  arrow.moveTo(0, -20);
  arrow.lineTo(0, 20);
  arrow.lineTo(30, 0);
  arrow.closePath();
  arrow.fillPath();
  arrow.setPosition(arrowX, arrowY);

  const cheatLabel = scene.add.bitmapText(arrowX - 10, arrowY, "PixelGame", "CHEAT SHEET", fontSize)
    .setOrigin(1, 0.5)
    .setAngle(-10);

  // --- Event handlers ---

  // Open panel
  arrow.setInteractive(new Phaser.Geom.Polygon([0, -20, 0, 20, 30, 0]), Phaser.Geom.Polygon.Contains);
  arrow.on("pointerdown", () => {
    arrow.setVisible(false);
    cheatLabel.setVisible(false);

    // Hide mobile input field if present
    if (scene.inputElement) {
      scene.inputElement.style.display = "none";
    }

    scene.tweens.add({
      targets: cheatPanel,
      x: scene.scale.width - panelWidth - 10,
      duration: 300,
      ease: "Power2",
    });
  });

  // Close panel
  closeBtn.on("pointerdown", () => {
    scene.tweens.add({
      targets: cheatPanel,
      x: scene.scale.width,
      duration: 300,
      ease: "Power2",
    });

    arrow.setVisible(true);
    cheatLabel.setVisible(true);

    // Show mobile input again if present
    if (scene.inputElement) {
      scene.inputElement.style.display = "block";
    }
  });

  return { cheatPanel, arrow, cheatLabel };
}

