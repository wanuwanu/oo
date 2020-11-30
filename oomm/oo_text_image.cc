// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#include "oo_text_image.h"

#ifdef OO_ENV_IOS
#include "oo_ios_draw_text.h"
#endif
#ifdef OO_ENV_WINDOWS
#include <oo_win_draw_text.h>
#endif

int OoTextImage::getTotalEdgeSize() {
  int edge_size = 0;
  for(auto &x : _decoration) edge_size += x._width * 2;

  if(_major_decoration_f || _major_decoration_g || _major_decoration_i || _major_decoration_e1 || _major_decoration_e2){
    edge_size = (_edge1_size + _edge2_size) * 2;
  }
  return edge_size;
}

bool OoTextImage::create() {
#ifdef OO_ENV_IOS
  OoIosDrawText draw_text;
#endif
#ifdef OO_ENV_WINDOWS
  OoWinDrawText draw_text;
#endif

  OoImage image;
  int edge_size = getTotalEdgeSize();

  draw_text.create(&image, _text, _font_name, _font_size, _bold, _draw_position, _max_width - edge_size, _max_height - edge_size);

  decorate(&image);
  _created = true;

  return true;
}

void OoTextImage::expand(vector<vector<uint8>> &alpha, int d) {
  auto tmp = alpha;

  int height = (int)alpha.size();
  int width  = (int)alpha[0].size();
  int r2 = d * d;

  auto get_max_alpha = [&](int cx, int cy, int d){
    // ピクセル単位で最大値を取得
    int x0 = oo::max2(0,          cx - d);
    int y0 = oo::max2(0,          cy - d);
    int x1 = oo::min2(width  - 1, cx + d);
    int y1 = oo::min2(height - 1, cy + d);
    int max_a = 0; // 円内
    int max_b = 0; // 円外
    for(int y = y0; y <= y1; y++){
      for(int x = x0; x <= x1; x++){
        int a = tmp[y][x];
        if(a == 0) continue;
        if(oo::pow2(x - cx) + oo::pow2(y - cy) < r2){
          if(a == 255) return 255;
          max_a = oo::max2(max_a, a);
        }
        max_b = oo::max2(max_b, a);
      }
    }
    if(max_a >= max_b) return max_a;

    // 円周上での最大値を取得

    // 実数座標でのピクセル
    auto get_alpha = [&](float x, float y){
      float xn, yn;
      float xf = modff(x, &xn);
      float yf = modff(y, &yn);
      if(xn < 0 || yn < 0 || xn >= width - 1 || yn >= height - 1) return 0;
      float a = 0.0f;
      a += tmp[yn + 0][xn + 0] * (1.0f - xf) * (1.0f - yf);
      a += tmp[yn + 0][xn + 1] * xf          * (1.0f - yf);
      a += tmp[yn + 1][xn + 0] * (1.0f - xf) * yf;
      a += tmp[yn + 1][xn + 1] * xf          * yf;
      return (int)a;
    };

    // 第一象限から第四象限まで展開
    auto get_alpha4 = [&](float x, float y){
      return oo::max4(get_alpha(cx - x, cy - y), get_alpha(cx - x, cy + y),
                      get_alpha(cx + x, cy - y), get_alpha(cx + x, cy + y));
    };

    // 1/4円弧 * 4
    for(int i = 0; i < d; i++){
      float x = i;
      float y = sqrtf(r2 - i * i);
      max_a = oo::max3(max_a, get_alpha4(x, y), get_alpha4(y, x));
    }

    // X字方向
    float s = sqrtf(r2 / 2);
    max_a = oo::max2(max_a, get_alpha4(s, s));

    return max_a;
  };

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      if(tmp[y][x] == 255) continue;
      alpha[y][x] = get_max_alpha(x, y, d);
    }
  }
}

bool OoTextImage::decorate(OoImage *src_text_image) {
  OoImage gradation_image;

  int edge_size = getTotalEdgeSize();
  int width  = src_text_image->_width  + edge_size;
  int height = src_text_image->_height + edge_size;

  if(_major_decoration_f || _major_decoration_g || _major_decoration_i || _major_decoration_e1 || _major_decoration_e2){
    _decoration.clear();
    uint32 color = 0xffffffff;
    OoImage *gradation = nullptr;
    if(_major_decoration_f) color = _text_color;
    if(_major_decoration_g){
      gradation_image.createWithSize(width, height);
      gradation_image.fillWithColor4(_text_color_top, _text_color_top, _text_color_bottom, _text_color_bottom);
      gradation = &gradation_image;
    }
    if(_major_decoration_i) gradation = _text_color_image;
    setDecoration(0, 0, color, gradation);
    if(_major_decoration_e1) setDecoration(1, _edge1_size, _edge1_color, nullptr);
    if(_major_decoration_e2) setDecoration(2, _edge2_size, _edge2_color, nullptr);
  }

  int num_decorations = (int)_decoration.size();

  if (num_decorations == 0) {
    OoImageBase::createFromImage(src_text_image);
    return true;
  }

  OoImage::createWithSize(width, height);

  int offset = edge_size / 2;

  for (int i = 0; i < num_decorations; i++) {
    // alphaを取り出して加工する
    vector<vector<uint8>> alpha(height);
    for(auto &x : alpha) x.resize(width, 0);

    auto src_width = src_text_image->_width;
    auto src_height = src_text_image->_height;
    for (int y = 0; y < src_height; y++) {
      for (int x = 0; x < src_width; x++) alpha[y + offset][x + offset] = (src_text_image->OoImageBase::getPixel(x, y) >> 24);
    }

    // 縁取り分広げる
    expand(alpha, edge_size / 2);

    int n = num_decorations - i - 1;
    drawBlendImage(this, alpha, _decoration[n]._color, _decoration[n]._image);
    edge_size -= _decoration[n]._width * 2;
  }

  return true;
}

inline uint32 getBlendColor(uint32 dst_color, int a, uint32 src_color) {
  int src_alpha =        a  * (src_color >> 24);
  int dst_alpha = (255 - a) * (dst_color >> 24);
  int sum_alpha = src_alpha + dst_alpha;

  uint32 blend_color = 0;
  uint8 *blend = (uint8 *)&blend_color;
  if (sum_alpha){
    uint8 *dst   = (uint8 *)&dst_color;
    uint8 *src   = (uint8 *)&src_color;
    for(int i = 0; i < 3; i++) *(blend + i) = ((uint32)*(dst + i) * dst_alpha + (uint32)*(src + i) * src_alpha) / sum_alpha;
  }
  *(blend + 3) = sum_alpha / 255;
  return blend_color;
}


bool OoTextImage::drawBlendImage(OoImage *dst, vector<vector<uint8>> &text_alpha, uint32 txt_color, OoImage *src_image) {
  int width  = dst->_width;
  int height = dst->_height;

  if(src_image == nullptr){
    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        uint32 src_color = txt_color;
        uint32 dst_color = dst->getPixel(x, y);
        dst->setPixel(x, y, getBlendColor(dst_color, text_alpha[y][x], src_color));
      }
    }
    return true;
  }

  if(txt_color == 0xffffffff){
    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        uint32 src_color = src_image->getPixel(x, y);
        uint32 dst_color = dst->getPixel(x, y);
        dst->setPixel(x, y, getBlendColor(dst_color, text_alpha[y][x], src_color));
      }
    }
    return true;
  }

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      uint32 src_color = src_image->getPixel(x, y);
      uint8 *src = (uint8 *)&src_color;
      uint8 *txt = (uint8 *)&txt_color;
      for(int i = 0; i < 4; i++) *(src + i) = (uint32)*(src + i) * (uint32)*(txt + i) / 255;
      uint32 dst_color = dst->getPixel(x, y);
      dst->setPixel(x, y, getBlendColor(dst_color, text_alpha[y][x], src_color));
    }
  }

  return true;
}

void OoTextImage::clearDecoration() {
  _decoration.clear();
  _major_decoration_f  = false;
  _major_decoration_g  = false;
  _major_decoration_i  = false;
  _major_decoration_e1 = false;
  _major_decoration_e2 = false;
}

void OoTextImage::setDecoration(int level, int width, uint32 color, OoImage *image) {
  int n = (int)_decoration.size();
  if (level >= n) _decoration.resize(level + 1);
  _decoration[level]._width = width;
  _decoration[level]._color = color;
  _decoration[level]._image = image;
}

bool OoTextImage::createWithText(string text) {
  _text = text;
  return create();
}

bool OoTextImage::setText(string text) {
  if (_text == text) return true;
  _text = text;
  if (_created == false) return true;
  return create();
}

void OoTextImage::setDecorationTextF(uint32 text_color) {
  _major_decoration_f = true;
  _text_color = text_color;
}

void OoTextImage::setDecorationTextG(uint32 text_color_top, uint32 text_color_bottom) {
  _major_decoration_g = true;
  _text_color_top    = text_color_top;
  _text_color_bottom = text_color_bottom;
}

void OoTextImage::setDecorationTextI(OoImage *text_color_image) {
  _major_decoration_i = true;
  _text_color_image   = text_color_image;
}

void OoTextImage::setDecorationEdge1(uint32 edge_color, int edge_size) {
  _major_decoration_e1 = true;
  _edge1_color = edge_color;
  _edge1_size  = edge_size;
}

void OoTextImage::setDecorationEdge2(uint32 edge_color, int edge_size) {
  _major_decoration_e2 = true;
  _edge2_color = edge_color;
  _edge2_size  = edge_size;
}

