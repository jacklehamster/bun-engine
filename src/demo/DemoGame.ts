import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor, ControlledMotor, Policy } from "motor-loop";
import { Camera } from "camera/Camera";
import { Auxiliaries } from "world/aux/Auxiliaries";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { TurnAuxiliary } from "world/aux/TurnAuxiliary";
import { PositionStepAuxiliary } from "world/aux/PositionStepAuxiliary";
import { TiltResetAuxiliary } from "world/aux/TiltResetAuxiliary";
import { ToggleAuxiliary } from "world/aux/ToggleAuxiliary";
import { SpriteGroup } from "world/sprite/aux/SpritesGroup";
import { SpriteUpdater } from "world/sprite/update/SpriteUpdater";
import { Sprite } from "world/sprite/Sprite";
import { SpriteType } from "world/sprite/SpriteType";
import { ICamera } from "camera/ICamera";
import { MoveAuxiliary } from "world/aux/MoveAuxiliary";
import { JumpAuxiliary } from "world/aux/JumpAuxiliary";
import { TimeAuxiliary } from "core/aux/TimeAuxiliary";
import { TiltAuxiliary } from "world/aux/TiltAuxiliary";
import { SmoothFollowAuxiliary } from "world/aux/SmoothFollowAuxiliary";
import { DirAuxiliary } from "world/aux/DirAuxiliary";
import { MediaUpdater } from "world/sprite/update/MediaUpdater";
import { Media } from "gl-texture-manager";
import { AnimationUpdater } from "world/sprite/update/AnimationUpdater";
import { Animation } from "animation/Animation";
import { MotionAuxiliary } from "world/aux/MotionAuxiliary";
import { FollowAuxiliary } from "world/aux/FollowAuxiliary";
import { ItemsGroup } from "world/sprite/aux/ItemsGroup";
import { ICollisionDetector, IPositionMatrix, Matrix, PositionMatrix } from "dok-matrix";
import { DisplayBox } from "world/collision/DisplayBox";
import { CollisionDetector } from "world/collision/CollisionDetector";
import { UserInterface } from "ui/UserInterface";
import { IControls } from "controls/IControls";
import { IFade, FadeApiAuxiliary } from "world/aux/FadeApiAuxiliary";
import { Box } from "world/collision/Box";
import { shadowProcessor } from "canvas-processor";
import { SpriteCellCreator } from "world/sprite/aux/SpriteCellCreator";
import { FixedSpriteFactory } from "world/sprite/aux/FixedSpriteFactory";
import { SurroundingTracker, CellTrackers, Cell, CellBoundary, filter, Tag, CellChangeDetector, createCell } from "cell-tracker";
import { Vector } from "dok-types";
import { alea } from "seedrandom";
import { SpritePool } from "world/sprite/pools/SpritePool";
import { ObjectPool } from "bun-pool";
import { Accumulator } from "list-accumulator";
import { StepBackAuxiliary } from "world/aux/StepBackAuxiliary";
import { goBackAction } from "world/aux/GoBack";
import { BodyModel } from "world/sprite/body/BodyModel";
import { PositionStep } from "world/aux/PositionStep";
import { IKeyboard } from "controls/IKeyboard";
import { MenuItemBehavior } from "ui/model/conversation/MenuItem";

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
  keyboard: IKeyboard;
  controls: IControls;
}

export class DemoGame extends AuxiliaryHolder {
  api: IFade = {};
  camera: ICamera;
  constructor({ engine, motor, ui, keyboard, controls }: Props) {
    super();

    //  Add medias
    //  * Each media is a texture that can be shown on a sprite.
    //  * You can show videos, images, or you can have instructions to draw on a canvas.
    const mediaAccumulator = new Accumulator<Media>();
    this.addAuxiliary(new MediaUpdater({ engine, motor, medias: mediaAccumulator }));
    const mediaItems = new ItemsGroup<Media>([{
      id: Assets.DOBUKI,
      type: "image",
      src: "dobuki.png",
    }, {
      id: Assets.BUN,
      type: "image", src: "bun.png",
    }, {
      id: Assets.BUN_SHADOW,
      type: "image", src: "bun.png",
      postProcess: shadowProcessor,
    }, {
      id: Assets.DODO,
      type: "image", src: "dodo.png",
      spriteSheet: {
        spriteSize: [190, 209],
      },
    }, {
      id: Assets.DODO_SHADOW,
      type: "image", src: "dodo.png",
      spriteSheet: {
        spriteSize: [190, 209],
      },
      postProcess: shadowProcessor,
    }, {
      id: Assets.WOLF,
      type: "image", src: "wolf.png",
      spriteSheet: {
        spriteSize: [200, 256],
      },
    }, {
      id: Assets.WOLF_SHADOW,
      type: "image", src: "wolf.png",
      spriteSheet: {
        spriteSize: [200, 256],
      },
      postProcess: shadowProcessor,
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
      id: Assets.VIDEO,
      type: "video",
      src: 'sample.mp4',
      volume: 0,
      fps: 30,
      playSpeed: .5,
      maxRefreshRate: 30,
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }]);
    mediaAccumulator.add(mediaItems);
    this.addAuxiliary({
      activate() {
        mediaAccumulator.updateFully();
      },
    });

    const animationAccumulator = new Accumulator<Animation>();
    this.addAuxiliary(new AnimationUpdater({ engine, motor, animations: animationAccumulator }));
    const animationItems = new ItemsGroup<Animation>([{
      id: Anims.STILL,
      frames: [0],
    }, {
      id: Anims.RUN,
      frames: [1, 5],
      fps: 24,
    }, {
      id: Anims.WOLF_STILL,
      frames: [0, 4],
      fps: 15,
    }]);
    animationAccumulator.add(animationItems);
    this.addAuxiliary({
      activate() {
        animationAccumulator.updateFully();
      },
    });

    const cellTrackers = new CellTrackers();
    const spritesAccumulator = new Accumulator<Sprite>({
      onChange: (value) => engine.setMaxSpriteCount(value),
    });
    this.addAuxiliary({
      deactivate() {
        engine.setMaxSpriteCount(0);
      }
    });

    this.addAuxiliary(new SpriteUpdater({ engine, motor, sprites: spritesAccumulator }));

    const exitBlock = {
      top: 2,
      bottom: -1,
      left: -.1,
      right: .1,
      near: 0,
      far: -.5,
    };
    const exitCell = createCell(0, 0, 0, CELLSIZE);
    const exitPosition = exitCell.worldPosition;

    const worldColliders = new Accumulator<ICollisionDetector>();

    const heroBox = {
      top: 1,
      bottom: -1,
      left: -.9,
      right: .9,
      near: .9,
      far: -.9,
    };

    const blockBox: Box = {
      top: 2,
      bottom: -1,
      left: -1,
      right: 1,
      near: 1,
      far: -1,
    };

    {
      const dobukiCell = createCell(-3, 0, -1, CELLSIZE);
      const dobukiBox = {
        top: 1,
        bottom: -1,
        left: -.1,
        right: .1,
        near: 0,
        far: -.5,
      };
      const dobukiPosition = dobukiCell.worldPosition;
      const dobukiBlockPosition: Vector = [
        dobukiPosition[0],
        dobukiPosition[1],
        dobukiPosition[2] - CELLSIZE];

      const bodyModel = new BodyModel({
        colliders: [
          new CollisionDetector({
            blockerBox: blockBox, blockerPosition: dobukiBlockPosition, heroBox,
            listener: {
              onBlockChange(blocked) {
                displayBox.setImageId(blocked ? Assets.WIREFRAME_RED : Assets.WIREFRAME);
              },
            }
          }, { shouldBlock: true }),
          new CollisionDetector({
            blockerBox: dobukiBox, blockerPosition: dobukiPosition, heroBox,
            listener: {
              onEnter() {
                displayBox.setImageId(Assets.WIREFRAME_RED);
                ui.openDialog({
                  conversation: {
                    messages: [
                      { text: "Hello there." },
                      {
                        text: "How are you?",
                        action: () => ui.openMenu({
                          position: [400, 340],
                          size: [undefined, 150],
                          positionFromRight: true,
                          items: [
                            {
                              label: "I don't know",
                              behavior: MenuItemBehavior.NONE,
                              action: [
                                ui => ui.openDialog({
                                  position: [100, 100],
                                  size: [300, 200],
                                  conversation: {
                                    messages: [
                                      { text: "You should know!" },
                                    ],
                                  },
                                }),
                              ],
                            },
                            {
                              label: "good",
                              action: [
                                ui => ui.openDialog({
                                  conversation: {
                                    messages: [
                                      { text: "That's nice to know!" },
                                    ],
                                  },
                                }),
                              ],
                            },
                            {
                              label: "bad",
                            },
                          ],
                        }),
                      },
                      { text: "Bye bye." },
                      {
                        action: [
                          goBackAction(heroPos),
                        ],
                      },
                    ]
                  },
                });
              },
              onLeave() {
                displayBox.setImageId(Assets.WIREFRAME);
              }
            }
          }, { shouldBlock: false }),
        ],
      });
      const dobukiPosMatrix = new PositionMatrix().movedTo(dobukiPosition[0], dobukiPosition[1], dobukiPosition[2]);
      bodyModel.addSprites(new SpriteGroup(
        [{
          imageId: Assets.DOBUKI,
          spriteType: SpriteType.SPRITE,
          transform: Matrix.create().translate(0, -.3, -1),
        }],
        dobukiPosMatrix));
      bodyModel.addSprites(new SpriteGroup(
        new DisplayBox({ box: dobukiBox, imageId: Assets.WIREFRAME, insideImageId: Assets.WIREFRAME }),
        dobukiPosMatrix,
      ));
      bodyModel.addSprites(new SpriteGroup(
        new DisplayBox({ box: blockBox, imageId: Assets.WIREFRAME, insideImageId: Assets.WIREFRAME }),
        new PositionMatrix().movedTo(dobukiBlockPosition[0], dobukiBlockPosition[1], dobukiBlockPosition[2]),
      ));

      worldColliders.add(bodyModel.colliders);

      const factory = new FixedSpriteFactory({ cellSize: CELLSIZE }, bodyModel.sprites);
      const creator = new SpriteCellCreator({ factory });
      spritesAccumulator.add(creator);
      cellTrackers.add(creator);
      this.addAuxiliary(factory);
    }

    const blockPositions: Vector[] = [
      [-1, 0, -1],
      [1, 0, -1],
      [0, 0, -1],
      [-1, 0, 0],
      [1, 0, 0],
    ].map(([x, y, z]) => [x * CELLSIZE, y * CELLSIZE, z * CELLSIZE]);

    blockPositions.forEach(blockPosition => {
      const blockBoxSprites = new SpriteGroup(
        new DisplayBox({ box: blockBox, imageId: Assets.GROUND, insideImageId: Assets.BRICK }),
        new PositionMatrix().movedTo(blockPosition[0], blockPosition[1], blockPosition[2]),
      );
      const factory = new FixedSpriteFactory(
        { cellSize: CELLSIZE },
        blockBoxSprites);
      this.addAuxiliary(factory);

      const creator = new SpriteCellCreator({ factory });
      spritesAccumulator.add(creator);
      cellTrackers.add(creator);
    });

    {
      const factory = new FixedSpriteFactory({ cellSize: CELLSIZE },
        new SpriteGroup(
          new DisplayBox({ box: exitBlock, imageId: Assets.WIREFRAME, insideImageId: Assets.WIREFRAME }),
          new PositionMatrix().movedTo(exitPosition[0], exitPosition[1], exitPosition[2]),
        ),

        //  Side walls with happy face logo
        [
          Matrix.create().translate(-3.01, 0, 0).rotateY(Math.PI / 2),
          Matrix.create().translate(-3.01, 0, 0).rotateY(-Math.PI / 2),
          Matrix.create().translate(3.01, 0, 0).rotateY(-Math.PI / 2),
          Matrix.create().translate(3.01, 0, 0).rotateY(Math.PI / 2),
        ].map(transform => ({ imageId: Assets.LOGO, transform })),
        //  floor
        [
          Matrix.create().translate(0, -.9, 0).rotateX(-Math.PI / 2),
          Matrix.create().translate(0, -.9, 2).rotateX(-Math.PI / 2),
          Matrix.create().translate(-2, -.9, 2).rotateX(-Math.PI / 2),
          Matrix.create().translate(2, -.9, 2).rotateX(-Math.PI / 2),
        ].map(transform => ({ imageId: Assets.GRASS_GROUND, transform })),
      );

      const creator = new SpriteCellCreator({ factory });
      spritesAccumulator.add(creator);
      cellTrackers.add(creator);
      this.addAuxiliary(factory);
    }

    const camPosition: IPositionMatrix = new PositionMatrix();
    const camera: ICamera = this.camera = new Camera({ engine, motor, position: camPosition });
    this.addAuxiliary(camera);

    {
      const arrayPool: ObjectPool<Sprite[]> = new ObjectPool((a) => a ?? [], a => a.length = 0);
      const arrayPool2: ObjectPool<ICollisionDetector[]> = new ObjectPool((a) => a ?? [], a => a.length = 0);
      const spritePool: SpritePool = new SpritePool();
      const spritesMap = new Map<Tag, Sprite[]>();
      const collidersMap = new Map<Tag, ICollisionDetector[]>();
      cellTrackers.add(filter({
        trackCell: (cell: Cell): boolean => {
          const rng = alea(cell.tag);
          const sprites: Sprite[] = arrayPool.create();
          const cellPos = cell.pos;

          const px = cell.worldPosition[0];
          const pz = cell.worldPosition[2];
          const distSq = cellPos[0] * cellPos[0] + cellPos[2] * cellPos[2];
          const isWater = distSq > 1000;
          const hasTree = (distSq > 10) && rng() < .1 && !isWater;
          const ground = spritePool.create(hasTree ? Assets.BUSHES : isWater ? Assets.WATER : Assets.GRASS);
          ground.spriteType = isWater ? SpriteType.WAVE : SpriteType.DEFAULT;
          ground.transform.translate(px, -1 - (isWater ? 1 : 0), pz).rotateX(-Math.PI / 2);
          sprites.push(ground);

          const count = hasTree ? 5 + rng() * 10 : 0;
          for (let i = 0; i < count; i++) {
            const tree = spritePool.create(Assets.TREE);
            tree.spriteType = SpriteType.SPRITE;
            const size = 1 + Math.floor(2 * rng());
            tree.transform.translate(px + (rng() - .5) * 2.5, -1 + size / 2, pz + (rng() - .5) * 2.5).scale(.2 + rng(), size, .2 + rng());
            sprites.push(tree);
          }

          //  Add bun
          if (!isWater && !count && rng() < .02) {
            const bun = spritePool.create(Assets.BUN);
            bun.spriteType = SpriteType.SPRITE;
            bun.transform.translate(px, -.7, pz).scale(.5);

            const bunShadow = spritePool.create(Assets.BUN_SHADOW);
            bunShadow.transform.translate(px, -1, pz).rotateX(-Math.PI / 2).scale(.5);

            sprites.push(bun, bunShadow);
          }

          //  Add wolf
          if (!isWater && !count && rng() < .01) {
            const scale = 1.5;
            const wolf = spritePool.create(Assets.WOLF);
            wolf.spriteType = SpriteType.SPRITE;
            wolf.transform.translate(px, 0, pz).scale(scale);

            const shadow = spritePool.create(Assets.WOLF_SHADOW);
            shadow.transform.translate(px, -.99, pz - .5).rotateX(-Math.PI / 2).scale(scale);

            sprites.push(wolf, shadow);
          }

          spritesMap.set(cell.tag, sprites);
          spritesAccumulator.add(sprites);

          if (hasTree || isWater) {
            const colliders: ICollisionDetector[] = arrayPool2.create();
            colliders.push(
              new CollisionDetector({
                blockerBox: blockBox, blockerPosition: [px, 0, pz], heroBox,
              }, { shouldBlock: true }),
            );
            collidersMap.set(cell.tag, colliders);
            worldColliders.add(colliders);
          }
          return sprites.length > 0;
        },
        untrackCells: function (cellTags: Set<string>): void {
          cellTags.forEach(tag => {
            const sprites = spritesMap.get(tag);
            if (sprites) {
              spritesAccumulator.remove(sprites);
              sprites.forEach(sprite => spritePool.recycle(sprite));
              spritesMap.delete(tag);
              arrayPool.recycle(sprites);
            }
            const colliders = collidersMap.get(tag);
            if (colliders) {
              worldColliders.remove(colliders);
              collidersMap.delete(tag);
              arrayPool2.recycle(colliders);
            }
          });
        }
      }, new CellBoundary({ yRange: [0, 0] })));
    }

    worldColliders.add([
      ...blockPositions.map(blockPosition =>
        new CollisionDetector({
          blockerBox: blockBox, blockerPosition: blockPosition, heroBox,
          listener: {
            onBlockChange(blocked) {
              displayBox.setImageId(blocked ? Assets.WIREFRAME_RED : Assets.WIREFRAME);
            },
          }
        }, { shouldBlock: true })
      ),
      new CollisionDetector(
        {
          blockerBox: exitBlock, blockerPosition: exitPosition, heroBox,
          listener: {
            onEnter() {
              displayBox.setImageId(Assets.WIREFRAME_RED);
              ui.openDialog({
                conversation: {
                  messages: [
                    { text: "Going down..." },
                    {
                      text: "",
                      action: () => new Promise(resolve => {
                        camera.fade.progressTowards(1, .005, {
                          onRelease: resolve,
                        }, motor)
                      }),
                    },
                    {
                      action: () => {
                        console.log("Change scene");
                      },
                    },
                  ]
                },
              });
            },
            onLeave() {
              displayBox.setImageId(Assets.WIREFRAME);
            }
          }
        }, { shouldBlock: false }),
    ]);

    const heroPos: IPositionMatrix = new PositionMatrix({ blockers: worldColliders }).movedTo(0, 0, 3);
    const heroSprites = new SpriteGroup([{
      imageId: Assets.DODO,
      spriteType: SpriteType.SPRITE,
      transform: Matrix.create().translate(0, -.3, 0),
      animationId: Anims.STILL,
    },], heroPos);
    spritesAccumulator.add(heroSprites);
    this.addAuxiliary({
      activate() {
        spritesAccumulator.updateFully();
      },
    });

    const displayBox = new SpriteGroup(new DisplayBox({ box: heroBox, imageId: Assets.WIREFRAME }), heroPos);

    spritesAccumulator.add(displayBox);

    const shadowPos: IPositionMatrix = new PositionMatrix({});
    const shadowHeroSprites = new SpriteGroup([
      {
        imageId: Assets.DODO_SHADOW,
        transform: Matrix.create().translate(0, -.89, .5).rotateX(-Math.PI / 2).scale(1, .3, 1),
        animationId: Anims.STILL,
      },
    ], shadowPos);

    this.addAuxiliary(new FollowAuxiliary({
      motor,
      follower: shadowPos,
      followee: heroPos,
    }, {
      followY: false,
    }));
    spritesAccumulator.add(shadowHeroSprites);

    //  Static Sprites
    //  * Those are just sprites, which will appear regardless of where
    //  * you are in the scene.
    const videoSprites = new SpriteGroup([
      {
        imageId: Assets.VIDEO,
        spriteType: SpriteType.DISTANT,
        transform: Matrix.create()
          .translate(3000, 1000, -5000)
          .scale(480, 270, 1),
      },
    ]);
    spritesAccumulator.add(videoSprites);

    const controlledMotor = new ControlledMotor(motor, { policy: Policy.INCOMING_CYCLE_PRIORITY });
    const stepBack = new StepBackAuxiliary({ motor: controlledMotor, position: heroPos });
    const posStep = new PositionStepAuxiliary({ motor: controlledMotor, controls, positionStep: new PositionStep({ position: heroPos }), turnGoal: camera.turn.angle }, { speed: 1.5, airBoost: 1.5 });


    //  Toggle auxiliary
    //  * Pressing the "Tab" button switches between two modes of movement below
    //  * The PositionStepAuxiliary is "dungeon" crawling mode, where you move cell by cell.
    //  * CamTiltReset is just for restoring the view from looking up or down
    //  * CamMoveAuxiliary is a more free-form way to move.
    //  * JumpAuxiliary lets you jump
    this.addAuxiliary(keyboard)
      .addAuxiliary(
        new ToggleAuxiliary({ keyboard }, {
          auxiliariesMap: [
            {
              key: "Tab", aux: () => Auxiliaries.from(
                posStep,
                stepBack,
                new SmoothFollowAuxiliary({ motor, follower: camPosition, followee: heroPos }, { speed: .05, followY: false }),
                new JumpAuxiliary({ motor, controls, position: heroPos }, { gravity: -2, jump: 3 }),
              ),
            },
            {
              key: "Tab", aux: () => Auxiliaries.from(
                new TurnAuxiliary({ motor, controls, turn: camera.turn }),
                new TiltAuxiliary({ motor, controls, tilt: camera.tilt }),
                new MoveAuxiliary({ motor, controls, direction: camera.turn, position: heroPos }),
                new JumpAuxiliary({ motor, controls, position: heroPos }),
                new TiltResetAuxiliary({ motor, controls, tilt: camera.tilt }),
                new SmoothFollowAuxiliary({ motor, follower: camPosition, followee: heroPos }, { speed: .05 }),
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

    const surroundingTracker = new SurroundingTracker({ cellTrack: cellTrackers }, {
      cellLimit: 200,
      range: [7, 3, 7],
      cellSize: CELLSIZE,
    });

    this.addAuxiliary(
      new CellChangeDetector({ positionMatrix: heroPos }, { cellSize: CELLSIZE })
        .addListener(surroundingTracker)
        .addListener(stepBack)
    );

    //  Hardcode some base settings
    camera.distance.setValue(15)
    camera.tilt.angle.setValue(.8);
    camera.projection.zoom.setValue(.25);
    camera.projection.perspective.setValue(.05);
    camera.setBackgroundColor(0x000000);
    this.addAuxiliary(new TimeAuxiliary({ motor, engine }))
      .addAuxiliary(new FadeApiAuxiliary({ camera, motor, api: this.api }));
  }
}
