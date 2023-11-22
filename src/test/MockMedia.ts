(global as any).Image = class Image {
  constructor(public width = 0, public height = 0) { }
  src = '';
  addEventListener(event: string, callback: Function) {
    if (event === 'load') {
      setTimeout(callback, 0);
    }
  }
  removeEventListener() { }
  get naturalWidth() { return this.width; }
  get naturalHeight() { return this.height; }
};

(global as any).VideoFrame = class VideoFrame {
  constructor(public image = new Image()) { }
  get displayWidth() { return this.image.width; }
  get displayHeight() { return this.image.height; }
};
