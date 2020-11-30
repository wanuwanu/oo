// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_environment.h"
#include "oo_template.h"

namespace oo {
  template<typename T>
  void transformIntoSharedVertexIndex(vector<T> &vertices, vector<uint32> &indices) {
    auto func = [](const uint8 *p0, const uint8 *p1){return (memcmp(p0, p1, sizeof(T)) < 0) ? true : false;};
    map<uint8*, int, std::function<bool(const uint8 *p0, const uint8 *p1)>> m(func);

    vector<T>      shared_vertices;
    vector<uint32> shared_indices;

    int n = 0;
    for(int i = 0; i < (int)vertices.size(); i++){
      uint8 *p = (uint8 *)&vertices[i];
      if(!oo::mapFind(m, p)){
        shared_vertices.push_back(vertices[i]);
        m[p] = n++;
      }
      shared_indices.push_back(m[p]);
    }

    vertices = shared_vertices;
    indices  = shared_indices;
  }

  template<typename T>
  void spherize(vector<T> &vertices) {
    //     0
    //   3/_\4
    // 1/_\ /_\2
    //     5
    OoVector3 t[6];
    int idx[12] = { 0, 3, 4, 4, 3, 5, 3, 1, 5, 4, 5, 2 };

    int n = (int)vertices.size();
    vector<T> v(n * 4);

    for (int i = 0; i < n; i += 3) {
      t[0] = vertices[i + 0]._position;
      t[1] = vertices[i + 1]._position;
      t[2] = vertices[i + 2]._position;
      t[3] = (t[0] + t[1]) / 2;
      t[4] = (t[0] + t[2]) / 2;
      t[5] = (t[1] + t[2]) / 2;
      for (auto &x : t) x.normalize();
      for (int j = 0; j < 12; j++) v[i * 4 + j]._position = t[idx[j]];
    }

    vertices = v;
  }

  //    template<typename T>
  //    void generateNormalFromVertexXZ(vector<T> &vertices)
  //    {
  //        int n = (int)vertices.size();
  //        for (int i = 0; i < n; i++){
  //            auto v = vertices[i]._position;
  //            v.y = 0.0;
  //            vertices[i].setNormal(v.getNormal());
  //        }
  //    }

  template<typename T>
  void generateSphericalNormal(vector<T> &vertices) {
    int n = (int)vertices.size();
    for (int i = 0; i < n; i++) vertices[i].setNormal(vertices[i]._position.getNormal());
  }

  template<typename T>
  void generateSurfaceNormal(vector<T> &vertices) {
    int n = (int)vertices.size();
    for (int i = 0; i < n; i += 3){
      OoVector3 normal = oo::crossProduct(vertices[i + 1]._position - vertices[i]._position,
                                           vertices[i + 2]._position - vertices[i]._position);
      normal.normalize();
      for(int j = 0; j < 3; j++) vertices[i + j].setNormal(normal);
    }
  }

  template<typename T>
  void generateSurfaceNormalXZCurve(vector<T> &vertices) {
    int n = (int)vertices.size();
    for (int i = 0; i < n; i += 3){
      OoVector3 normal = oo::crossProduct(vertices[i + 1]._position - vertices[i]._position,
                                           vertices[i + 2]._position - vertices[i]._position);
      normal.normalize();
      for(int j = 0; j < 3; j++){
        auto n = vertices[i + j]._normal;
        if(oo::dotProduct(n, normal) < 0.0f) n *= -1.0f;
        n *= sqrtf(1.0f - (normal.y * normal.y));
        n.y = normal.y;
        vertices[i + j].setNormal(n);
      }
    }
  }

  template<typename T>
  void generateNormal(vector<T> &vertices, bool curved_surface) {
    if(curved_surface) {
      generateSphericalNormal(vertices);
    }else{
      generateSurfaceNormal(vertices);
    }
  }

} // namespace oo

