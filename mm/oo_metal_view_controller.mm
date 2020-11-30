#import "oo_metal_view_controller.h"
#import <Metal/Metal.h>
#import "metal_view.h"
#import "metal_renderer.h"


@implementation OoMetalViewController
{
  MetalView *_metalView;
  MetalRenderer *_metalRenderer;
  OoGameFrame *_gameFrame;
  bool _enableRender;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  [self setupMetal];
  [self setupGameFrame];
  [self setupDisplayLink];
  _enableRender = true;
}

- (void)setupMetal {
  _metalRenderer = new MetalRenderer();

  _metalView = [[MetalView alloc] initWithFrame:self.view.frame device:_metalRenderer->_device];
  self.view = _metalView;
  _metalRenderer->setDrawableSize(_metalView.metalLayer.drawableSize);
}

- (void)setupGameFrame {
  _gameFrame = nullptr; //app::createGameFrame();
  if(_gameFrame) _gameFrame->init();
}

- (void)setupDisplayLink {
  CADisplayLink *displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(onDisplayLink:)];
  displayLink.preferredFramesPerSecond = 60;
  [displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
}

- (void)onDisplayLink:(CADisplayLink *)displayLink {
  if(!_enableRender) return;

  if(_gameFrame) _gameFrame->update();

  _metalRenderer->beginRenderWithDrawable([_metalView.metalLayer nextDrawable]);
  _metalRenderer->beginDrawableRenderPass();

  if(_gameFrame) _gameFrame->render();

  _metalRenderer->endDrawableRenderPass();
  _metalRenderer->endRender();
}

@end
