import { Core } from "core/Core";
import Matrix from "gl/transform/Matrix";
import { CellChangeAuxiliary } from "gl/transform/aux/CellChangeAuxiliary";
import { World } from "index";
import { Auxiliaries } from "world/aux/Auxiliaries";
import { CamMoveAuxiliary } from "world/aux/CamMoveAuxiliary";
import { CamStepAuxiliary } from "world/aux/CamStepAuxiliary";
import { CamTiltResetAuxiliary } from "world/aux/CamTiltResetAuxiliary";
import { RiseAuxiliary } from "world/aux/RiseAuxiliary";
import { ToggleAuxiliary } from "world/aux/ToggleAuxiliary";
import { CellTracker } from "world/grid/CellTracker";
import { SpriteGroup } from "world/sprite/SpritesGroup";
import { FixedSpriteGrid } from "world/sprite/aux/FixedSpriteGrid";
import { SpriteGrid } from "world/sprite/aux/SpriteGrid";
import { StaticSprites } from "world/sprite/aux/StaticSprites";

const DOBUKI = 0, LOGO = 1, GROUND = 2, VIDEO = 3, WIREFRAME = 4, GRASS = 5;
const LOGO_SIZE = 512;
const CELLSIZE = 2;
const SPRITE_LIMIT = 10000;

export class DemoWorld extends World {
  constructor(private core: Core) {
    super(core);

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
        playSpeed: .1,
        maxRefreshRate: 30,
      },
      {
        id: WIREFRAME,
        type: "draw",
        draw: ctx => {
          const { canvas } = ctx;
          canvas.width = LOGO_SIZE;
          canvas.height = LOGO_SIZE;
          ctx.lineWidth = 5;
          ctx.setLineDash([5, 2]);

          ctx.strokeStyle = 'blue';

          ctx.beginPath();
          ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
          ctx.stroke();
        },
      },
      {
        id: GRASS,
        type: "draw",
        draw: ctx => {
          const { canvas } = ctx;
          canvas.width = LOGO_SIZE;
          canvas.height = LOGO_SIZE;
          ctx.fillStyle = 'green';
          ctx.lineWidth = canvas.width / 50;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = 'black';
          ctx.fillStyle = '#4f8';

          ctx.beginPath();
          ctx.rect(canvas.width * .2, canvas.height * .2, canvas.width * .6, canvas.height * .6);
          ctx.fill();
          ctx.stroke();
        },
      },
    );

    this.addAuxiliary(new FixedSpriteGrid(
      { cellSize: CELLSIZE },
      new SpriteGroup([
        //  side walls
        ...[
          Matrix.create().translate(-1, 0, 0).rotateY(Math.PI / 2).scale(1),
          Matrix.create().translate(-1, 0, 0).rotateY(-Math.PI / 2).scale(1),
          Matrix.create().translate(1, 0, 0).rotateY(-Math.PI / 2).scale(1),
          Matrix.create().translate(1, 0, 0).rotateY(Math.PI / 2).scale(1),
        ].map(transform => ({ imageId: LOGO, transform })),
        //  floor
        ...[
          Matrix.create().translate(0, -1, 0).rotateX(-Math.PI / 2),
          Matrix.create().translate(0, -1, 2).rotateX(-Math.PI / 2),
          Matrix.create().translate(-2, -1, 2).rotateX(-Math.PI / 2),
          Matrix.create().translate(2, -1, 2).rotateX(-Math.PI / 2),
        ].map(transform => ({ imageId: GROUND, transform })),
      ], Matrix.create()),
      new SpriteGroup([
        //  block
        ...[
          Matrix.create().translate(-1, 0, 0).rotateY(-Math.PI / 2),
          Matrix.create().translate(1, 0, 0).rotateY(Math.PI / 2),
          Matrix.create().translate(0, 0, 1).rotateY(0),  //  front
          Matrix.create().translate(0, 0, -1).rotateY(Math.PI), //  back
        ].map(transform => ({ imageId: GROUND, transform })),
      ], Matrix.create().setPosition(0, 0, -6)),
    ));

    this.addAuxiliary(new FixedSpriteGrid(
      { cellSize: CELLSIZE },
      [
        {
          imageId: DOBUKI,
          transform: Matrix.create().translate(0, 0, -1),
        },
        {
          imageId: DOBUKI,
          transform: Matrix.create().translate(0, 0, -1).rotateY(Math.PI),
        },
      ]));

    this.addAuxiliary(new SpriteGrid(
      { spriteLimit: SPRITE_LIMIT, yRange: [0, 0] }, {
      getSpritesAtCell: cell => [
        { //  ground
          name: `${cell.pos[0]}_${cell.pos[2]}`,
          imageId: GRASS,
          transform: Matrix.create().translate(cell.pos[0] * cell.pos[3], -1, cell.pos[2] * cell.pos[3]).rotateX(-Math.PI / 2).scale(1)
        },
        { //  ceiling
          imageId: WIREFRAME,
          transform: Matrix.create().translate(cell.pos[0] * cell.pos[3], 1, cell.pos[2] * cell.pos[3]).rotateX(Math.PI / 2).scale(1)
        },
      ]
    }));

    this.addAuxiliary(new StaticSprites([{
      imageId: VIDEO,
      transform: Matrix.create()
        .translate(0, 10000, -50000)
        .scale(480 * 20, 270 * 20, 1),
    }]));

    this.core.keyboard.addAuxiliary(
      new ToggleAuxiliary({
        auxiliariesMapping: [
          {
            key: "Tab", aux: Auxiliaries.from(
              new CamStepAuxiliary(this.core, { step: 2, turnStep: Math.PI / 2, tiltStep: Math.PI / 4 }),
              new CamTiltResetAuxiliary(this.core, { key: "ShiftRight" }),
            )
          },
          {
            key: "Tab", aux: Auxiliaries.from(
              new CamMoveAuxiliary(this.core),
              new RiseAuxiliary(this.core),
              new CamTiltResetAuxiliary(this.core, { key: "ShiftRight" }),
            )
          },
        ],
      }),
    );

    this.core.camera.posMatrix.addAuxiliary(
      new CellChangeAuxiliary({
        visitCell: new CellTracker(this, {
          cellLimit: 500,
          range: [10, 3, 10],
          cellSize: CELLSIZE,
        })
      }, {
        cellSize: CELLSIZE,
      }));
  }
}
