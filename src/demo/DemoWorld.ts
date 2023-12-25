import { Core } from "core/Core";
import Matrix from "gl/transform/Matrix";
import { World } from "index";
import { CamMoveAuxiliary } from "world/aux/CamMoveAuxiliary";
import { CamStepAuxiliary } from "world/aux/CamStepAuxiliary";
import { RaiseOnSpaceAuxiliary } from "world/aux/RaiseOnSpaceAuxiliary";
import { Sprite } from "world/sprite/Sprite";

const DOBUKI = 0, LOGO = 1, GROUND = 2, VIDEO = 3, GRID = 4, WIREFRAME = 5;
const LOGO_SIZE = 512;

export class DemoWorld extends World {
  readonly sprites: Sprite[];
  readonly hudSpriteId = 0;

  constructor(core: Core) {
    super(core, [
      new CamStepAuxiliary(core.camera, { step: 2 }),
      // new CamMoveAuxiliary(core.camera),
      new RaiseOnSpaceAuxiliary(core.camera),
    ]);

    this.addMedia(
      {
        id: DOBUKI,
        type: "image",
        src: 'dobuki.png',
      },
      {
        id: LOGO,
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
        id: GROUND,
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
        id: VIDEO,
        type: "video",
        src: 'sample.mp4',
        volume: 0,
        fps: 30,
      },
      {
        id: GRID,
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
        id: WIREFRAME,
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
    );

    this.sprites = [
      {
        imageId: DOBUKI,
        transforms: [
          Matrix.create().translate(0, 0, -1).getMatrix(),
        ],
      },
      //  side walls
      ...[
        Matrix.create().translate(-1, 0, 0).rotateY(Math.PI / 2).scale(1).getMatrix(),
        Matrix.create().translate(1, 0, 0).rotateY(-Math.PI / 2).scale(1).getMatrix(),
      ].map(transform => ({ imageId: LOGO, transforms: [transform] })),
      //  floor
      ...[
        Matrix.create().translate(0, -1, 0).rotateX(-Math.PI / 2).scale(1).getMatrix(),
        Matrix.create().translate(0, -1, 2).rotateX(-Math.PI / 2).scale(1).getMatrix(),
        Matrix.create().translate(-2, -1, 2).rotateX(-Math.PI / 2).scale(1).getMatrix(),
        Matrix.create().translate(2, -1, 2).rotateX(-Math.PI / 2).scale(1).getMatrix(),
      ].map(transform => ({ imageId: GROUND, transforms: [transform] })),
      {
        imageId: VIDEO,
        transforms: [
          Matrix.create().translate(0, 5, -10).scale(480 / 50, 270 / 50, 1).getMatrix(),
        ],
      },
      ...new Array(400).fill(0).map((_, index) =>
        Matrix.create().translate((index % 20 - 10) * 2, -1.5, (Math.floor(index / 20) - 10) * 2).rotateX(-Math.PI / 2).scale(1).getMatrix(),
      ).map(transform => ({ imageId: GRID, transforms: [transform] })),

      //  Wireframe
      ...new Array(400).fill(0).map((_, index) =>
        Matrix.create().translate((index % 20 - 10) * 2, -1, (Math.floor(index / 20) - 10) * 2).rotateX(-Math.PI / 2).scale(1).getMatrix(),
      ).map(transform => ({ imageId: WIREFRAME, transforms: [transform] })),
      ...new Array(400).fill(0).map((_, index) =>
        Matrix.create().translate((index % 20 - 10) * 2, 1, (Math.floor(index / 20) - 10) * 2).rotateX(-Math.PI / 2).scale(1).getMatrix(),
      ).map(transform => ({ imageId: WIREFRAME, transforms: [transform] })),

      ...new Array(400).fill(0).map((_, index) =>
        Matrix.create().translate((index % 20 - 10) * 2, 0, (Math.floor(index / 20) - 10) * 2 - 1).getMatrix(),
      ).map(transform => ({ imageId: WIREFRAME, transforms: [transform] })),
    ];
  }
}
