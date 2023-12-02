import Matrix from "gl/transform/Matrix";
import { Sprite, SpriteId } from "./Sprite";
import IWorld from "./IWorld";
import { ImageId, ImageManager } from "gl/texture/ImageManager";
import { CameraMatrixType, Camera } from "gl/camera/Camera";
import { MediaData } from "gl/texture/MediaData";
import { Motor } from "core/Motor";
import { Core } from "core/Core";
import { CameraMatrixUpdate } from "updates/CameraMatrixUpdate";
import { Updates } from "updates/Update";

const DOBUKI = 0, LOGO = 1, GROUND = 2, HUD = 3, VIDEO = 4, GRID = 5;

export class World implements IWorld {
  private readonly updatedSpriteTransforms: Set<SpriteId> = new Set();
  private readonly updatedSpriteTextureSlots: Set<SpriteId> = new Set();
  private readonly updateSpriteIds: Set<ImageId> = new Set();
  private readonly hudMatrix: Matrix = Matrix.create();
  private readonly hudSpriteId = 0;
  private readonly camera: Camera = new Camera();
  private cameraUpdate: Record<CameraMatrixType, Updates>;

  constructor(public core: Core) {
    this.sprites.forEach((_, index) => {
      this.updatedSpriteTransforms.add(index);
      this.updatedSpriteTextureSlots.add(index);
    });
    this.cameraUpdate = {
      PROJECTION: new CameraMatrixUpdate(CameraMatrixType.PROJECTION, this, this.core.engine),
      VIEW: [
        new CameraMatrixUpdate(CameraMatrixType.VIEW, this, this.core.engine),
        {
          update: () => this.camera.syncHud(this.hudMatrix),
        },
        {
          update: () =>
            this.updatedSpriteTransforms.add(this.hudSpriteId)
        },
      ],
    };
    [LOGO, GROUND, HUD, DOBUKI, VIDEO, GRID].forEach(id => this.updateSpriteIds.add(id));
    this.core.motor.registerUpdate(this.cameraUpdate[CameraMatrixType.VIEW]);
    this.core.motor.registerUpdate(this.cameraUpdate[CameraMatrixType.PROJECTION]);
    this.onResize = this.onResize.bind(this);
  }

  onResize(width: number, height: number) {
    this.camera.configProjectionMatrix(width, height);
    this.core.motor.registerUpdate(this.cameraUpdate[CameraMatrixType.PROJECTION]);
  }

  period?: number | undefined;
  getCamera(): Camera {
    return this.camera;
  }

  getCameraMatrix(cameraMatrixType: CameraMatrixType): Float32Array {
    return this.camera.getCameraMatrix(cameraMatrixType);
  }

  getUpdateImageIds(): Set<ImageId> {
    return this.updateSpriteIds;
  }

  getUpdatedSpriteTextureSlot(): Set<SpriteId> {
    return this.updatedSpriteTextureSlots
  }

  async drawImage(id: ImageId, imageManager: ImageManager): Promise<MediaData | undefined> {
    const LOGO_SIZE = 512;
    switch (id) {
      case VIDEO:
        return await imageManager.loadVideo(id, 'sample.mp4', 0);
      case DOBUKI:
        return await imageManager.loadImage(id, 'dobuki.png');
      case LOGO:
        return await imageManager.drawImage(id, ctx => {
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
      case GROUND:
        return await imageManager.drawImage(id, ctx => {
          const { canvas } = ctx;
          canvas.width = LOGO_SIZE;
          canvas.height = LOGO_SIZE;
          ctx.imageSmoothingEnabled = true;
          ctx.fillStyle = '#ddd';
          ctx.lineWidth = canvas.width / 50;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'silver';

          ctx.beginPath();
          ctx.rect(canvas.width * .2, canvas.height * .2, canvas.width * .6, canvas.height * .6);
          ctx.fill();
          ctx.stroke();
        });
      case HUD:
        return await imageManager.drawImage(id, ctx => {
          const { canvas } = ctx;
          canvas.width = LOGO_SIZE;
          canvas.height = LOGO_SIZE;
          ctx.lineWidth = canvas.width / 50;

          ctx.strokeStyle = 'black';

          ctx.beginPath();
          ctx.rect(30, 30, canvas.width - 60, canvas.height - 60);
          ctx.stroke();
        });
      case GRID:
        return await imageManager.drawImage(id, ctx => {
          const { canvas } = ctx;
          canvas.width = LOGO_SIZE;
          canvas.height = LOGO_SIZE;
          ctx.imageSmoothingEnabled = true;
          ctx.lineWidth = 5;

          ctx.strokeStyle = 'green';

          ctx.beginPath();
          ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
          ctx.stroke();
        });
    }
    return;
  }
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
    ...new Array(400).fill(0).map((_, index) =>
      Matrix.create().translate(index % 20 - 10, -1.5, Math.floor(index / 20) - 10).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
    ).map(transform => ({ imageId: GRID, transforms: [transform] })),
  ];

  getMaxSpriteCount(): number {
    return this.sprites.length;
  }

  getSprite(index: number): Sprite {
    return this.sprites[index];
  }

  update(_: Motor, deltaTime: number): void {
    const speed = deltaTime / 80;
    const turnspeed = deltaTime / 400;
    if (this.keys.KeyW || this.keys.ArrowUp && !this.keys.ShiftRight) {
      this.camera.moveCam(0, 0, speed);
    }
    if (this.keys.KeyS || this.keys.ArrowDown && !this.keys.ShiftRight) {
      this.camera.moveCam(0, 0, -speed);
    }
    if (this.keys.KeyA || (this.keys.ArrowLeft && !this.keys.ShiftRight)) {
      this.camera.moveCam(-speed, 0, 0);
    }
    if (this.keys.KeyD || (this.keys.ArrowRight && !this.keys.ShiftRight)) {
      this.camera.moveCam(speed, 0, 0);
    }
    if (this.keys.KeyQ || (this.keys.ArrowLeft && this.keys.ShiftRight)) {
      this.camera.turnCam(-turnspeed);
    }
    if (this.keys.KeyE || (this.keys.ArrowRight && this.keys.ShiftRight)) {
      this.camera.turnCam(turnspeed);
    }
    if (this.keys.ArrowUp && this.keys.ShiftRight) {
      this.camera.tilt(-turnspeed);
    }
    if (this.keys.ArrowDown && this.keys.ShiftRight) {
      this.camera.tilt(turnspeed);
    }

    if (this.camera.refresh()) {
      this.core.motor.registerUpdate(this.cameraUpdate[CameraMatrixType.VIEW]);
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
    this.core.engine.addResizeListener(this.onResize);

    return () => {
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      this.core.engine.removeResizeListener(this.onResize);
    };
  }
}
