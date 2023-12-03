import { Core } from "core/Core";
import { Camera, CameraMatrixType } from "gl/camera/Camera";
import { ImageId } from "gl/texture/ImageManager";
import { Media } from "gl/texture/Media";
import Matrix from "gl/transform/Matrix";
import { World } from "index";
import { UpdatePayload } from "updates/Update";
import { ActivateProps } from "world/IWorld";
import { Sprite } from "world/Sprite";

const DOBUKI = 0, LOGO = 1, GROUND = 2, HUD = 3, VIDEO = 4, GRID = 5;
const LOGO_SIZE = 512;

export class DemoWorld extends World {
  private readonly sprites: Sprite[];
  private readonly hudSpriteId = 0;
  private readonly medias: Record<ImageId, Media> = {
    [VIDEO]: {
      type: "video",
      src: 'sample.mp4',
      volume: 0,
      fps: 30,
    },
    [DOBUKI]: {
      type: "image",
      src: 'dobuki.png',
    },
    [LOGO]: {
      type: "draw",
      draw: ctx => {
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
      },
    },
    [GROUND]: {
      type: "draw",
      draw: ctx => {
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
      },
    },
    [HUD]: {
      type: "draw",
      draw: ctx => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        ctx.lineWidth = canvas.width / 50;

        ctx.strokeStyle = 'black';

        ctx.beginPath();
        ctx.rect(30, 30, canvas.width - 60, canvas.height - 60);
        ctx.stroke();
      },
    },
    [GRID]: {
      type: "draw",
      draw: ctx => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        ctx.imageSmoothingEnabled = true;
        ctx.lineWidth = 5;

        ctx.strokeStyle = 'green';

        ctx.beginPath();
        ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.stroke();
      },
    },
  };

  constructor(core: Core, camera: Camera) {
    super(core, camera);
    this.sprites = [
      {
        imageId: HUD,
        transforms: [
          this.camera.getHudMatrix().getMatrix(),
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
  }

  getMedia(imageId: ImageId): Media | undefined {
    return this.medias[imageId];
  }

  getMaxSpriteCount(): number {
    return this.sprites.length;
  }

  getSprite(index: number): Sprite {
    return this.sprites[index];
  }


  update({ deltaTime }: UpdatePayload): void {
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
      this.onUpdate("Camera", CameraMatrixType.VIEW);
      this.onUpdate("SpriteTransform", this.hudSpriteId);
    }
  }

  private keys: Record<string, boolean> = {};
  activate({ onUpdate }: ActivateProps): () => void {
    this.onUpdate = onUpdate;
    const keyDown = (e: KeyboardEvent) => this.keys[e.code] = true;
    const keyUp = (e: KeyboardEvent) => this.keys[e.code] = false;
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    this.onUpdate("Camera", CameraMatrixType.PROJECTION);
    this.onUpdate("Camera", CameraMatrixType.VIEW);
    this.onUpdate("SpriteTransform", this.hudSpriteId);

    [LOGO, GROUND, HUD, DOBUKI, VIDEO, GRID].forEach(id => this.onUpdate("Media", id));

    this.sprites.forEach((_, id) => {
      this.onUpdate("SpriteTransform", id);
      this.onUpdate("SpriteAnim", id);
    });

    return () => {
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      this.onUpdate = () => { };
    };
  }
}
