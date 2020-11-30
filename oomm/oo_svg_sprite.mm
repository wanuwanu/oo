// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
//#include "oo_svg_sprite.h"
//#include "oo_draw_object.h"
//#include "oo_shader.h"
//#include "oo_vertex.h"
/*
void OoSvgSprite::free() {
  _triangle_list.reset();
  _texture.reset();
  OoSvg::free();
}

void OoSvgSprite::releaseSvgData() {
  OoSvg::free();
}

bool OoSvgSprite::create() {
  OoSvg::create();

  float u = 0, v = 0, w = 0, h = 0;

  vector<OoVertexPCT> vv(4);
  vv[0]._position = OoVector3(-0.5,  0.5, 0);
  vv[1]._position = OoVector3(-0.5, -0.5, 0);
  vv[2]._position = OoVector3( 0.5,  0.5, 0);
  vv[3]._position = OoVector3( 0.5, -0.5, 0);
  vv[0]._texture_coord = OoVector2(u, v);
  vv[1]._texture_coord = OoVector2(u, v + h);
  vv[2]._texture_coord = OoVector2(u + w, v);
  vv[3]._texture_coord = OoVector2(u + w, v + h);
  vector<uint32> vi = {0, 1, 2, 2, 1, 3};
  auto triangle_list = make_shared<OoTriangleList<OoVertexPCT>>();
  triangle_list->addVertexIndex(vv, vi);
  triangle_list->createBuffer();
  _triangle_list = triangle_list;

  // prerender
  return true;
}

void OoSvgSprite::draw() {
  if(!_show) return;
  if(_prerender == false) return OoSvg::draw();

  updateTransform();
  _uniform->setTransform(_transform);
  _uniform->setColor(_local_color);

  _shader->setup();
  _shader->setupCullMode(_cull_mode);
  _shader->setupUniform(_uniform);
  _shader->setupTexture(_texture);
  _shader->drawTriangleList(_triangle_list);
}

bool OoSvgSprite::createPrerenderImage(float prerender_scale) {
  if(_prerender) return true;

// view box 全体
//    int w = _region.getWidth();
//    int h = _region.getHeight();
//
//    _prerender_image.createRenderTexture(w * prerender_scale, h * prerender_scale);
//    _prerender_image.setRenderTarget();
//
//    Gfl3DRender render;
//    render.createPrerenderEnv(w, h);
//    render.setCurrent();
//
//    glEnable(GL_BLEND);
//    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
//
//    draw(null);
//
//    _prerender_sprite.init();
//    _prerender_sprite.setOffsetXY(- 0.5f * w, - 0.5f * h);
//    _prerender_sprite.setWH(w, h);
//    _prerender_sprite.setGfl3DTexture(&_prerender_image);

  // 必要な分だけプリレンダリングする
  int bw = _body.getWidth();
  int bh = _body.getHeight();
  float cx = (_body._x0 + _body._x1) * 0.5f;
  float cy = (_body._y0 + _body._y1) * 0.5f;

//_prerender_image->createRenderTexture(bw * prerender_scale, bh * prerender_scale);
//_prerender_image->setRenderTarget();

  _texture = make_shared<OoTexture>();
  _texture->createRenderTexture(bw * prerender_scale, bh * prerender_scale);
//  _texture->beginRenderTarget();
//  OoSvg::draw();
//  _texture->endRenderTarget();

  _texture->renderTargetScope([&](){
    OoSvg::draw();
  });



//Gfl3DRender render;
//render.createPrerenderEnv(bw, bh);
//render.setCurrent();
//
//glEnable(GL_BLEND);
//glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
//
//Gfl3DVector push_offset = _offset;
//_offset = Gfl3DVector(- cx, - cy, 0.0f);
//draw();
//_offset = push_offset;
//
////  _prerender_sprite.setOffset(OoVector2(- _body._x1, - bh + _body._y1));
//_prerender_sprite.setOffset(OoVector2(_body._x1 - bw, _body._y1 - bh));
//_prerender_sprite.setSize(OoVector2(bw, bh));

  _prerender = true;
  return true;
}

*/
