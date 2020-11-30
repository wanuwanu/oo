// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_std.h"

namespace oo {

  inline uint32 alphaBlend(uint32 dst_color, uint32 src_color) {
    uint32 sa = src_color >> 24;
    uint32 da = dst_color >> 24;
    uint32 a = (sa * 255 + da * (255 - sa));
    if (a == 0) return 0;

    uint32 pixel;
    uint8 *b = (uint8 *)&pixel;
    uint8 *s = (uint8 *)&src_color;
    uint8 *d = (uint8 *)&dst_color;
    for (int i = 0; i < 3; i++) *(b + i) = ((uint32)*(s + i) * sa * 255 + (uint32)*(d + i) * da * (255 - sa)) / a;
    *(b + 3) = a / 255;
    return pixel;
  }

  inline void splitRGBA(int &r, int &g, int &b, int &a, uint32 pixel) {
    r = (pixel      ) & 0xff;
    g = (pixel >>  8) & 0xff;
    b = (pixel >> 16) & 0xff;
    a = (pixel >> 24) & 0xff;
  }

  inline uint32 mergeRGBA(int r, int g, int b, int a) {
    return (((uint32)a & 0xff) << 24) | (((uint32)b & 0xff) << 16) | (((uint32)g & 0xff) << 8) | ((uint32)r & 0xff);
  }

} // namespace oo
