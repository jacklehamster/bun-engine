import { Keyboard } from "controls/Keyboard";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { Camera } from "camera/Camera";
import Matrix from "gl/transform/Matrix";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { CellChangeAuxiliary } from "gl/transform/aux/CellChangeAuxiliary";
import IWorld from "world/IWorld";
import { Auxiliaries } from "world/aux/Auxiliaries";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { CamMoveAuxiliary } from "world/aux/CamMoveAuxiliary";
import { CamStepAuxiliary } from "world/aux/CamStepAuxiliary";
import { CamTiltResetAuxiliary } from "world/aux/CamTiltResetAuxiliary";
import { JumpAuxiliary } from "world/aux/JumpAuxiliary";
import { ToggleAuxiliary } from "world/aux/ToggleAuxiliary";
import { CellTracker } from "world/grid/CellTracker";
import { UpdatableMedias } from "world/sprite/Medias";
import { SpritesAccumulator } from "world/sprite/SpritesAccumulator";
import { SpriteGroup } from "world/sprite/SpritesGroup";
import { FixedSpriteGrid } from "world/sprite/aux/FixedSpriteGrid";
import { MaxSpriteCountAuxiliary } from "world/sprite/aux/MaxSpriteCountAuxiliary";
import { SpriteGrid } from "world/sprite/aux/SpriteGrid";
import { StaticSprites } from "world/sprite/aux/StaticSprites";
import { SpriteUpdater } from "world/sprite/update/SpriteUpdater";
import { SpriteType } from "world/sprite/Sprite";
import { ICamera } from "camera/ICamera";
import { KeyboardControls } from "controls/KeyboardControls";

const DOBUKI = 0, LOGO = 1, GROUND = 2, VIDEO = 3, WIREFRAME = 4, GRASS = 5, BRICK = 6;
const LOGO_SIZE = 512;
const CELLSIZE = 2;

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class DemoWorld extends AuxiliaryHolder<IWorld> implements IWorld {
  camera: ICamera;
  constructor({ engine, motor }: Props) {
    super();

    //  Add a sprite accumulator.
    //  * Sprite accumulators are used to collect sprite definitions, so that the engine can display them.
    const spritesAccumulator = new SpritesAccumulator().addAuxiliary(
      new SpriteUpdater({ engine, motor }),
      new MaxSpriteCountAuxiliary({ engine }));
    this.addAuxiliary(spritesAccumulator);

    //  Add medias
    //  * Each media is a texture that can be shown on a sprite.
    //  * You can show videos, images, or you can have instructions to draw on a canvas.
    const medias = new UpdatableMedias({ engine, motor });
    medias.set(DOBUKI, {
      type: "image", src: "dobuki.png",
    });
    medias.set(LOGO, {
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
    });
    medias.set(GROUND, {
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
    });
    medias.set(BRICK, {
      type: "draw",
      draw: ctx => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        ctx.fillStyle = '#ddd';
        ctx.lineWidth = canvas.width / 50;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      },
    });
    medias.set(VIDEO, {
      type: "video",
      src: 'sample.mp4',
      volume: 0,
      fps: 30,
      playSpeed: .1,
      maxRefreshRate: 30,
    });
    medias.set(WIREFRAME, {
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
    });
    medias.set(GRASS, {
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
    });

    //  Adding a FixedSpriteGrid to the sprite accumulator.
    //  * You add sprite collections as "SpriteGrid". That way, the engine
    //  * will hide sprites if you're too far, and show them again if you're close.
    spritesAccumulator.addAuxiliary(new FixedSpriteGrid(
      { cellSize: CELLSIZE },
      //  Dobuki logo
      [
        {
          imageId: DOBUKI,
          spriteType: SpriteType.SPRITE,
          transform: Matrix.create().translate(0, 0, -1),
        },
      ],
      //  Side walls with happy face logo
      [
        //  side walls
        ...[
          Matrix.create().translate(-1, 0, 0).rotateY(Math.PI / 2),
          Matrix.create().translate(-1, 0, 0).rotateY(-Math.PI / 2),
          Matrix.create().translate(1, 0, 0).rotateY(-Math.PI / 2),
          Matrix.create().translate(1, 0, 0).rotateY(Math.PI / 2),
        ].map(transform => ({ imageId: LOGO, transform })),
        //  floor
        ...[
          Matrix.create().translate(0, -1, 0).rotateX(-Math.PI / 2),
          Matrix.create().translate(0, -1, 2).rotateX(-Math.PI / 2),
          Matrix.create().translate(-2, -1, 2).rotateX(-Math.PI / 2),
          Matrix.create().translate(2, -1, 2).rotateX(-Math.PI / 2),
        ].map(transform => ({ imageId: GROUND, transform })),
      ],
      //  This is a block, moved 3 spaces back
      new SpriteGroup([
        //  block outside
        ...[
          Matrix.create().translate(0, -1, 0).rotateX(Math.PI / 2),
          Matrix.create().translate(0, 1, 0).rotateX(-Math.PI / 2),
          Matrix.create().translate(-1, 0, 0).rotateY(-Math.PI / 2),
          Matrix.create().translate(1, 0, 0).rotateY(Math.PI / 2),
          Matrix.create().translate(0, 0, 1).rotateY(0),  //  front
          Matrix.create().translate(0, 0, -1).rotateY(Math.PI), //  back
        ].map(transform => ({ imageId: GROUND, transform })),
        //  Inside
        ...[
          Matrix.create().translate(0, -1, 0).rotateX(-Math.PI / 2),
          Matrix.create().translate(0, 1, 0).rotateX(Math.PI / 2),
          Matrix.create().translate(-1, 0, 0).rotateY(Math.PI / 2),
          Matrix.create().translate(1, 0, 0).rotateY(-Math.PI / 2),
          Matrix.create().translate(0, 0, 1).rotateY(Math.PI),  //  front
          Matrix.create().translate(0, 0, -1).rotateY(0), //  back
        ].map(transform => ({ imageId: BRICK, transform })),
      ], Matrix.create().setPosition(...PositionMatrix.positionFromCell([0, 0, -3, CELLSIZE]))),
    ));

    const camera = new Camera({ engine, motor });
    this.addAuxiliary(camera);
    this.camera = camera;

    //  * A move blocker just determines where you can or cannot move.
    //  Currently, there is just one block at [0, 0, -3]
    camera.posMatrix.moveBlocker = {
      isBlocked(pos): boolean {
        const [cx, cy, cz] = PositionMatrix.getCellPos(pos, 2);
        return cx === 0 && cy === 0 && cz === -3;
      },
    };

    //  Dynamic SpriteGrid
    //  * This SpriteGrid is dynamic, meaning that the cell gets generated on the
    //  * fly. This allows us to produce an infinite amounts of cells.
    spritesAccumulator.addAuxiliary(new SpriteGrid(
      { yRange: [0, 0] }, {
      getSpritesAtCell: cell => [
        { //  ground
          imageId: GRASS,
          transform: Matrix.create().translate(cell.pos[0] * cell.pos[3], -1, cell.pos[2] * cell.pos[3]).rotateX(-Math.PI / 2).scale(1)
        },
        { //  ceiling
          imageId: WIREFRAME,
          transform: Matrix.create().translate(cell.pos[0] * cell.pos[3], 2, cell.pos[2] * cell.pos[3]).rotateX(Math.PI / 2).scale(1)
        },
      ]
    }));

    //  Static Sprites
    //  * This is just one sprite, which will appear regardless of where
    //  * you are in the scene.
    //  TODO: Currently, I think this is not visible because it's affected by distance fade.
    //  Will update to have each sprite allow different levels of fade.
    spritesAccumulator.addAuxiliary(new StaticSprites([{
      imageId: VIDEO,
      transform: Matrix.create()
        .translate(0, 10000, -50000)
        .scale(480 * 20, 270 * 20, 1),
    }]));

    //  Toggle auxiliary
    //  * Pressing the "Tab" button switches between two modes of movement below
    //  * The CamStepAuxiliary is "dungeon" crawling mode, where you move cell by cell.
    //  * CamTiltReset is just for restoring the view from looking up or down
    //  * CamMoveAuxiliary is a more free-form way to move.
    //  * JumpAuxiliary lets you jump
    const keyboard = new Keyboard({ motor });
    const controls = new KeyboardControls(keyboard);
    keyboard.addAuxiliary(
      new ToggleAuxiliary({
        auxiliariesMapping: [
          {
            key: "Tab", aux: Auxiliaries.from(
              new CamStepAuxiliary({ controls, camera }, { step: 2, turnStep: Math.PI / 2, tiltStep: Math.PI / 4 }),
              new CamTiltResetAuxiliary({ controls, camera }),
            )
          },
          {
            key: "Tab", aux: Auxiliaries.from(
              new CamMoveAuxiliary({ controls, camera }),
              new JumpAuxiliary({ controls, camera }),
              new CamTiltResetAuxiliary({ controls, camera }),
            )
          },
        ],
      }),
    );
    this.addAuxiliary(keyboard);


    //  CellChangeAuxiliary
    //  * This is needed to indicate when the player is changing cell
    //  * as they move. Every cell change, a new set of surrounding cells
    //  * is evaluated, and some are created as needed.
    camera.posMatrix.addAuxiliary(
      new CellChangeAuxiliary({
        cellSize: CELLSIZE,
      }).addAuxiliary(new CellTracker(this, {
        cellLimit: 5000,
        range: [25, 3, 25],
        cellSize: CELLSIZE,
      })));
  }
}
