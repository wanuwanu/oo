// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#import <MetalKit/MetalKit.h>
#import "oo_std.h"

class OoPipeline {
public:
  id<MTLRenderPipelineState> _pipeline_state;
  id<MTLDepthStencilState> _depth_stencil_state;

  MTLVertexDescriptor *_mtlVertexDescriptor;

public:
  OoPipeline(){}
  virtual ~OoPipeline(){}
public:
  virtual void create();
  virtual void createPipelineState(string vertex, string fragment);
  virtual void createDepthStencilState();
  virtual void setup();
};

