// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_model.h"

template<typename T = OoVertexPNC>
class OoModelTorus : public OoModelEx<T> {
public:
  virtual OoModelTorus<T>* clone(){return new OoModelTorus<T>(*this);}

  virtual bool create(int section_division, int torus_division, float section_radius, float torus_radius, bool curved_surface, bool reverse){
    int n = torus_division;
    int m = section_division;

    auto get_vertex = [&](int x, int y){
      T v(torus_radius * oo::get3DVectorRy(oo::k2PiF * x / n));
      v._position += section_radius * oo::get3DVectorRxRy(oo::k2PiF * y / m - oo::kPi2F, oo::k2PiF * x / n);
      if(T::getOffsetOfTextureCoord()) v.setTextureCoord(OoVector2((float)x / n, (float)y / m));
      if(T::getOffsetOfNormal()) v.setNormal(oo::get3DVectorRxRy(oo::k2PiF * y / m - oo::kPi2F, oo::k2PiF * x / n));
      return v;
    };

    auto vertices = OoModel::createMeshWithVertexFunc<T>(n, m, get_vertex);
    if(!curved_surface && T::getOffsetOfNormal()) oo::generateSurfaceNormal(vertices);
    OoModel::createSharedVertexModel(vertices);

    OoModel::setShaderWithType(OoDrawObject::_shader_type);
    OoModel::_uniform = OoDrawObject::_shader->createUniform();
    return true;
  }
};

