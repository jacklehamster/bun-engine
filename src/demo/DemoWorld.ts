import IWorld from "world/IWorld";
import Matrix from "gl/transform/Matrix";
import { Keyboard } from "controls/Keyboard";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { Camera } from "camera/Camera";
import { CellChangeAuxiliary } from "gl/transform/aux/CellChangeAuxiliary";
import { Auxiliaries } from "world/aux/Auxiliaries";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { TurnAuxiliary } from "world/aux/TurnAuxiliary";
import { PositionStepAuxiliary } from "world/aux/PositionStepAuxiliary";
import { TiltResetAuxiliary } from "world/aux/TiltResetAuxiliary";
import { ToggleAuxiliary } from "world/aux/ToggleAuxiliary";
import { SurroundingTracker } from "world/grid/SurroundingTracker";
import { SpriteGroup } from "world/sprite/aux/SpritesGroup";
import { FixedSpriteGrid } from "world/sprite/aux/FixedSpriteGrid";
import { MaxSpriteCountAuxiliary } from "world/sprite/aux/MaxSpriteCountAuxiliary";
import { SpriteGrid } from "world/sprite/aux/SpriteGrid";
import { SpriteUpdater } from "world/sprite/update/SpriteUpdater";
import { Sprite, SpriteType } from "world/sprite/Sprite";
import { ICamera } from "camera/ICamera";
import { KeyboardControls } from "controls/KeyboardControls";
import { SpriteFactory } from "world/sprite/SpritesFactory";
import { MoveAuxiliary } from "world/aux/MoveAuxiliary";
import { positionFromCell } from "world/grid/CellPos";
import { JumpAuxiliary } from "world/aux/JumpAuxiliary";
import { TimeAuxiliary } from "core/aux/TimeAuxiliary";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { TiltAuxiliary } from "world/aux/TiltAuxiliary";
import { SmoothFollowAuxiliary } from "world/aux/SmoothFollowAuxiliary";
import { DirAuxiliary } from "world/aux/DirAuxiliary";
import { SpriteUpdateType } from "world/sprite/update/SpriteUpdateType";
import { MediaUpdater } from "world/sprite/update/MediaUpdater";
import { Accumulator } from "world/sprite/aux/Accumulator";
import { Media } from "gl/texture/Media";
import { AnimationUpdater } from "world/sprite/update/AnimationUpdater";
import { Animation } from "animation/Animation";
import { MotionAuxiliary } from "world/aux/MotionAuxiliary";
import { forEach } from "world/sprite/List";
import { FollowAuxiliary } from "world/aux/FollowAuxiliary";
import { ItemsGroup } from "world/sprite/aux/ItemsGroup";
import { WebGlCanvas } from "graphics/WebGlCanvas";
import { Hud } from "ui/Hud";
import { TurnStepAuxiliary } from "world/aux/TurnStepAuxiliary";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";

enum Assets {
  DOBUKI = 0,
  LOGO = 1,
  GROUND = 2,
  VIDEO = 3,
  WIREFRAME = 4,
  GRASS = 5,
  BRICK = 6,
  DODO = 7,
  DODO_SHADOW = 8,
}

enum Anims {
  STILL = 0,
  RUN = 1,
}

const LOGO_SIZE = 512;
const CELLSIZE = 2;

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  webGlCanvas: WebGlCanvas;
}

export class DemoWorld extends AuxiliaryHolder<IWorld> implements IWorld {
  camera: ICamera;
  constructor({ engine, motor, webGlCanvas }: Props) {
    super();

    //  Add a sprite accumulator.
    //  * Sprite accumulators are used to collect sprite definitions, so that the engine can display them.
    const spritesAccumulator = new Accumulator<Sprite>()
      .addAuxiliary(
        new SpriteUpdater({ engine, motor }),
        new MaxSpriteCountAuxiliary({ engine }),
      );
    this.addAuxiliary(spritesAccumulator);

    //  Add medias
    //  * Each media is a texture that can be shown on a sprite.
    //  * You can show videos, images, or you can have instructions to draw on a canvas.
    this.addAuxiliary(new Accumulator<Media>()
      .addAuxiliary(
        new MediaUpdater({ engine, motor }),
        new ItemsGroup<Media>([
          {
            id: Assets.DOBUKI,
            type: "image",
            src: "dobuki.png",
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
            postProcessing(context) {
              if (context) {
                const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
                const { data } = imageData;
                for (let i = 0; i < data.length; i += 4) {
                  data[i] = data[i + 1] = data[i + 2] = 0;
                }
                context.putImageData(imageData, 0, 0);
              }
            },
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
              ctx.lineWidth = 8;
              ctx.setLineDash([5, 2]);

              ctx.strokeStyle = 'green';

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
        ]),
      ));

    this.addAuxiliary(new Accumulator<Animation>()
      .addAuxiliary(
        new AnimationUpdater({ engine, motor }),
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
        ]),
      ));

    //  Adding a FixedSpriteGrid to the sprite accumulator.
    //  * You add sprite collections as "SpriteGrid". That way, the engine
    //  * will hide sprites if you're too far, and show them again if you're close.
    spritesAccumulator.addAuxiliary(new FixedSpriteGrid(
      { cellSize: CELLSIZE },
      //  Dobuki logo
      [
        {
          imageId: Assets.DOBUKI,
          spriteType: SpriteType.SPRITE,
          transform: Matrix.create().translate(0, 0, -3),
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
        ].map(transform => ({ imageId: Assets.LOGO, transform })),
        //  floor
        ...[
          Matrix.create().translate(0, -.9, 0).rotateX(-Math.PI / 2),
          Matrix.create().translate(0, -.9, 2).rotateX(-Math.PI / 2),
          Matrix.create().translate(-2, -.9, 2).rotateX(-Math.PI / 2),
          Matrix.create().translate(2, -.9, 2).rotateX(-Math.PI / 2),
        ].map(transform => ({ imageId: Assets.GROUND, transform })),
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
        ].map(transform => ({ imageId: Assets.GROUND, transform })),
        //  Inside
        ...[
          Matrix.create().translate(0, -1, 0).rotateX(-Math.PI / 2),
          Matrix.create().translate(0, 1, 0).rotateX(Math.PI / 2),
          Matrix.create().translate(-1, 0, 0).rotateY(Math.PI / 2),
          Matrix.create().translate(1, 0, 0).rotateY(-Math.PI / 2),
          Matrix.create().translate(0, 0, 1).rotateY(Math.PI),  //  front
          Matrix.create().translate(0, 0, -1).rotateY(0), //  back
        ].map(transform => ({ imageId: Assets.BRICK, transform })),
      ], [Matrix.create().setVector(positionFromCell([0, 0, -3, CELLSIZE]))]),
    ));

    const camera = new Camera({ engine, motor });
    this.addAuxiliary(camera);
    this.camera = camera;

    //  Dynamic SpriteGrid
    //  * This SpriteGrid is dynamic, meaning that the cell gets generated on the
    //  * fly. This allows us to produce an infinite amounts of cells.
    spritesAccumulator.addAuxiliary(new SpriteGrid(
      { yRange: [0, 0] }, new SpriteFactory({
        fillSpriteBag({ pos }, bag) {
          const ground = bag.createSprite(Assets.GRASS);
          ground.transform.translate(pos[0] * pos[3], -1, pos[2] * pos[3]).rotateX(-Math.PI / 2);
          const ceiling = bag.createSprite(Assets.WIREFRAME);
          ceiling.transform.translate(pos[0] * pos[3], 2, pos[2] * pos[3]).rotateX(Math.PI / 2);
          bag.addSprite(ground, ceiling);
        },
      })
    ));

    const heroPos: IPositionMatrix = new PositionMatrix()
      .onChange(() => {
        forEach(heroSprites, (_, index) => heroSprites.informUpdate(index, SpriteUpdateType.TRANSFORM));
      });
    const heroSprites = new SpriteGroup([
      {
        imageId: Assets.DODO,
        spriteType: SpriteType.SPRITE,
        transform: Matrix.create().translate(0, -.5, 0),
        animationId: Anims.STILL,
      },
    ], [heroPos]);

    const shadowPos: IPositionMatrix = new PositionMatrix()
      .onChange(() => {
        forEach(shadowHeroSprites, (_, index) => shadowHeroSprites.informUpdate(index, SpriteUpdateType.TRANSFORM));
      });;
    const shadowHeroSprites = new SpriteGroup([
      {
        imageId: Assets.DODO_SHADOW,
        transform: Matrix.create().translate(0, -.8, .5).rotateX(-Math.PI / 2).scale(1, .3, 1),
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

    spritesAccumulator.addAuxiliary(heroSprites);
    spritesAccumulator.addAuxiliary(shadowHeroSprites);

    //  * A move blocker just determines where you can or cannot move.
    //  Currently, there is just one block at [0, 0, -3]
    heroPos.moveBlocker = {
      isBlocked(pos): boolean {
        const blockPos = positionFromCell([0, 0, -3, 2]);
        const range = 2;
        const dx = blockPos[0] - pos[0],
          dy = blockPos[1] - pos[1],
          dz = blockPos[2] - pos[2];
        const distSq = dx * dx + dy * dy + dz * dz;
        return distSq < range * range;
      },
    };

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
    const keyboard = new Keyboard({ motor });
    const controls = new KeyboardControls(keyboard);
    keyboard.addAuxiliary(
      new ToggleAuxiliary({
        auxiliariesMapping: [
          {
            key: "Tab", aux: Auxiliaries.from(
              new PositionStepAuxiliary({ motor, controls, position: heroPos }),
              new SmoothFollowAuxiliary({ motor, follower: camera.position, followee: heroPos }, { speed: .05 }),
              new JumpAuxiliary({ motor, controls, position: heroPos }),
              new TurnStepAuxiliary({ motor, controls, turn: camera.turn }),
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
      }),
    );
    this.addAuxiliary(keyboard)
      .addAuxiliary(new DirAuxiliary({ flippable: heroSprites, controls }))
      .addAuxiliary(new DirAuxiliary({ flippable: shadowHeroSprites, controls }))
      .addAuxiliary(new MotionAuxiliary({ controls }, moving => {
        const animId = moving ? Anims.RUN : Anims.STILL;
        heroSprites.animationId = animId;
        shadowHeroSprites.animationId = animId;
      }));

    //  CellChangeAuxiliary
    //  * This is needed to indicate when the player is changing cell
    //  * as they move. Every cell change, a new set of surrounding cells
    //  * is evaluated, and some are created as needed.
    camera.position.addAuxiliary(
      new CellChangeAuxiliary({ cellSize: CELLSIZE })
        .addAuxiliary(new SurroundingTracker(this, {
          cellLimit: 100,
          range: [5, 3, 5],
          cellSize: CELLSIZE,
        })));

    webGlCanvas.addAuxiliary(new Hud());

    //  Hack some base settings
    camera.distance.setValue(5)
    camera.tilt.angle.setValue(1.1);
    camera.projection.zoom.setValue(.25);
    camera.projection.perspective.setValue(.05);
    this.addAuxiliary(new TimeAuxiliary({ motor, engine }));
  }
}
