// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "oo_ios_draw_text.h"
#import "oo_ios_utility.h"

bool OoIosDrawText::create(OoImage *image, const string &text, const string &font_name, float font_size, bool bold, int draw_position, int width, int height) {
  UIFont *font;
  if(font_name == ""){
    font = (bold) ? [UIFont boldSystemFontOfSize:font_size] : [UIFont systemFontOfSize:font_size];
  }else{
    font = [UIFont fontWithName:oo::NSStringMake(font_name) size:font_size];
  }

  NSMutableParagraphStyle *style = [[NSMutableParagraphStyle alloc] init];
  style.lineBreakMode = NSLineBreakByWordWrapping;
  if((draw_position == 1) || (draw_position == 4) || (draw_position == 7)) style.alignment = NSTextAlignmentLeft;
  if((draw_position == 2) || (draw_position == 5) || (draw_position == 8)) style.alignment = NSTextAlignmentCenter;
  if((draw_position == 3) || (draw_position == 6) || (draw_position == 9)) style.alignment = NSTextAlignmentRight;

  NSDictionary *attributes = @{ NSForegroundColorAttributeName : [UIColor whiteColor], NSFontAttributeName : font, NSParagraphStyleAttributeName : style };

  NSString *str = [NSString stringWithUTF8String:text.c_str()];

  // 描画サイズの取得
  CGRect rect = [str boundingRectWithSize:CGSizeMake(width, height) options:NSStringDrawingUsesLineFragmentOrigin attributes:attributes context:nil];
  int inner_width  = ceil(rect.size.width);
  int inner_height = ceil(rect.size.height);

  float x = 0;
  float y = 0;
  if(draw_position == 0){
    width  = inner_width;
    height = inner_height;
  }else{
    // if((draw_position == 1) || (draw_position == 4) || (draw_position == 7)) x = 0;
    if((draw_position == 2) || (draw_position == 5) || (draw_position == 8)) x = (width - inner_width) * 0.5f;
    if((draw_position == 3) || (draw_position == 6) || (draw_position == 9)) x =  width - inner_width;
    // if((draw_position == 1) || (draw_position == 2) || (draw_position == 3)) y = 0;
    if((draw_position == 4) || (draw_position == 5) || (draw_position == 6)) y = (height - inner_height) * 0.5f;
    if((draw_position == 7) || (draw_position == 8) || (draw_position == 9)) y =  height - inner_height;
  }

  image->createWithSize(width, height);

  CGColorSpaceRef color_space = CGColorSpaceCreateDeviceRGB();
  CGContextRef bitmap_context = CGBitmapContextCreate(image->_pixel_buffer, width, height, 8, width * 4, color_space, kCGImageAlphaPremultipliedLast);
  CGColorSpaceRelease(color_space);

  CGContextTranslateCTM(bitmap_context, 0, height);
  CGContextScaleCTM(bitmap_context, 1.0, -1.0);

  UIGraphicsPushContext(bitmap_context);

  [str drawInRect:CGRectMake(x, y, inner_width, inner_height) withAttributes:attributes];

  UIGraphicsPopContext();
  CGContextRelease(bitmap_context);

  return true;
}

