#import "metal_renderer.h"

MetalRenderer::MetalRenderer()
{
  init();
}

void MetalRenderer::init()
{
  _device = MTLCreateSystemDefaultDevice();
  _commandQueue = [_device newCommandQueue];
  SetCurrent(this);
}

void MetalRenderer::setDrawableSize(CGSize drawableSize)
{
  _drawableSize = drawableSize;
  createDepthTexture();
}

void MetalRenderer::createDepthTexture()
{
  if ([_depthTexture width] != _drawableSize.width || [_depthTexture height] != _drawableSize.height) {
    MTLTextureDescriptor *desc = [MTLTextureDescriptor texture2DDescriptorWithPixelFormat:MTLPixelFormatDepth32Float
                                                                                    width:_drawableSize.width
                                                                                   height:_drawableSize.height
                                                                                mipmapped:NO];
    desc.usage = MTLTextureUsageRenderTarget;
    _depthTexture = [_device newTextureWithDescriptor:desc];
  }
}

void MetalRenderer::beginRenderWithDrawable(id<CAMetalDrawable>drawable)
{
  _drawable = drawable;
  _commandBuffer = [_commandQueue commandBuffer];
}

void MetalRenderer::endRender()
{
  [_commandBuffer presentDrawable:_drawable];
  [_commandBuffer commit];
}

void MetalRenderer::beginDrawableRenderPass()
{
  static float r = 0;
  r += 0.01f;
  if(r >= 1) r = 0;
  MTLClearColor color = MTLClearColorMake(r, 0.5, 1.0, 1);

  MTLRenderPassDescriptor *desc = [MTLRenderPassDescriptor renderPassDescriptor];
  desc.colorAttachments[0].texture = _drawable.texture;
  desc.colorAttachments[0].loadAction = MTLLoadActionClear;
  desc.colorAttachments[0].storeAction = MTLStoreActionStore;
  desc.colorAttachments[0].clearColor = color;

  desc.depthAttachment.texture = _depthTexture;
  desc.depthAttachment.loadAction = MTLLoadActionClear;
  desc.depthAttachment.storeAction = MTLStoreActionDontCare;
  desc.depthAttachment.clearDepth = 1.0;

  _renderCommandEncoder = [_commandBuffer renderCommandEncoderWithDescriptor:desc];
}

void MetalRenderer::endDrawableRenderPass()
{
  [_renderCommandEncoder endEncoding];
}




