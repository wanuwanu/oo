// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once

#pragma once
#include "oo_std.h"
#include "oo_image.h"

class OoTextImageDecoration {
public:
  int      _width = 0;
  uint32   _color = 0;
  OoImage *_image = nullptr;
};

class OoTextImage : public OoImage {
  using base = OoImage;
protected:
  float      _font_size;
  string     _font_name = "";
  string     _text;
  vector<OoTextImageDecoration> _decoration;
  bool       _created;

  bool _bold = false;
  int _max_width  = 4096;
  int _max_height = 4096;
  int _draw_position = 0; // trim

  bool _major_decoration_f  = false;
  bool _major_decoration_g  = false;
  bool _major_decoration_i  = false;
  bool _major_decoration_e1 = false;
  bool _major_decoration_e2 = false;
  uint32 _text_color        = 0;
  uint32 _text_color_top    = 0;
  uint32 _text_color_bottom = 0;
  OoImage *_text_color_image = nullptr;
  uint32 _edge1_color = 0;
  int    _edge1_size  = 0;
  uint32 _edge2_color = 0;
  int    _edge2_size  = 0;
protected:
  virtual void expand(vector<vector<uint8>> &alpha, int d);
  virtual bool create();
  virtual bool drawBlendImage(OoImage *dst, vector<vector<uint8>> &text_alpha, uint32 color, OoImage *src_image);
  virtual int getTotalEdgeSize();
public:
  OoTextImage() { init(); }
  virtual ~OoTextImage() { free(); }
public:
  virtual void free() { OoImage::free(); }
  virtual void init() {
    _created       = false;
    _font_size     = 32;
    _font_name     = "";
    _text          = "";
    _decoration.clear();
    _major_decoration_f  = false;
    _major_decoration_g  = false;
    _major_decoration_i  = false;
    _major_decoration_e1 = false;
    _major_decoration_e2 = false;
  }

  virtual bool createWithText(string text);

  virtual bool setText(string text);
  virtual void setFont(string font_name){_font_name = font_name;}
  virtual void setFontSize(float font_size){_font_size = font_size;}
  virtual void setFontBold(bool bold){_bold = bold;}
  virtual void setMaxSize(int max_width, int max_height){_max_width = max_width; _max_height = max_height;}
  // draw_position = 0 trim
  // 1 2 3  ex 1    top left
  // 4 5 6  ex 5 middle center
  // 7 8 9
  virtual void setDrawPosition(int draw_position){_draw_position = draw_position;}

  // major decoration
  virtual void setDecorationTextF(uint32 text_color);                               // fill color
  virtual void setDecorationTextG(uint32 text_color_top, uint32 text_color_bottom); // gradation
  virtual void setDecorationTextI(OoImage *text_color_image);                      // image
  virtual void setDecorationEdge1(uint32 edge_color, int edge_size);
  virtual void setDecorationEdge2(uint32 edge_color, int edge_size);

  // create text image with decoration parameter
  // src_text_image image before decoration
  virtual bool decorate(OoImage *src_text_image);

  // initialize decoration parameter for text image
  virtual void clearDecoration();

  // set decoration parameter for text image
  //   level : 0 is top, large number is low position
  //   width : hemming width
  //   color : base color
  //   image : base image(specify color by image; when the image is null, all pixels are 0xffffffff.)
  //  The actual drawing color is a color that multiplied 'color' and 'image'.
  virtual void setDecoration(int level, int width, uint32 color, OoImage *image);
  // ex.
  // orange color text, hemming 2 pixels
  // OoTextImage img;
  // img.setFontSize(64);
  // img.setDecoration(0, 0, 0xffffcc00, null);
  // img.setDecoration(1, 2, 0xff000000, null);
  // img.createWithText("ABCDEF");
  //
  // hemming 2 pixels, inside transparent
  // OoTextImage img;
  // img.setFontSize(64);
  // img.setDecoration(0, 0, 0x00000000, null);
  // img.setDecoration(1, 2, 0xff000000, null);
  // img.createWithText("ABCDEF");
  //
  // hemming 2 pixels, inside gradation
  // OoTextImage img;
  // img.setFontSize(64);
  // img.createWithText("ABCDEF");
  // OoImage img2;
  // img2.createWithSize(img.getWidth() + 4, img.getHeight() + 4, 32);
  // img2.fillWithColor4(0xffffff00, 0xffffff00, 0xffff8800, 0xffff8800);
  // OoTextImage img3;
  // img3.setDecoration(0, 0, 0xffffffff, &img2);
  // img3.setDecoration(1, 2, 0xff000000, null);
  // img3.decorate(&img);
};

