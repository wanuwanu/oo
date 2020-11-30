#import "metal_view.h"

@implementation MetalView

+ (Class)layerClass {
  return [CAMetalLayer class];
}

- (CAMetalLayer *)metalLayer {
  return (CAMetalLayer *)self.layer;
}

- (instancetype)initWithFrame:(CGRect)frame device:(id<MTLDevice>)device {
  self = [super initWithFrame:frame];
  if (self) {
    self.metalLayer.device = device;
    self.metalLayer.pixelFormat = MTLPixelFormatBGRA8Unorm;

    CGFloat scale = [[UIScreen mainScreen] scale];
    CGSize drawableSize = self.bounds.size;
    drawableSize.width *= scale;
    drawableSize.height *= scale;
    self.metalLayer.drawableSize = drawableSize;
  }
  return self;
}

@end
