// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_sprite.h"
#include "oo_svg.h"
#include "oo_world_env.h"

class OoSvgSprite : public OoSprite {
public:
  shared_ptr<OoSvg> _svg;
public:
  virtual bool createFromFile(string filename){
    _svg = make_shared<OoSvg>();
    _svg->createFromFile(filename);
    _svg->_reverse.y = -1;

    float w = _svg->_region.getWidth();
    float h = _svg->_region.getHeight();
    float scale = 2;

    auto env = make_shared<OoWorldEnv>();
    env->createWorldUniform();
    env->_projection_matrix.setProjectionMatrixOrthoWithWHD(w, h, 1);
    env->updateWorldUniform();
    OoMetalRenderer::SetWorldEnv(env);

    auto texture = make_shared<OoTexture>();
    texture->createRenderTexture(w * scale, h * scale);
    texture->renderTargetScope([&](){
      _svg->draw();
    });
    create();
    _texture = texture;
    return true;
  }
};

