import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor, ControlledMotor, Policy } from "motor-loop";
import { Camera } from "camera/Camera";
import { Auxiliaries } from "world/aux/Auxiliaries";
import { TurnAuxiliary } from "world/aux/TurnAuxiliary";
import { PositionStepAuxiliary } from "world/aux/PositionStepAuxiliary";
import { TiltResetAuxiliary } from "world/aux/TiltResetAuxiliary";
import { ToggleAuxiliary } from "world/aux/ToggleAuxiliary";
import { SpriteGroup } from "world/sprite/aux/SpriteGroup";
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
import { DisplayBox, Face } from "world/collision/DisplayBox";
import { CollisionDetector } from "world/collision/CollisionDetector";
import { IBox } from "world/collision/IBox";
import { shadowProcessor } from "canvas-processor";
import { SurroundingTracker, CellTrackers, CellBoundary, filter, Tag, CellChangeDetector, createCell, CellTriggerTracker } from "cell-tracker";
import { alea } from "seedrandom";
import { SpritePool } from "world/sprite/pools/SpritePool";
import { ObjectPool } from "bun-pool";
import { Accumulator } from "list-accumulator";
import { StepBackAuxiliary } from "world/aux/StepBackAuxiliary";
import { goBackAction } from "world/aux/GoBack";
import { PositionStep } from "world/aux/PositionStep";
import { CellTrigger } from "world/aux/CellTrigger";
import { KeyboardControl, openMenu, PopupControl } from "dialog-system";
import { TurnStepAuxiliary } from "world/aux/TurnStepAuxiliary";
import { Keyboard } from "controls/Keyboard";
import { KeyboardControls } from "controls/KeyboardControls";

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
}

export class DemoGame extends Auxiliaries {
  camera: ICamera;
  constructor({ engine, motor }: Props) {
    super();

    const keyboard = new Keyboard({ motor });
    const gameControls = new KeyboardControls(keyboard);

    const popupControl = new PopupControl();
    popupControl.registerActive(enabled => gameControls.setEnabled(enabled));
    const keyboardControl = new KeyboardControl(popupControl);

    //  Add medias
    //  * Each media is a texture that can be shown on a sprite.
    //  * You can show videos, images, or you can have instructions to draw on a canvas.
    const mediaAccumulator = new Accumulator<Media>({
      elems: [
        new ItemsGroup<Media>([{
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
        }]),
      ],
    });
    this.addAuxiliary(new MediaUpdater({ engine, motor, medias: mediaAccumulator }));
    this.addAuxiliary({
      activate() {
        mediaAccumulator.updateFully();
      },
    });

    const animationAccumulator = new Accumulator<Animation>({
      elems: [
        new ItemsGroup<Animation>([{
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
        }]),
      ],
    });
    this.addAuxiliary(new AnimationUpdater({ engine, motor, animations: animationAccumulator }));
    this.addAuxiliary({
      activate() {
        animationAccumulator.updateFully();
      },
    });

    const cellTrackers = new CellTrackers();
    const spritesAccumulator = new Accumulator<Sprite>({
      onChange: value => engine.setMaxSpriteCount(value),
    });
    this.addAuxiliary({
      deactivate() {
        engine.setMaxSpriteCount(0);
        spritesAccumulator.clear();
      }
    });

    this.addAuxiliary(new SpriteUpdater({ engine, motor, sprites: spritesAccumulator }));

    const worldColliders = new Accumulator<ICollisionDetector>();

    const heroBox: IBox = {
      top: 1,
      bottom: -1,
      left: -.9,
      right: .9,
      near: .9,
      far: -.9,
    };

    const blockBox: IBox = {
      top: 2,
      bottom: -1,
      left: -1,
      right: 1,
      near: 1,
      far: -1,
    };

    const dobukiBox = {
      top: 1,
      bottom: -1,
      left: -.1,
      right: .1,
      near: 0,
      far: -.5,
    };
    const exitBlock: IBox = {
      top: 2,
      bottom: -1,
      left: -.1,
      right: .1,
      near: 0,
      far: -.5,
    };

    const cellTriggerTracker = new CellTriggerTracker();
    cellTrackers.add(cellTriggerTracker);
    cellTriggerTracker.addTrigger(new CellTrigger({
      cells: [createCell(0, 0, 0, CELLSIZE)],
      heroBox,
      triggerBox: exitBlock,
      worldColliders,
      spritesAccumulator,
      wireframeImageId: Assets.WIREFRAME,
      onEnter: () => {
        displayBox.setImageId(Assets.WIREFRAME_RED);
        openMenu({
          popupControl,
          dialog: {
            layout: {
              position: [200, 100],
              size: [300, 200],
            },
            messages: [
              "Going down...",
              {
                action: camera.fadeOut,
                autoNext: 0,
              },
              {
                action: async () => {
                  this.deactivate();
                },
                autoNext: 0,
              },
              {
                action: async () => console.log("Changing scene."),
                autoNext: 0,
              },
            ],
          }
        });
      },
      onLeave() {
        displayBox.setImageId(Assets.WIREFRAME);
      }
    }));
    cellTriggerTracker.addTrigger(new CellTrigger({
      cells: [createCell(-3, 0, -1, CELLSIZE)],
      blockerBox: blockBox,
      blockShift: [0, 0, -CELLSIZE],
      triggerBox: dobukiBox,
      heroBox,
      spriteImageId: Assets.DOBUKI,
      wireframeImageId: Assets.WIREFRAME,
      worldColliders,
      spritesAccumulator,
      onCollide(collided) {
        displayBox.setImageId(collided ? Assets.WIREFRAME_RED : Assets.WIREFRAME);
      },
      onLeave() {
        displayBox.setImageId(Assets.WIREFRAME);
      },
      onEnter() {
        displayBox.setImageId(Assets.WIREFRAME_RED);

        openMenu({
          popupControl,
          layouts: [
            {
              name: "main-dialog",
              position: [null, 200],
              positionFromBottom: true,
            }
          ],
          dialog: {
            layout: "main-dialog",
            messages: [
              { text: "Hello there." },
              {
                text: "How are you?",
                menu: {
                  layout: {
                    position: [400, 360],
                    size: [null, 150],
                    positionFromRight: true,
                    positionFromBottom: true,
                  },
                  items: [
                    {
                      label: "I don't know",
                      dialog: {
                        layout: {
                          position: [100, 100],
                          size: [300, 200],
                        },
                        messages: [
                          { text: "You should know!" },
                        ],
                      },
                    },
                    {
                      back: true,
                      label: "good",
                      dialog: {
                        layout: {
                          name: "main-dialog",
                          position: [null, 200],
                          positionFromBottom: true,
                        },
                        messages: [
                          { text: "That's nice to know!" },
                        ],
                      },
                    },
                    {
                      back: true,
                      label: "bad",
                    },
                  ],
                },
              },
              { text: "Bye bye." },
              {
                autoNext: 0,
                action: async () => {
                  goBackAction(heroPos)?.();
                },
              },
            ],
          }
        });
      }
    }));

    cellTriggerTracker.addTrigger(new CellTrigger({
      cells: [
        [-1, 0, -1],
        [1, 0, -1],
        [0, 0, -1],
        [-1, 0, 0],
        [1, 0, 0],
      ].map(([x, y, z]) => createCell(x, y, z, CELLSIZE)),
      heroBox,
      boxImage: {
        outside: Assets.GROUND,
        inside: Assets.BRICK,
      },
      worldColliders,
      spritesAccumulator,
      blockerBox: blockBox,
      onCollide(collided) {
        displayBox.setImageId(collided ? Assets.WIREFRAME_RED : Assets.WIREFRAME);
      },
    }));

    cellTriggerTracker.addTrigger(new CellTrigger({
      cells: [createCell(1, 0, 0, CELLSIZE)],
      heroBox,
      displayBox: blockBox,
      displayShift: [.1, 0, 0],
      boxImage: {
        outside: Assets.LOGO,
        faces: [Face.RIGHT],
      },
      worldColliders,
      spritesAccumulator,
    }));

    cellTriggerTracker.addTrigger(new CellTrigger({
      cells: [createCell(-1, 0, 0, CELLSIZE)],
      heroBox,
      displayBox: blockBox,
      displayShift: [-.1, 0, 0],
      boxImage: {
        outside: Assets.LOGO,
        faces: [Face.LEFT],
      },
      worldColliders,
      spritesAccumulator,
    }));

    cellTriggerTracker.addTrigger(new CellTrigger({
      cells: [
        [0, 0, 0],
        [0, 0, 1],
        [-1, 0, 1],
        [1, 0, 1],
      ].map(([x, y, z]) => createCell(x, y, z, CELLSIZE)),
      heroBox,
      displayBox: blockBox,
      displayShift: [0, .01, 0],
      boxImage: {
        inside: Assets.GRASS_GROUND,
        faces: [Face.BOTTOM],
      },
      worldColliders,
      spritesAccumulator,
    }));

    const camPosition: IPositionMatrix = new PositionMatrix();
    const camera: ICamera = this.camera = new Camera({
      engine, motor, position: camPosition,
      // config: {
      //   distance: 0,
      //   tilt: .2,
      //   zoom: .25,
      //   perspective: .05,
      //   backgroundColor: 0,
      // },
      config: {
        distance: 15,
        tilt: .8,
        zoom: .25,
        perspective: .05,
        backgroundColor: 0,
      },
    });
    this.addAuxiliary(camera);

    {
      const arrayPool = new ObjectPool<Sprite[]>(a => a ?? [], a => a.length = 0);
      const arrayPool2 = new ObjectPool<ICollisionDetector[]>(a => a ?? [], a => a.length = 0);
      const spritePool = new SpritePool();
      const spritesMap = new Map<Tag, Sprite[]>();
      const collidersMap = new Map<Tag, ICollisionDetector[]>();
      cellTrackers.add(filter({
        trackCell: (cell): boolean => {
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

    const heroPos: IPositionMatrix = new PositionMatrix({ blockers: worldColliders }).movedTo(0, 0, 3);
    const heroSprites = new SpriteGroup([{
      imageId: Assets.DODO,
      spriteType: SpriteType.SPRITE,
      transform: Matrix.create().translate(0, -.3, 0),
      animationId: Anims.STILL,
    }], heroPos);
    spritesAccumulator.add(heroSprites);
    this.addAuxiliary({
      activate() {
        spritesAccumulator.updateFully();
      },
    });

    const displayBox = new SpriteGroup(new DisplayBox({ box: heroBox, imageId: Assets.WIREFRAME }), heroPos);

    spritesAccumulator.add(displayBox);

    const shadowPos: IPositionMatrix = new PositionMatrix({});
    const shadowHeroSprites = new SpriteGroup([{
      imageId: Assets.DODO_SHADOW,
      transform: Matrix.create().translate(0, -.89, .5).rotateX(-Math.PI / 2).scale(1, .3, 1),
      animationId: Anims.STILL,
    }], shadowPos);

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
    spritesAccumulator.add(new SpriteGroup([{
      imageId: Assets.VIDEO,
      spriteType: SpriteType.DISTANT,
      transform: Matrix.create()
        .translate(3000, 1000, -5000)
        .scale(480, 270, 1),
    }]));

    const controlledMotor = new ControlledMotor(motor, { policy: Policy.INCOMING_CYCLE_PRIORITY });
    const stepBack = new StepBackAuxiliary({ motor: controlledMotor, position: heroPos });
    const posStep = new PositionStepAuxiliary({ motor: controlledMotor, controls: gameControls, positionStep: new PositionStep({ position: heroPos }), turnGoal: camera.turn.angle }, { speed: 1.5, airBoost: 1.5 });

    //  Toggle auxiliary
    //  * Pressing the "Tab" button switches between two modes of movement below
    //  * The PositionStepAuxiliary is "dungeon" crawling mode, where you move cell by cell.
    //  * CamTiltReset is just for restoring the view from looking up or down
    //  * CamMoveAuxiliary is a more free-form way to move.
    //  * JumpAuxiliary lets you jump
    this.addAuxiliary(keyboard)
      .addAuxiliary(new ToggleAuxiliary({ keyboard }, {
        auxiliariesMap: [{
          key: "Tab", aux: () => Auxiliaries.from(
            posStep,
            stepBack,
            new SmoothFollowAuxiliary({ motor, follower: camPosition, followee: heroPos }, { speed: .05, followY: false }),
            new JumpAuxiliary({ motor, controls: gameControls, position: heroPos }, { gravity: -2, jump: 3 }),
            new TurnStepAuxiliary({ motor, controls: gameControls, turn: camera.turn }),
          ),
        }, {
          key: "Tab", aux: () => Auxiliaries.from(
            new TurnAuxiliary({ motor, controls: gameControls, turn: camera.turn }),
            new TiltAuxiliary({ motor, controls: gameControls, tilt: camera.tilt }),
            new MoveAuxiliary({ motor, controls: gameControls, direction: camera.turn, position: heroPos }),
            new JumpAuxiliary({ motor, controls: gameControls, position: heroPos }),
            new TiltResetAuxiliary({ motor, controls: gameControls, tilt: camera.tilt }),
            new SmoothFollowAuxiliary({ motor, follower: camPosition, followee: heroPos }, { speed: .05 }),
          ),
        }],
      }))
      .addAuxiliary(new DirAuxiliary({ controls: gameControls }, dx => {
        heroSprites.setOrientation(dx);
        shadowHeroSprites.setOrientation(dx);
      }))
      .addAuxiliary(new MotionAuxiliary({ controls: gameControls }, moving => {
        const animId = moving ? Anims.RUN : Anims.STILL;
        heroSprites.setAnimationId(animId);
        shadowHeroSprites.setAnimationId(animId);
      }))
      .addAuxiliary(stepBack)
      .addAuxiliary(new CellChangeDetector({ positionMatrix: heroPos }, { cellSize: CELLSIZE })
        .addListener(new SurroundingTracker({ cellTrack: cellTrackers }, {
          cellLimit: 100,
          range: [7, 3, 7],
          cellSize: CELLSIZE,
        }))
        .addListener(stepBack))
      .addAuxiliary(new TimeAuxiliary({ motor, engine }));
  }
}
