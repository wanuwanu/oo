// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#import "oo_std.h"
#import "oo_image.h"

class OoIosDrawText {
public:
  OoIosDrawText() {}
  virtual ~OoIosDrawText() {}
public:
  virtual bool create(OoImage *image, const string &text, const string &font_name, float font_size, bool bold, int draw_position, int width, int height);
};

