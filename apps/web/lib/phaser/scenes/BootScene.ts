import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    const { width, height } = this.scale;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x2a2745, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 15, 320, 30, 8);

    const loadingText = this.add
      .text(width / 2, height / 2 - 40, "Loading GatherCraft…", {
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: "16px",
        color: "#a78bfa",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x7c3aed, 1);
      progressBar.fillRoundedRect(
        width / 2 - 156,
        height / 2 - 11,
        312 * value,
        22,
        6
      );
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Generate avatar circle texture
    this.generateAvatarTextures();
  }

  create(): void {
    this.scene.start("GameScene");
  }

  private generateAvatarTextures(): void {
    const gfx = this.add.graphics();

    // Local player avatar (bright indigo ring)
    gfx.clear();
    gfx.fillStyle(0x6366f1, 1);
    gfx.fillCircle(16, 16, 14);
    gfx.fillStyle(0x1e1b2e, 1);
    gfx.fillCircle(16, 16, 11);
    gfx.fillStyle(0x818cf8, 1);
    gfx.fillCircle(16, 16, 10);
    gfx.generateTexture("avatar_local", 32, 32);
    gfx.clear();

    // Remote player avatar (teal ring)
    gfx.fillStyle(0x14b8a6, 1);
    gfx.fillCircle(16, 16, 14);
    gfx.fillStyle(0x1e1b2e, 1);
    gfx.fillCircle(16, 16, 11);
    gfx.fillStyle(0x5eead4, 1);
    gfx.fillCircle(16, 16, 10);
    gfx.generateTexture("avatar_remote", 32, 32);
    gfx.clear();

    // Shadow texture
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(16, 28, 24, 8);
    gfx.generateTexture("shadow", 32, 32);
    gfx.clear();

    // Direction indicator (small arrow)
    gfx.fillStyle(0xfbbf24, 1);
    gfx.fillTriangle(16, 4, 12, 12, 20, 12);
    gfx.generateTexture("direction_arrow", 32, 32);
    gfx.clear();

    gfx.destroy();
  }
}
