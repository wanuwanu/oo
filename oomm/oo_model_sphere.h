// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_model.h"

template<typename T = OoVertexPNC>
class OoModelSphere : public OoModelEx<T> {
public:
  virtual OoModelSphere<T>* clone(){return new OoModelSphere<T>(*this);}

  virtual bool create(int num_horizontal_division, int num_vertical_division, float radius, bool curved_surface, bool reverse, bool hemi){
    int n = num_horizontal_division;
    int m = num_vertical_division;

    auto get_vertex = [&](int x, int y){
      T v(radius * oo::get3DVectorRxRy(oo::kPiF * y / m - oo::kPi2F, oo::k2PiF * x / n));
      if(T::getOffsetOfTextureCoord()) v.setTextureCoord(OoVector2((float)x / n, (float)y / m));
      return v;
    };

    auto vertices = OoModel::createMeshWithVertexFunc<T>(n, m, get_vertex);
    if(T::getOffsetOfNormal()) oo::generateNormal(vertices, curved_surface);
    OoModel::createSharedVertexModel(vertices);

    OoModel::setShaderWithType(OoDrawObject::_shader_type);
    OoModel::_uniform = OoDrawObject::_shader->createUniform();
    return true;
  }
};

