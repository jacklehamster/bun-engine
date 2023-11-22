(global as any).OffscreenCanvas = class OffscreenCanvas {
  constructor(public width: number, public height: number) {
  }

  getContext(_contextType: string) {
    // Return a mock context
    return {
      imageSmoothingEnabled: true,
      // Add other properties and methods as needed
    };
  }
};
