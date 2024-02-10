import IWorld from "world/IWorld";
import Matrix from "gl/transform/Matrix";
import { Keyboard } from "controls/Keyboard";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { Camera } from "camera/Camera";
import { CellChangeDectector } from "gl/transform/aux/CellChangeDetector";
import { Auxiliaries } from "world/aux/Auxiliaries";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { TurnAuxiliary } from "world/aux/TurnAuxiliary";
import { PositionStepAuxiliary } from "world/aux/PositionStepAuxiliary";
import { TiltResetAuxiliary } from "world/aux/TiltResetAuxiliary";
import { ToggleAuxiliary } from "world/aux/ToggleAuxiliary";
import { SpriteGroup } from "world/sprite/aux/SpritesGroup";
import { MaxCountAuxiliary } from "world/sprite/aux/MaxCountAuxiliary";
import { SpriteUpdater } from "world/sprite/update/SpriteUpdater";
import { Sprite } from "world/sprite/Sprite";
import { SpriteType } from "world/sprite/SpriteType";
import { ICamera } from "camera/ICamera";
import { SpriteFactory } from "world/sprite/SpritesFactory";
import { MoveAuxiliary } from "world/aux/MoveAuxiliary";
import { CellUtils } from "world/grid/utils/cell-utils";
import { JumpAuxiliary } from "world/aux/JumpAuxiliary";
import { TimeAuxiliary } from "core/aux/TimeAuxiliary";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { TiltAuxiliary } from "world/aux/TiltAuxiliary";
import { SmoothFollowAuxiliary } from "world/aux/SmoothFollowAuxiliary";
import { DirAuxiliary } from "world/aux/DirAuxiliary";
import { SpriteUpdateType } from "world/sprite/update/SpriteUpdateType";
import { MediaUpdater } from "world/sprite/update/MediaUpdater";
import { Accumulator } from "world/sprite/aux/Accumulator";
import { Media } from "gl-texture-manager";
import { AnimationUpdater } from "world/sprite/update/AnimationUpdater";
import { Animation } from "animation/Animation";
import { MotionAuxiliary } from "world/aux/MotionAuxiliary";
import { FollowAuxiliary } from "world/aux/FollowAuxiliary";
import { ItemsGroup } from "world/sprite/aux/ItemsGroup";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";
import { DisplayBox } from "world/collision/DisplayBox";
import { CollisionDetector } from "world/collision/CollisionDetector";
import { CollisionDetectors } from "world/collision/CollisionDetectors";
import { UserInterface } from "ui/UserInterface";
import { IControls } from "controls/IControls";
import { IFade, FadeAuxiliary } from "world/aux/FadeAuxiliary";
import { Grid } from "world/sprite/aux/Grid";
import { Box } from "world/collision/Box";
import { shadowProcessor } from "canvas-processor";
import { PositionUtils } from "world/grid/utils/position-utils";
import { CellBoundary } from "world/sprite/aux/CellBoundary";
import { SpriteCellCreator } from "world/sprite/aux/SpriteCellCreator";
import { FixedSpriteFactory } from "world/sprite/aux/FixedSpriteFactory";
import { informFullUpdate } from "world/sprite/utils/sprite-utils";
import { SurroundingTracker, CellTrackers } from "cell-tracker";
import { Vector } from "dok-types";

enum Assets {
  DOBUKI = 0,
  LOGO = 1,
  GROUND = 2,
  VIDEO = 3,
  WIREFRAME = 4,
  WIREFRAME_RED = 5,
  GRASS = 6,
  BRICK = 7,
  DODO = 8,
  DODO_SHADOW = 9,
  TREE = 10,
  BUN = 11,
  BUN_SHADOW = 12,
  WOLF = 13,
  WOLF_SHADOW = 14,
  WATER = 15,
  BUSHES = 16,
  GRASS_GROUND = 17,
}

enum Anims {
  STILL = 0,
  RUN = 1,
  WOLF_STILL = 2,
  WOLF_JUMP = 3,
}

const LOGO_SIZE = 512;
const CELLSIZE = 2;

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  ui: UserInterface;
  keyboard: Keyboard;
  controls: IControls;
}

export class DemoWorld extends AuxiliaryHolder implements IWorld {
  camera: ICamera;
  api: IFade = {};
  constructor({ engine, motor, ui, keyboard, controls }: Props) {
    super();

    const cellUtils = new CellUtils({ motor });
    const positionUtils = new PositionUtils({ motor });

    //  Add medias
    //  * Each media is a texture that can be shown on a sprite.
    //  * You can show videos, images, or you can have instructions to draw on a canvas.
    const mediaAccumulator = new Accumulator<Media>();
    this.addAuxiliary(new MediaUpdater({ engine, motor, medias: mediaAccumulator }));
    mediaAccumulator.addAuxiliary(
      new ItemsGroup<Media>([
        {
          id: Assets.DOBUKI,
          type: "image",
          src: "dobuki.png",
        },
        {
          id: Assets.BUN,
          type: "image", src: "bun.png",
        },
        {
          id: Assets.BUN_SHADOW,
          type: "image", src: "bun.png",
          postProcess: shadowProcessor,
        },
        {
          id: Assets.DODO,
          type: "image", src: "dodo.png",
          spriteSheet: {
            spriteSize: [190, 209],
          },
        },
        {
          id: Assets.DODO_SHADOW,
          type: "image", src: "dodo.png",
          spriteSheet: {
            spriteSize: [190, 209],
          },
          postProcess: shadowProcessor,
        },
        {
          id: Assets.WOLF,
          type: "image", src: "wolf.png",
          spriteSheet: {
            spriteSize: [200, 256],
          },
        },
        {
          id: Assets.WOLF_SHADOW,
          type: "image", src: "wolf.png",
          spriteSheet: {
            spriteSize: [200, 256],
          },
          postProcess: shadowProcessor,
        },
        {
          id: Assets.LOGO,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = LOGO_SIZE;
            canvas.height = LOGO_SIZE;
            const centerX = canvas.width / 2, centerY = canvas.height / 2;
            const halfSize = canvas.width / 2;
            ctx.imageSmoothingEnabled = true;
            // ctx.fillStyle = '#ddd';
            ctx.lineWidth = canvas.width / 50;
            // ctx.fillRect(0, 0, canvas.width, canvas.height);

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
          id: Assets.GROUND,
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
          id: Assets.GRASS_GROUND,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = LOGO_SIZE;
            canvas.height = LOGO_SIZE;
            ctx.fillStyle = 'green';
            ctx.lineWidth = canvas.width / 50;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#6f6';
            ctx.fillStyle = 'lightgreen';

            ctx.beginPath();
            ctx.rect(canvas.width * .2, canvas.height * .2, canvas.width * .6, canvas.height * .6);
            ctx.fill();
            ctx.stroke();
          },
        },
        {
          id: Assets.BRICK,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = LOGO_SIZE;
            canvas.height = LOGO_SIZE;
            ctx.fillStyle = '#ddd';
            ctx.lineWidth = canvas.width / 50;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          },
        },
        {
          id: Assets.VIDEO,
          type: "video",
          src: 'sample.mp4',
          volume: 0,
          fps: 30,
          playSpeed: .1,
          maxRefreshRate: 30,
        },
        {
          id: Assets.WIREFRAME,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = LOGO_SIZE;
            canvas.height = LOGO_SIZE;
            ctx.lineWidth = 40;
            ctx.setLineDash([20, 5]);

            ctx.strokeStyle = 'lightblue';

            ctx.beginPath();
            ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
            ctx.stroke();
          },
        },
        {
          id: Assets.WIREFRAME_RED,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = LOGO_SIZE;
            canvas.height = LOGO_SIZE;
            ctx.lineWidth = 40;
            ctx.setLineDash([20, 5]);

            ctx.strokeStyle = 'red';

            ctx.beginPath();
            ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
            ctx.stroke();
          },
        },
        {
          id: Assets.GRASS,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = 1024;
            canvas.height = 1024;
            ctx.fillStyle = 'green';
            ctx.lineWidth = canvas.width / 50;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          },
        },
        {
          id: Assets.BUSHES,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = 1024;
            canvas.height = 1024;
            ctx.fillStyle = '#050';
            ctx.lineWidth = canvas.width / 50;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          },
        },
        {
          id: Assets.WATER,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = 1024;
            canvas.height = 1024;
            ctx.fillStyle = '#68f';
            ctx.lineWidth = canvas.width / 50;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          },
        },
        {
          id: Assets.TREE,
          type: "draw",
          draw: ctx => {
            const { canvas } = ctx;
            canvas.width = 200;
            canvas.height = 200;
            ctx.fillStyle = '#0f0';

            ctx.beginPath();
            ctx.moveTo(100, 0);
            ctx.lineTo(200, 150);
            ctx.lineTo(0, 150);
            ctx.fill();
            ctx.fillStyle = '#430';
            ctx.fillRect(75, 125, 50, 50);
          },
        },
      ]),
    );
    this.addAuxiliary(mediaAccumulator);

    const animationAccumulator = new Accumulator<Animation>();
    this.addAuxiliary(new AnimationUpdater({ engine, motor, animations: animationAccumulator }));
    animationAccumulator.addAuxiliary(
      new ItemsGroup<Animation>([
        {
          id: Anims.STILL,
          frames: [0],
        },
        {
          id: Anims.RUN,
          frames: [1, 5],
          fps: 24,
        },
        {
          id: Anims.WOLF_STILL,
          frames: [0, 4],
          fps: 15,
        },
      ]),
    );
    this.addAuxiliary(animationAccumulator);

    const cellTrackers = new CellTrackers();


    //  Add a sprite accumulator.
    //  * Sprite accumulators are used to collect sprite definitions, so that the engine can display them.
    const spritesAccumulator = new Accumulator<Sprite>();
    this.addAuxiliary(new MaxCountAuxiliary({ engine, elems: spritesAccumulator }));
    this.addAuxiliary(new SpriteUpdater({ engine, motor, sprites: spritesAccumulator }));
    this.addAuxiliary(spritesAccumulator);

    const exitBlock = {
      top: 2,
      bottom: -1,
      left: -.1,
      right: .1,
      near: 0,
      far: -.5,
    };
    const exitPosition = cellUtils.positionFromCellPos(0, 0, 0, CELLSIZE);

    const dobukiBlock = {
      top: 1,
      bottom: -1,
      left: -.1,
      right: .1,
      near: 0,
      far: -.5,
    };
    const dobukiPosition = cellUtils.positionFromCellPos(-3, 0, -1, CELLSIZE);

    const blockBox: Box = {
      top: 2,
      bottom: -1,
      left: -1,
      right: 1,
      near: 1,
      far: -1,
    };

    const blockPositions: Vector[] = [
      [-1, 0, -1],
      [1, 0, -1],
      [0, 0, -1],
      [-1, 0, 0],
      [1, 0, 0],
    ].map(([x, y, z]) => cellUtils.positionFromCellPos(x, y, z, CELLSIZE));

    blockPositions.forEach(blockPosition => {
      const blockBoxSprites = new DisplayBox({ box: blockBox, imageId: Assets.GROUND, insideImageId: Assets.BRICK });
      const factory = new FixedSpriteFactory({ cellUtils, positionUtils }, { cellSize: CELLSIZE },
        new SpriteGroup(blockBoxSprites, [Matrix.create().setVector(blockPosition)]));
      this.addAuxiliary(factory);

      const creator = new SpriteCellCreator({
        factory,
      });
      spritesAccumulator.addAuxiliary(creator);
      cellTrackers.add(new Grid({
        cellCreator: creator,
      }));
    });

    {
      const factory = new FixedSpriteFactory({ cellUtils, positionUtils }, { cellSize: CELLSIZE },
        //  Dobuki logo
        new SpriteGroup([
          {
            imageId: Assets.DOBUKI,
            spriteType: SpriteType.SPRITE,
            transform: Matrix.create().translate(0, -.3, -1),
          },
        ], [Matrix.create().setVector(dobukiPosition)]),
        new SpriteGroup(
          new DisplayBox({ box: dobukiBlock, imageId: Assets.WIREFRAME, insideImageId: Assets.WIREFRAME }),
          [Matrix.create().setVector(dobukiPosition)]
        ),
        new SpriteGroup(
          new DisplayBox({ box: exitBlock, imageId: Assets.WIREFRAME, insideImageId: Assets.WIREFRAME }),
          [Matrix.create().setVector(exitPosition)]
        ),

        //  Side walls with happy face logo
        [
          //  side walls
          ...[
            Matrix.create().translate(-3.01, 0, 0).rotateY(Math.PI / 2),
            Matrix.create().translate(-3.01, 0, 0).rotateY(-Math.PI / 2),
            Matrix.create().translate(3.01, 0, 0).rotateY(-Math.PI / 2),
            Matrix.create().translate(3.01, 0, 0).rotateY(Math.PI / 2),
          ].map(transform => ({ imageId: Assets.LOGO, transform })),
          //  floor
          ...[
            Matrix.create().translate(0, -.9, 0).rotateX(-Math.PI / 2),
            Matrix.create().translate(0, -.9, 2).rotateX(-Math.PI / 2),
            Matrix.create().translate(-2, -.9, 2).rotateX(-Math.PI / 2),
            Matrix.create().translate(2, -.9, 2).rotateX(-Math.PI / 2),
          ].map(transform => ({ imageId: Assets.GRASS_GROUND, transform })),
        ]);

      const creator = new SpriteCellCreator({
        factory
      });
      spritesAccumulator.addAuxiliary(creator);
      cellTrackers.add(new Grid({
        cellCreator: creator,
      }));
      this.addAuxiliary(factory);
    }

    const camera: ICamera = this.camera = new Camera({ engine, motor, positionUtils });
    this.addAuxiliary(camera);

    const spriteCellCreator = new SpriteCellCreator({
      factory: new SpriteFactory({
        fillSpriteBag({ pos: cellPos }, bag, rng) {
          const distSq = cellPos[0] * cellPos[0] + cellPos[2] * cellPos[2];
          const isWater = distSq > 1000;
          const hasTree = (distSq > 10) && rng() < .1 && !isWater;
          const ground = bag.createSprite(hasTree ? Assets.BUSHES : isWater ? Assets.WATER : Assets.GRASS);
          ground.spriteType = isWater ? SpriteType.WAVE : SpriteType.DEFAULT;
          ground.transform.translate(cellPos[0] * cellPos[3], -1 - (isWater ? 1 : 0), cellPos[2] * cellPos[3]).rotateX(-Math.PI / 2);
          bag.addSprite(ground);

          const count = hasTree ? 5 + rng() * 10 : 0;
          for (let i = 0; i < count; i++) {
            const tree = bag.createSprite(Assets.TREE);
            tree.spriteType = SpriteType.SPRITE;
            const size = 1 + Math.floor(2 * rng());
            tree.transform.translate(cellPos[0] * cellPos[3] + (rng() - .5) * 2.5, -1 + size / 2, cellPos[2] * cellPos[3] + (rng() - .5) * 2.5).scale(.2 + rng(), size, .2 + rng());
            bag.addSprite(tree);
          }

          //  Add bun
          if (!isWater && !count && rng() < .02) {
            const bx = cellPos[0] * cellPos[3], bz = cellPos[2] * cellPos[3];
            const bun = bag.createSprite(Assets.BUN);
            bun.spriteType = SpriteType.SPRITE;
            bun.transform.translate(bx, -.7, bz).scale(.5);

            const bunShadow = bag.createSprite(Assets.BUN_SHADOW);
            bunShadow.transform.translate(bx, -1, bz).rotateX(-Math.PI / 2).scale(.5);

            bag.addSprite(bun, bunShadow);
          }

          //  Add wolf
          if (!isWater && !count && rng() < .01) {
            const scale = 1.5;
            const wolf = bag.createSprite(Assets.WOLF);
            wolf.spriteType = SpriteType.SPRITE;
            wolf.transform.translate(cellPos[0] * cellPos[3], 0, cellPos[2] * cellPos[3]).scale(scale);

            const shadow = bag.createSprite(Assets.WOLF_SHADOW);
            shadow.transform.translate(cellPos[0] * cellPos[3], -.99, cellPos[2] * cellPos[3] - .5).rotateX(-Math.PI / 2).scale(scale);

            bag.addSprite(wolf, shadow);
          }
        },
      }),
    });

    //  Dynamic SpriteGrid
    //  * This SpriteGrid is dynamic, meaning that the cell gets generated on the
    //  * fly. This allows us to produce an infinite amounts of cells.
    spritesAccumulator.addAuxiliary(spriteCellCreator);

    cellTrackers.add(new Grid({
      boundary: new CellBoundary({ yRange: [0, 0] }),
      cellCreator: spriteCellCreator,
    }));

    const heroBox = {
      top: 1,
      bottom: -1,
      left: -.9,
      right: .9,
      near: .9,
      far: -.9,
    };
    const heroCollider = new CollisionDetectors([
      new CollisionDetectors(blockPositions.map(blockPosition =>
        new CollisionDetector({
          blockerBox: blockBox, blockerPosition: blockPosition, heroBox,
          listener: {
            onBlockChange(blocked) {
              displayBox.setImageId(blocked ? Assets.WIREFRAME_RED : Assets.WIREFRAME);
            },
          }
        }, { shouldBlock: true }))
      ),
      new CollisionDetector({
        blockerBox: dobukiBlock, blockerPosition: dobukiPosition, heroBox,
        listener: {
          onEnter() {
            displayBox.setImageId(Assets.WIREFRAME_RED);
            ui.showDialog({
              conversation: {
                messages: [
                  { text: "Hello there." },
                  { text: "Bye bye." },
                ]
              },
            });
          },
          onLeave() {
            displayBox.setImageId(Assets.WIREFRAME);
          }
        }
      }, { shouldBlock: false }),
      new CollisionDetector(
        {
          blockerBox: exitBlock, blockerPosition: exitPosition, heroBox,
          listener: {
            onEnter() {
              displayBox.setImageId(Assets.WIREFRAME_RED);
              ui.showDialog({
                conversation: {
                  messages: [
                    { text: "Going down..." },
                  ]
                },
              }, () => {
                camera.fade.progressTowards(1, .005, this, motor);
              });
            },
            onLeave() {
              displayBox.setImageId(Assets.WIREFRAME);
            }
          }
        }, { shouldBlock: false }),
    ]);


    const heroPos: IPositionMatrix = new PositionMatrix({ positionUtils, blocker: heroCollider })
      .movedTo(0, 0, 3)
      .onChange(() => {
        informFullUpdate(heroSprites, SpriteUpdateType.TRANSFORM);
        informFullUpdate(displayBox, SpriteUpdateType.TRANSFORM);
      });
    const heroSprites = new SpriteGroup([{
      imageId: Assets.DODO,
      spriteType: SpriteType.SPRITE,
      transform: Matrix.create().translate(0, -.3, 0),
      animationId: Anims.STILL,
    },], [heroPos]);
    spritesAccumulator.addAuxiliary(heroSprites);

    const displayBox = new SpriteGroup(new DisplayBox({ box: heroBox, imageId: Assets.WIREFRAME }), [heroPos]);

    spritesAccumulator.addAuxiliary(displayBox);

    const shadowPos: IPositionMatrix = new PositionMatrix({ positionUtils })
      .onChange(() => {
        informFullUpdate(shadowHeroSprites, SpriteUpdateType.TRANSFORM);
      });;
    const shadowHeroSprites = new SpriteGroup([
      {
        imageId: Assets.DODO_SHADOW,
        transform: Matrix.create().translate(0, -.89, .5).rotateX(-Math.PI / 2).scale(1, .3, 1),
        animationId: Anims.STILL,
      },
    ], [shadowPos]);
    this.addAuxiliary(new FollowAuxiliary({
      motor,
      follower: shadowPos,
      followee: heroPos,
    }, {
      followY: false,
    }));
    spritesAccumulator.addAuxiliary(shadowHeroSprites);

    //  Static Sprites
    //  * Those are just sprites, which will appear regardless of where
    //  * you are in the scene.
    spritesAccumulator.addAuxiliary(new SpriteGroup([
      {
        imageId: Assets.VIDEO,
        spriteType: SpriteType.DISTANT,
        transform: Matrix.create()
          .translate(3000, 1000, -5000)
          .scale(480, 270, 1),
      },
    ]));

    //  Toggle auxiliary
    //  * Pressing the "Tab" button switches between two modes of movement below
    //  * The PositionStepAuxiliary is "dungeon" crawling mode, where you move cell by cell.
    //  * CamTiltReset is just for restoring the view from looking up or down
    //  * CamMoveAuxiliary is a more free-form way to move.
    //  * JumpAuxiliary lets you jump
    this.addAuxiliary(keyboard);
    this.addAuxiliary(
      new ToggleAuxiliary({ keyboard }, {
        auxiliariesMapping: [
          {
            key: "Tab", aux: Auxiliaries.from(
              new PositionStepAuxiliary({ motor, controls, position: heroPos, turnGoal: camera.turn.angle }),
              new SmoothFollowAuxiliary({ motor, follower: camera.position, followee: heroPos }, { speed: .05 }),
              new JumpAuxiliary({ motor, controls, position: heroPos }),
            ),
          },
          {
            key: "Tab", aux: Auxiliaries.from(
              new TurnAuxiliary({ motor, controls, turn: camera.turn }),
              new TiltAuxiliary({ motor, controls, tilt: camera.tilt }),
              new MoveAuxiliary({ motor, controls, direction: camera.turn, position: heroPos }),
              new JumpAuxiliary({ motor, controls, position: heroPos }),
              new TiltResetAuxiliary({ motor, controls, tilt: camera.tilt }),
              new SmoothFollowAuxiliary({ motor, follower: camera.position, followee: heroPos }, { speed: .05 }),
            ),
          },
        ],
      }))
      .addAuxiliary(new DirAuxiliary({ controls }, dx => {
        heroSprites.setOrientation(dx);
        shadowHeroSprites.setOrientation(dx);
      }))
      .addAuxiliary(new MotionAuxiliary({ controls }, moving => {
        const animId = moving ? Anims.RUN : Anims.STILL;
        heroSprites.setAnimationId(animId);
        shadowHeroSprites.setAnimationId(animId);
      }));

    //  CellChangeAuxiliary
    //  * This is needed to indicate when the player is changing cell
    //  * as they move. Every cell change, a new set of surrounding cells
    //  * is evaluated, and some are created as needed.
    const surroundingTracker = new SurroundingTracker({ cellTrack: cellTrackers }, {
      cellLimit: 200,
      range: [7, 3, 7],
      cellSize: CELLSIZE,
    });
    this.addAuxiliary(
      new CellChangeDectector({
        cellUtils,
        visitableCell: surroundingTracker,
        positionMatrix: heroPos,
      }, { cellSize: CELLSIZE })
    );

    //  Hack some base settings
    camera.distance.setValue(5)
    camera.tilt.angle.setValue(.8);
    camera.projection.zoom.setValue(.25);
    camera.projection.perspective.setValue(.05);
    camera.setBackgroundColor(0x000000);
    this.addAuxiliary(new TimeAuxiliary({ motor, engine }))
      .addAuxiliary(new FadeAuxiliary({ camera, motor, world: this }));
  }
}
