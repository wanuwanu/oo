// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_model.h"

template<typename T = OoVertexPNC>
class OoModelCylinder : public OoModelEx<T> {
public:
  virtual OoModelCylinder<T>* clone(){return new OoModelCylinder<T>(*this);}

  virtual bool create(int num_horizontal_division, int num_vertical_division, float radius, float length, bool curved_surface, bool reverse){
    int n = num_horizontal_division;
    int m = num_vertical_division;

    auto get_vertex = [&](int x, int y){
      T v(oo::get3DVectorRy(oo::k2PiF * x / n) * radius);
      v._position.y = (0.5f - (float)y / m) * length;
      if(T::getOffsetOfTextureCoord()) v.setTextureCoord(OoVector2((float)x / n, (float)y / m));
      if(T::getOffsetOfNormal()) v.setNormal(oo::get3DVectorRy(oo::k2PiF * x / n));
      return v;
    };

    auto vertices = OoModel::createMeshWithVertexFunc<T>(n, m, get_vertex);
    if(T::getOffsetOfNormal()){
      if(curved_surface){
        oo::generateSurfaceNormalXZCurve(vertices);
      }else{
        oo::generateSurfaceNormal(vertices);
      }
    }

    for(int y = 0; y <= m; y += m){
      for(int x = 0; x < n; x++){
        vector<T> v(3);
        v[0] = get_vertex(x, y);
        v[0]._position.x = 0.0f;
        v[0]._position.z = 0.0f;
        v[1] = get_vertex(x, y);
        v[2] = get_vertex(x + 1, y);
        if(y == m) oo::swap(v[1], v[2]);
        oo::generateSurfaceNormal(v);
        vertices.insert(vertices.end(), v.begin(), v.end());
      }
    }

    OoModel::createSharedVertexModel(vertices);

    OoModel::setShaderWithType(OoDrawObject::_shader_type);
    OoModel::_uniform = OoDrawObject::_shader->createUniform();
    return true;
  }
};

