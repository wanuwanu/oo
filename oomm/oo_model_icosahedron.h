// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_model.h"

template<typename T = OoVertexPNC>
class OoModelIcosahedron : public OoModelEx<T> {
public:
  virtual OoModelIcosahedron<T>* clone(){return new OoModelIcosahedron<T>(*this);}

  virtual bool create(float radius, int level, bool curved_surface, bool reverse){
    vector<OoVector3> positions = {
      {0.0f, 1.0f, 0.0f},
      {0.0f, 0.447213595f, 0.894427191f},
      {0.850650808f, 0.447213595f, 0.276393202f},
      {0.525731112f, 0.447213595f, -0.723606797f},
      {-0.525731112f, 0.447213595f, -0.723606797f},
      {-0.850650808f, 0.447213595f, 0.276393202f},
      {0.525731112f, -0.447213595f, 0.723606797f},
      {0.850650808f, -0.447213595f, -0.276393202f},
      {0.0f, -0.447213595f, -0.894427191f},
      {-0.850650808f, -0.447213595f, -0.276393202f},
      {-0.525731112f, -0.447213595f, 0.723606797f},
      {0.0f, -1.0f, 0.0f},
    };
    vector<uint32> indices = {
      0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 1,
      1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 8, 3, 8, 4, 4, 8, 9, 4, 9, 5, 5, 9, 10, 5, 10, 1, 1, 10, 6,
      6, 11, 7, 7, 11, 8, 8, 11, 9, 9, 11, 10, 10, 11, 6,
    };

    int n = (int)indices.size();
    vector<T> vertices(n);
    for(int i = 0; i < n; i++) vertices[i].setPosition(positions[indices[i]]);
    for (int i = 0; i < level; i++) oo::spherize(vertices);

    if(T::getOffsetOfNormal()) oo::generateNormal(vertices, curved_surface);
    for(auto &x : vertices) x._position *= radius;
    OoModel::createSharedVertexModel(vertices);

    OoModel::setShaderWithType(OoDrawObject::_shader_type);
    OoModel::_uniform = OoDrawObject::_shader->createUniform();
    return true;
  }
};

