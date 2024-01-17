import { Keyboard } from "controls/Keyboard";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { Camera } from "camera/Camera";
import Matrix from "gl/transform/Matrix";
import { CellChangeAuxiliary } from "gl/transform/aux/CellChangeAuxiliary";
import IWorld from "world/IWorld";
import { Auxiliaries } from "world/aux/Auxiliaries";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { TurnAuxiliary } from "world/aux/TurnAuxiliary";
import { PositionStepAuxiliary } from "world/aux/PositionStepAuxiliary";
import { TiltResetAuxiliary } from "world/aux/TiltResetAuxiliary";
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
import { SpriteFactory } from "world/sprite/SpritesFactory";
import { MoveAuxiliary } from "world/aux/MoveAuxiliary";
import { getCellPos, positionFromCell } from "world/grid/CellPos";
import { JumpAuxiliary } from "world/aux/JumpAuxiliary";
import { TimeAuxiliary } from "core/aux/TimeAuxiliary";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { TiltAuxiliary } from "world/aux/TiltAuxiliary";
import { SmoothFollowAuxiliary } from "world/aux/SmoothFollowAuxiliary";
import { DirAuxiliary } from "world/aux/DirAuxiliary";
import { SpriteUpdateType } from "world/sprite/update/SpriteUpdateType";

const DOBUKI = 0, LOGO = 1, GROUND = 2, VIDEO = 3, WIREFRAME = 4, GRASS = 5, BRICK = 6, DODO = 7, DODO_SHADOW = 8;
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
    medias.set(DODO, {
      type: "image", src: "dodo.png",
      spriteSheet: {
        spriteSize: [190, 290],
      },
    });
    medias.set(DODO_SHADOW, {
      type: "image", src: "dodo.png",
      spriteSheet: {
        spriteSize: [190, 290],
      },
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
        ctx.lineWidth = 8;
        // ctx.fillStyle = "black";
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.setLineDash([5, 2]);

        ctx.strokeStyle = 'green';

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
      ], [Matrix.create().setPosition(...positionFromCell([0, 0, -3, CELLSIZE]))]),
    ));

    const camera = new Camera({ engine, motor });
    this.addAuxiliary(camera);
    this.camera = camera;

    //  Dynamic SpriteGrid
    //  * This SpriteGrid is dynamic, meaning that the cell gets generated on the
    //  * fly. This allows us to produce an infinite amounts of cells.
    spritesAccumulator.addAuxiliary(new SpriteGrid(
      { yRange: [0, 0] }, new SpriteFactory({
        fillSpriteBag({ pos }, _, bag) {
          const ground = bag.createSprite(GRASS);
          ground.transform.translate(pos[0] * pos[3], -1, pos[2] * pos[3]).rotateX(-Math.PI / 2);
          const ceiling = bag.createSprite(WIREFRAME);
          ceiling.transform.translate(pos[0] * pos[3], 2, pos[2] * pos[3]).rotateX(Math.PI / 2);
          bag.addSprite(ground, ceiling);
        },
      })));

    const heroPos: PositionMatrix = new PositionMatrix().onChange(() => {
      heroSprites.informUpdate(0, SpriteUpdateType.TRANSFORM);
      heroSprites.informUpdate(1, SpriteUpdateType.TRANSFORM);
    });
    const spriteGroup = new SpriteGroup([
      {
        imageId: DODO,
        spriteType: SpriteType.SPRITE,
        transform: Matrix.create().translate(0, -.68, 0),
        animation: {
          frames: [1, 5],
          fps: 24,
        },
      },
      {
        imageId: DODO,
        transform: Matrix.create().translate(0, -0.9, 0).rotateX(-Math.PI / 2).scale(1, .3, 1),
        animation: {
          frames: [1, 5],
          fps: 24,
        },
      },
    ], [heroPos]);
    const heroSprites = new StaticSprites(spriteGroup);
    spritesAccumulator.addAuxiliary(heroSprites);

    //  * A move blocker just determines where you can or cannot move.
    //  Currently, there is just one block at [0, 0, -3]
    heroPos.moveBlocker = {
      isBlocked(pos): boolean {
        const [cx, cy, cz] = getCellPos(pos, 2);
        return cx === 0 && cy === 0 && cz === -3;
      },
    };

    //  Static Sprites
    //  * Those are just sprites, which will appear regardless of where
    //  * you are in the scene.
    spritesAccumulator.addAuxiliary(new StaticSprites([
      {
        imageId: VIDEO,
        spriteType: SpriteType.DISTANT,
        transform: Matrix.create()
          .translate(3000, 1000, -5000)
          .scale(480, 270, 1),
      },
    ]));


    //  Note that you don't need a StaticSprites auxiliary for adding simple permanent
    //  sprites. You can just do this directly.
    //  That said, StaticSprites is a better use, for its ability to be switched on/off
    // spritesAccumulator.addSprites([
    //   {
    //     imageId: DOBUKI,
    //     spriteType: SpriteType.HUD,
    //     transform: Matrix.create().translate(-.45, .45, -.5).scale(.05),
    //   },
    // ]);

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
              new PositionStepAuxiliary({ controls, position: heroPos }),
              new TiltResetAuxiliary({ controls, tilt: camera.tilt }),
              new SmoothFollowAuxiliary({ follower: camera.position, followee: heroPos }, { speed: .05 }),
            )
          },
          {
            key: "Tab", aux: Auxiliaries.from(
              new TurnAuxiliary({ controls, turn: camera.turn }),
              new TiltAuxiliary({ controls, tilt: camera.tilt }),
              new MoveAuxiliary({ controls, direction: camera.turn, position: camera.position }),
              new JumpAuxiliary({ controls, position: camera.position }),
              new TiltResetAuxiliary({ controls, tilt: camera.tilt }),
            )
          },
        ],
      }),
    );
    this.addAuxiliary(keyboard);

    this.addAuxiliary(new DirAuxiliary({ flippable: spriteGroup, controls }, () => {
      heroSprites.informUpdate(0, SpriteUpdateType.TEX_SLOT);
      heroSprites.informUpdate(1, SpriteUpdateType.TEX_SLOT);
    }));

    // heroPos.addChangeListener((dx, dy, dz) => {
    //   console.log("heropos change", heroPos.position);
    //   camera.position.moveBy(dx, dy, dz);
    // });
    // camera.position.addChangeListener(() => {
    //   console.log("camera change", heroPos.position);
    // })

    //  CellChangeAuxiliary
    //  * This is needed to indicate when the player is changing cell
    //  * as they move. Every cell change, a new set of surrounding cells
    //  * is evaluated, and some are created as needed.
    camera.position.addAuxiliary(
      new CellChangeAuxiliary({ cellSize: CELLSIZE })
        .addAuxiliary(new CellTracker(this, {
          cellLimit: 20000,
          range: [30, 3, 30],
          cellSize: CELLSIZE,
        })));

    //  Hack some base settings
    camera.distance.setValue(5)
    camera.tilt.angle.setValue(1.2);
    camera.projection.zoom.setValue(.25);
    camera.projection.perspective.setValue(.05);
    this.addAuxiliary(new TimeAuxiliary(engine));
  }
}
