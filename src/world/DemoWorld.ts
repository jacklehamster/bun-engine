import Matrix from "gl/transform/Matrix";
import { Sprite, SpriteId } from "./Sprite";
import World from "./World";
import { ImageId, ImageManager } from "gl/texture/ImageManager";
import { GLCamera } from "gl/camera/GLCamera";

const DOBUKI = 0, LOGO = 1, GROUND = 2, HUD = 3, VIDEO = 4;

export class DemoWorld implements World {
  private readonly updatedSpriteTransforms: Set<SpriteId> = new Set();
  private readonly updatedSpriteTextureSlots: Set<SpriteId> = new Set();
  private readonly updateSpriteIds: Set<ImageId> = new Set();
  private readonly hudSpriteId = 0;

  constructor() {
    this.sprites.forEach((_, index) => {
      this.updatedSpriteTransforms.add(index);
      this.updatedSpriteTextureSlots.add(index);
    });
    [LOGO, GROUND, HUD, DOBUKI, VIDEO].forEach(id => this.updateSpriteIds.add(id));
  }

  getUpdateImageIds(): Set<ImageId> {
    return this.updateSpriteIds;
  }

  getUpdatedSpriteTextureSlot(): Set<SpriteId> {
    return this.updatedSpriteTextureSlots
  }

  async drawImage(id: ImageId, imageManager: ImageManager): Promise<void> {
    const LOGO_SIZE = 512;
    switch (id) {
      case VIDEO:
        await imageManager.loadVideo(id, 'sample.mp4', 0);
        break;
      case DOBUKI:
        await imageManager.loadImage(id, 'dobuki.png');
        break;
      case LOGO:
        imageManager.drawImage(id, ctx => {
          const { canvas } = ctx;
          canvas.width = LOGO_SIZE;
          canvas.height = LOGO_SIZE;
          const centerX = canvas.width / 2, centerY = canvas.height / 2;
          const halfSize = canvas.width / 2;
          ctx.imageSmoothingEnabled = true;
          ctx.fillStyle = '#ddd';
          ctx.lineWidth = canvas.width / 50;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'gold';

          //  face
          ctx.beginPath();
          ctx.arc(centerX, centerY, halfSize * 0.8, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          //  smile
          ctx.beginPath();
          ctx.arc(centerX, centerY, halfSize * 0.5, 0, Math.PI);
          ctx.stroke();

          //  left eye
          ctx.beginPath();
          ctx.arc(canvas.width / 3, canvas.height / 3, halfSize * 0.1, 0, Math.PI, true);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc((canvas.width / 3) * 2, canvas.height / 3, halfSize * 0.1, 0, Math.PI * 2, true);
          ctx.stroke();
        });
        break;
      case GROUND:
        imageManager.drawImage(id, ctx => {
          const { canvas } = ctx;
          canvas.width = LOGO_SIZE;
          canvas.height = LOGO_SIZE;
          ctx.imageSmoothingEnabled = true;
          ctx.fillStyle = '#ddd';
          ctx.lineWidth = canvas.width / 50;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'silver';

          //  face
          ctx.beginPath();
          ctx.rect(canvas.width * .2, canvas.height * .2, canvas.width * .6, canvas.height * .6);
          ctx.fill();
          ctx.stroke();
        });
        break;
      case HUD:
        imageManager.drawImage(id, ctx => {
          const { canvas } = ctx;
          canvas.width = LOGO_SIZE;
          canvas.height = LOGO_SIZE;
          ctx.imageSmoothingEnabled = true;
          ctx.fillStyle = '#ddd';
          ctx.lineWidth = canvas.width / 50;

          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'silver';

          ctx.beginPath();
          ctx.rect(30, 30, canvas.width - 60, canvas.height - 60);
          ctx.stroke();
        });
        break;
    }
  }
  private readonly hudMatrix: Matrix = Matrix.create();
  private readonly sprites: Sprite[] = [
    {
      imageId: HUD,
      transforms: [
        this.hudMatrix.getMatrix(),
      ],
    },
    {
      imageId: DOBUKI,
      transforms: [
        Matrix.create().translate(0, 0, 0).getMatrix(),
      ],
    },
    ...[
      Matrix.create().translate(-1, 0, 1).rotateY(Math.PI / 2).scale(1, 1, 1).getMatrix(),
      Matrix.create().translate(1, 0, 1).rotateY(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
    ].map(transform => ({ imageId: LOGO, transforms: [transform] })),
    ...[
      Matrix.create().translate(0, -1, 1).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
      Matrix.create().translate(0, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
      Matrix.create().translate(-2, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
      Matrix.create().translate(2, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
    ].map(transform => ({ imageId: GROUND, transforms: [transform] })),
    {
      imageId: VIDEO,
      transforms: [
        Matrix.create().translate(0, 5, -10).scale(480 / 50, 270 / 50, 1).getMatrix(),
      ],
    },
  ];

  getMaxSpriteCount(): number {
    return this.sprites.length;
  }

  getSprite(index: number): Sprite {
    return this.sprites[index];
  }

  syncWithCamera(camera: GLCamera): void {
    const speed = 1 / 4;
    const turnspeed = 1 / 20;
    if (this.keys.KeyW) {
      camera.moveCam(0, 0, speed);
    }
    if (this.keys.KeyS) {
      camera.moveCam(0, 0, -speed);
    }
    if (this.keys.ArrowUp && !this.keys.ShiftRight) {
      camera.moveCam(0, -speed, 0);
    }
    if (this.keys.ArrowDown && !this.keys.ShiftRight) {
      camera.moveCam(0, speed, 0);
    }
    if (this.keys.KeyA || (this.keys.ArrowLeft && !this.keys.ShiftRight)) {
      camera.moveCam(-speed, 0, 0);
    }
    if (this.keys.KeyD || (this.keys.ArrowRight && !this.keys.ShiftRight)) {
      camera.moveCam(speed, 0, 0);
    }
    if (this.keys.KeyQ || (this.keys.ArrowLeft && this.keys.ShiftRight)) {
      camera.turnCam(-turnspeed);
    }
    if (this.keys.KeyE || (this.keys.ArrowRight && this.keys.ShiftRight)) {
      camera.turnCam(turnspeed);
    }
    if (this.keys.ArrowUp && this.keys.ShiftRight) {
      camera.tilt(-turnspeed);
    }
    if (this.keys.ArrowDown && this.keys.ShiftRight) {
      camera.tilt(turnspeed);
    }

    if (camera.refresh()) {
      camera.syncHud(this.hudMatrix);
      this.updatedSpriteTransforms.add(this.hudSpriteId);
    }
  }

  getUpdatedSpriteTransforms(): Set<SpriteId> {
    return this.updatedSpriteTransforms;
  }

  private keys: Record<string, boolean> = {};
  activate(): () => void {
    const keyDown = (e: KeyboardEvent) => this.keys[e.code] = true;
    const keyUp = (e: KeyboardEvent) => this.keys[e.code] = false;
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    return () => {
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
    };
  }
}
