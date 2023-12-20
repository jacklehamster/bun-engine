import { Core } from "core/Core";
import { CameraMatrixType } from "gl/camera/Camera";
import { Media } from "gl/texture/Media";
import Matrix from "gl/transform/Matrix";
import { World } from "index";
import { UpdatePayload } from "updates/Refresh";
import { ActivateProps } from "world/IWorld";
import { Sprite } from "world/sprite/Sprite";

const DOBUKI = 0, LOGO = 1, GROUND = 2, HUD = 3, VIDEO = 4, GRID = 5, WIREFRAME = 6;
const LOGO_SIZE = 512;
const QUICK_TAP_TIME = 200;

export class DemoWorld extends World {
  readonly sprites: Sprite[];
  private readonly hudSpriteId = 0;
  readonly medias: Media[] = [
    {
      type: "image",
      src: 'dobuki.png',
    },
    {
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
    {
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
    {
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
    {
      type: "video",
      src: 'sample.mp4',
      volume: 0,
      fps: 30,
    },
    {
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
    {
      type: "draw",
      draw: ctx => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        ctx.imageSmoothingEnabled = true;
        ctx.lineWidth = 5;
        ctx.setLineDash([5, 2]);

        ctx.strokeStyle = 'blue';

        ctx.beginPath();
        ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.stroke();
      },
    },
  ];

  constructor(core: Core) {
    super(core);
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
      //  side walls
      ...[
        Matrix.create().translate(-1, 0, 1).rotateY(Math.PI / 2).scale(1).getMatrix(),
        Matrix.create().translate(1, 0, 1).rotateY(-Math.PI / 2).scale(1).getMatrix(),
      ].map(transform => ({ imageId: LOGO, transforms: [transform] })),
      //  floor
      ...[
        Matrix.create().translate(0, -1, 1).rotateX(-Math.PI / 2).scale(1).getMatrix(),
        Matrix.create().translate(0, -1, 3).rotateX(-Math.PI / 2).scale(1).getMatrix(),
        Matrix.create().translate(-2, -1, 3).rotateX(-Math.PI / 2).scale(1).getMatrix(),
        Matrix.create().translate(2, -1, 3).rotateX(-Math.PI / 2).scale(1).getMatrix(),
      ].map(transform => ({ imageId: GROUND, transforms: [transform] })),
      {
        imageId: VIDEO,
        transforms: [
          Matrix.create().translate(0, 5, -10).scale(480 / 50, 270 / 50, 1).getMatrix(),
        ],
      },
      ...new Array(400).fill(0).map((_, index) =>
        Matrix.create().translate((index % 20 - 10) * 2, -1.5, (Math.floor(index / 20) - 10) * 2 + 1).rotateX(-Math.PI / 2).scale(1).getMatrix(),
      ).map(transform => ({ imageId: GRID, transforms: [transform] })),

      //  Wireframe
      ...new Array(400).fill(0).map((_, index) =>
        Matrix.create().translate((index % 20 - 10) * 2, -1, (Math.floor(index / 20) - 10) * 2 + 1).rotateX(-Math.PI / 2).scale(1).getMatrix(),
      ).map(transform => ({ imageId: WIREFRAME, transforms: [transform] })),
      ...new Array(400).fill(0).map((_, index) =>
        Matrix.create().translate((index % 20 - 10) * 2, 1, (Math.floor(index / 20) - 10) * 2 + 1).rotateX(-Math.PI / 2).scale(1).getMatrix(),
      ).map(transform => ({ imageId: WIREFRAME, transforms: [transform] })),

      ...new Array(400).fill(0).map((_, index) =>
        Matrix.create().translate((index % 20 - 10) * 2, 0, (Math.floor(index / 20) - 10) * 2 + 1).getMatrix(),
      ).map(transform => ({ imageId: WIREFRAME, transforms: [transform] })),
    ];
  }

  spaceForRiseAndDrop({ deltaTime }: UpdatePayload): void {
    const speed = deltaTime / 80;
    if (this.keys.Space) {
      this.camera.moveCam(0, -speed, 0);
    } else if (this.keysUp.Space) {
      this.camera.moveCam(0, speed, 0);
      const [x, y, z] = this.camera.getPosition();
      if (y > 0) {
        this.camera.setPosition(x, 0, z);
        this.keysUp.Space = 0;
      }
    }
  }

  refresh(update: UpdatePayload): void {
    const { deltaTime } = update;
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

    this.spaceForRiseAndDrop(update);

    if (this.camera.refresh()) {
      this.informUpdate("Camera", CameraMatrixType.VIEW);
      this.informUpdate("SpriteTransform", this.hudSpriteId);
    }
  }

  private keys: Record<string, number> = {};
  private keysUp: Record<string, number> = {};
  activate({ updateCallback }: ActivateProps): () => void {
    this.informUpdate = updateCallback;
    const keyDown = (e: KeyboardEvent) => {
      if (!this.keys[e.code]) {
        this.keys[e.code] = this.core.motor.time;
      }
    };
    const keyUp = (e: KeyboardEvent) => {
      if (this.core.motor.time - this.keys[e.code] < QUICK_TAP_TIME) {
        this.keysUp[e.code] = this.keysUp[e.code] ? 0 : this.core.motor.time;
      } else {
        this.keysUp[e.code] = 0;
      }
      this.keys[e.code] = 0;
    };
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    //  Update everything
    this.informUpdate("Camera", CameraMatrixType.PROJECTION);
    this.informUpdate("Camera", CameraMatrixType.VIEW);
    [LOGO, GROUND, HUD, DOBUKI, VIDEO, GRID, WIREFRAME].forEach(id => this.informUpdate("Media", id));
    this.sprites.forEach((_, id) => {
      this.informUpdate("SpriteTransform", id);
      this.informUpdate("SpriteAnim", id);
    });

    return () => {
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      this.informUpdate = () => { };
    };
  }
}
