// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_matrix.h"
#include "oo_std.h"
#include "oo_vector.h"

class OoShader;

enum OoCullMode {
  kCullNone = 0,
  kCullFront,
  kCullBack,
};

class OoDrawObject {
public:
  bool _show = true;

  OoVector3 _position     = 0.0f;
  OoVector3 _rotation_zxy = 0.0f;
  OoVector3 _scale        = 1.0f;

  OoVector3 _reverse = 1.0f; // 1.0f or -1.0f
  OoVector3 _offset  = 0.0f;

  OoVector3 _rotation_offset = 0.0f;

  OoVector3 _local_offset = 0.0f;
  OoVector4 _local_color  = 1.0f;

  float _z_position = 0.0f;
  float _z_shift    = 0.0f;

protected:
  OoMatrix _transform;
  string   _shader_type = "";

public:
  OoShader * _shader    = nullptr;
  OoCullMode _cull_mode = kCullNone;

protected:
  virtual void updateTransform() {
    auto scale = _scale * _reverse;
    _transform.setScaleMatrix(scale);
    _transform.setTranslation(scale * (_offset + _local_offset + _rotation_offset));
    _transform.rotateYXZ(_rotation_zxy);
    _transform.setTranslation(_transform.getTranslation() + _position - scale * _rotation_offset);
  }

public:
  OoDrawObject() {}
  virtual ~OoDrawObject() {}

public:
  virtual void  setShaderWithType(string type) {}
  virtual float getZOrder() { return _z_position + _z_shift; }
  virtual void  draw() {}
};
