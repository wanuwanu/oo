// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_model.h"

template<typename T = OoVertexPNC>
class OoModelBox : public OoModelEx<T> {
public:
  virtual OoModelBox<T>* clone(){return new OoModelBox<T>(*this);}

  virtual bool create(float scale_x, float scale_y, float scale_z, bool reverse){
    vector<OoVector3> positions = {
      { 0.0f,  1.0f,  0.0f},
      { 1.0f,  1.0f,  1.0f},
      { 1.0f,  1.0f, -1.0f},
      {-1.0f,  1.0f, -1.0f},
      {-1.0f,  1.0f,  1.0f},
      { 0.0f,  0.0f,  1.0f},
      { 1.0f,  0.0f,  0.0f},
      { 0.0f,  0.0f, -1.0f},
      {-1.0f,  0.0f,  0.0f},
      { 1.0f, -1.0f,  1.0f},
      { 1.0f, -1.0f, -1.0f},
      {-1.0f, -1.0f, -1.0f},
      {-1.0f, -1.0f,  1.0f},
      { 0.0f, -1.0f,  0.0f},
    };
    vector<uint32> indices = {
      0,  1,  2,  0,  2,  3,  0,  3,  4,  0,  4,  1,
      1,  6,  2,  2,  7,  3,  3,  8,  4,  4,  5,  1,
      1,  9,  6,  2,  6, 10,  2, 10,  7,  3,  7, 11,
      3, 11,  8,  4,  8, 12,  4, 12,  5,  1,  5,  9,
      6,  9, 10,  7, 10, 11,  8, 11, 12,  5, 12,  9,
      9, 13, 10, 10, 13, 11, 11, 13, 12, 12, 13,  9,
    };

    int n = (int)indices.size();
    vector<T> vertices(n);
    for(int i = 0; i < n; i++) vertices[i].setPosition(positions[indices[i]]);

    if(T::getOffsetOfNormal()) oo::generateSurfaceNormal(vertices);
    for(auto &x : vertices) x._position *= OoVector3(scale_x, scale_y, scale_z) * 0.5f;
    OoModel::createSharedVertexModel(vertices);

    OoModel::setShaderWithType(OoDrawObject::_shader_type);
    OoModel::_uniform = OoDrawObject::_shader->createUniform();
    return true;
  }
};

