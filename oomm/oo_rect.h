// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_std.h"

class OoRect2 {
public:
  float _x0 = 0.0f;
  float _y0 = 0.0f;
  float _x1 = 0.0f;
  float _y1 = 0.0f;
public:
  OoRect2() {}
  OoRect2(float x0, float y0, float x1, float y1) {
    _x0 = x0; _y0 = y0; _x1 = x1; _y1 = y1;
  }
public:
  OoRect2& operator|=(OoRect2 r) {
    _x0 = oo::min2<float>(_x0, r._x0);
    _y0 = oo::min2<float>(_y0, r._y0);
    _x1 = oo::max2<float>(_x1, r._x1);
    _y1 = oo::max2<float>(_y1, r._y1);
    return *this;
  }
  OoRect2& operator|=(OoVector2 v) {
    _x0 = oo::min2<float>(_x0, v.x); _x1 = oo::max2<float>(_x1, v.x);
    _y0 = oo::min2<float>(_y0, v.y); _y1 = oo::max2<float>(_y1, v.y);
    return *this;
  }
  OoRect2& operator|=(OoVector3 v){
    _x0 = oo::min2<float>(_x0, v.x); _x1 = oo::max2<float>(_x1, v.x);
    _y0 = oo::min2<float>(_y0, v.y); _y1 = oo::max2<float>(_y1, v.y);
    return *this;
  }
  OoRect2& setXYWH(float x, float y, float w, float h){
    _x0 = x;
    _y0 = y;
    _x1 = x + w;
    _y1 = y + h;
    return *this;
  }
  float getWidth() { return _x1 - _x0; }
  float getHeight() { return _y1 - _y0; }
  bool isContained(OoVector2 v){
    if(v.x < _x0 || v.x >= _x1) return false;
    if(v.y < _y0 || v.y >= _y1) return false;
    return true;
  }
};

inline OoRect2 operator|(OoRect2 r0, OoRect2 r1) {
  OoRect2 r = r0;
  return r |= r1;
}


class OoRect3 {
public:
  float _x0 = 0.0f;
  float _y0 = 0.0f;
  float _z0 = 0.0f;
  float _x1 = 0.0f;
  float _y1 = 0.0f;
  float _z1 = 0.0f;
public:
  OoRect3(){}
  OoRect3(float x0, float x1, float y0, float y1, float z0, float z1) {
    _x0 = x0; _x1 = x1; _y0 = y0; _y1 = y1; _z0 = z0; _z1 = z1;
  }
  OoRect3(OoVector3 v) {
    _x0 = v.x; _x1 = v.x; _y0 = v.y; _y1 = v.y; _z0 = v.z; _z1 = v.z;
  }
public:
  inline OoRect3 &operator|=(OoRect3 r) {
    _x0 = oo::min2<float>(_x0, r._x0); _x1 = oo::max2<float>(_x1, r._x1);
    _y0 = oo::min2<float>(_y0, r._y0); _y1 = oo::max2<float>(_y1, r._y1);
    _z0 = oo::min2<float>(_z0, r._z0); _z1 = oo::max2<float>(_z1, r._z1);
    return *this;
  }
  inline OoRect3 &operator|=(OoVector3 v) {
    _x0 = oo::min2<float>(_x0, v.x); _x1 = oo::max2<float>(_x1, v.x);
    _y0 = oo::min2<float>(_y0, v.y); _y1 = oo::max2<float>(_y1, v.y);
    _z0 = oo::min2<float>(_z0, v.z); _z1 = oo::max2<float>(_z1, v.z);
    return *this;
  }
  inline OoRect3 &setXYZWHD(float x, float y, float z, float w, float h, float d) {
    _x0 = x;
    _y0 = y;
    _z0 = z;
    _x1 = x + w;
    _y1 = y + h;
    _z1 = z + d;
    return *this;
  }
};

inline OoRect3 operator|(OoRect3 r0, OoRect3 r1) {
  OoRect3 r = r0;
  return r |= r1;
}


