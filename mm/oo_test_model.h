#pragma once

#import <MetalKit/MetalKit.h>
#import "oo_std.h"

class OoTestModel {
public:
  id<MTLBuffer> _vertexBuffer;
  id<MTLBuffer> _indexBuffer;
public:
  OoTestModel(){}
  virtual ~OoTestModel(){}
public:
  virtual void create();
  virtual void draw();
};

