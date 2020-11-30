// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_draw_object.h"

using OoDrawObjectPtrArray = vector<OoDrawObject *>;

class OoDrawChain {
protected:
  map<float, OoDrawObjectPtrArray *> _order_map;
public:
  OoDrawChain() {};
  virtual ~OoDrawChain() { free(); }
public:
  virtual void addWithOrder(float z, OoDrawObject *draw_object) {
    // z >= 0.0f
    z *= -1.0f; // instead of reverse iterator
    if(_order_map[z] == nullptr) _order_map[z] = new OoDrawObjectPtrArray;
    _order_map[z]->push_back(draw_object);
  }
  virtual void add(OoDrawObject *draw_object) {
    addWithOrder(draw_object->getgetZOrder(), draw_object);
  }
  virtual void free() {
    for(auto &x : _order_map) delete x.second;
    _order_map.clear();
  }
  virtual void draw() {
    for(auto &a : _order_map){
      for(auto &x : *(a.second)) x->draw();
    }
  }
};

