// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_draw_object.h"
#include "oo_triangle_list.h"
#include "oo_texture.h"
#include "oo_vertex.h"

class OoSprite : public OoDrawObject {
public:
  OoVector2 _size       = 1.0f;
  shared_ptr<OoUniform> _uniform;
  shared_ptr<OoTriangleListBase> _triangle_list;
  shared_ptr<OoTexture> _texture;
public:
  OoSprite() { _shader_type = "pt"; }
  virtual ~OoSprite() { free(); }
public:
  virtual void setShaderWithType(string type) { _shader = OoMetalRenderer::Get()->getShader(type); }

  virtual void create() { createWithUVWH(0, 0, 1, 1); }
  virtual void createWithUVWH(float u, float v, float w, float h) {
    setShaderWithType(_shader_type);
    _uniform = _shader->createUniform();
    vector<OoVertexPT> vv(4);
    vv[0]._position = OoVector3(-0.5, -0.5, 0);
    vv[1]._position = OoVector3( 0.5, -0.5, 0);
    vv[2]._position = OoVector3(-0.5,  0.5, 0);
    vv[3]._position = OoVector3( 0.5,  0.5, 0);
    vv[0]._texture_coord = OoVector2(u, v + h);
    vv[1]._texture_coord = OoVector2(u + w, v + h);
    vv[2]._texture_coord = OoVector2(u, v);
    vv[3]._texture_coord = OoVector2(u + w, v);
    vector<uint32> vi = {0, 1, 2, 2, 1, 3};
    auto triangle_list = make_shared<OoTriangleList<OoVertexPT>>();
    triangle_list->addVertexIndex(vv, vi);
    triangle_list->createBuffer();
    _triangle_list = triangle_list;
  }

  virtual void free() {
    _triangle_list.reset();
    _texture.reset();
  }

  virtual void draw() {
    if(!_show) return;

    updateTransform();
    _uniform->setTransform(_transform);
    _uniform->setColor(_local_color);

    _shader->setup();
    _shader->setupCullMode(_cull_mode);
    _shader->setupUniform(_uniform);
    _shader->setupTexture(_texture);
    _shader->drawTriangleList(_triangle_list);
  }

  virtual void createFromTexture(shared_ptr<OoTexture> texture){
    _size.set(texture->_width, texture->_height);
    _texture = texture;
  }
};

