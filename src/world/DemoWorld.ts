import Matrix from "gl/transform/Matrix";
import { Sprite } from "./Sprite";
import World from "./World";
import { ImageId, ImageManager } from "gl/texture/ImageManager";
import { GLCamera } from "gl/camera/GLCamera";

const LOGO = 0, GROUND = 1, HUD = 2;

export class DemoWorld implements World {
  private updatedSprites: Set<number> = new Set();
  private readonly hudSpriteId = 0;

  constructor() {
    this.sprites.forEach((_, index) => this.updatedSprites.add(index));
  }

  getNumImages(): number {
    return 3;
  }

  async drawImage(id: ImageId, imageManager: ImageManager): Promise<void> {
    const LOGO_SIZE = 512;
    switch (id) {
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
    ...[
      Matrix.create().translate(0, 0, 0).getMatrix(),
      Matrix.create().translate(-1, 0, 1).rotateY(Math.PI / 2).scale(1, 1, 1).getMatrix(),
      Matrix.create().translate(1, 0, 1).rotateY(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
    ].map(transform => ({ imageId: LOGO, transforms: [transform] })),
    ...[
      Matrix.create().translate(0, -1, 1).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
      Matrix.create().translate(0, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
      Matrix.create().translate(-2, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
      Matrix.create().translate(2, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
    ].map(transform => ({ imageId: GROUND, transforms: [transform] })),
  ];

  getSpriteCount(): number {
    return this.sprites.length;
  }

  getSprite(index: number): Sprite {
    return this.sprites[index];
  }

  syncWithCamera(camera: GLCamera): void {
    GLCamera.syncHud(camera, this.hudMatrix);
    this.updatedSprites.add(this.hudSpriteId);
  }

  getUpdatedSprites(): Set<number> {
    return this.updatedSprites;
  }
}
