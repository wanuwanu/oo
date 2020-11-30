#pragma once
#import <Foundation/Foundation.h>
#import <MetalKit/MetalKit.h>

class Renderer {
public:
  Renderer(){}
  virtual ~Renderer(){}
};

class MetalRenderer : public Renderer {
public:
  static MetalRenderer *&GetCurrent(){
    static MetalRenderer *current = nullptr;
    return current;
  }
  static void SetCurrent(MetalRenderer *current){GetCurrent() = current;}
  static id<MTLDevice> GetDevice(){return GetCurrent()->_device;}
  static id<MTLRenderCommandEncoder> GetRenderCommandEncoder(){return GetCurrent()->_renderCommandEncoder;}
public:
  id<MTLDevice>        _device;
  id<MTLCommandQueue>  _commandQueue;
  id<MTLCommandBuffer> _commandBuffer;
  id<CAMetalDrawable>  _drawable;
  id<MTLTexture>       _depthTexture;
  id<MTLRenderCommandEncoder> _renderCommandEncoder;
  CGSize _drawableSize;
public:
  MetalRenderer();
  virtual ~MetalRenderer(){}
public:
  virtual void init();
  virtual void setDrawableSize(CGSize drawableSize);
  virtual void createDepthTexture();

  virtual void beginRenderWithDrawable(id<CAMetalDrawable>drawable);
  virtual void endRender();
  // begin/end drawable render command encoder
  virtual void beginDrawableRenderPass();
  virtual void endDrawableRenderPass();
};
