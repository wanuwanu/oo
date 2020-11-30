// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "oo_std.h"
//#import "oo_image.h"
#import "oo_ios_utility.h"

namespace oo {

  NSString *NSStringMake(string str)
  {
    return [NSString stringWithUTF8String:str.c_str()];
  }

  string stringMake(NSString *nsstr)
  {
    if(nsstr == nil) return string("");
    return [nsstr UTF8String];
  }

  NSString *getDocumentsPath()
  {
    NSArray *document = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    return [document objectAtIndex:0];
  }

  NSString *getDocumentsFilePath(NSString *file)
  {
    return [getDocumentsPath() stringByAppendingPathComponent:file];
  }

  NSString *getDocumentsFilePath(const string &filename)
  {
    return getDocumentsFilePath(NSStringMake(filename));
  }

  NSString *getResourcePath()
  {
    return [[NSBundle mainBundle] resourcePath];
  }

  NSString *getResourceFilePath(NSString *file)
  {
    NSString *path = [[NSBundle mainBundle] pathForResource:file ofType:nil];
    if(path == nil){
      NSLog(@"path error : %@", file);
    }
    return path;
  }

  NSString *getResourceFilePath(const string &filename)
  {
    return getResourceFilePath(NSStringMake(filename));
  }

  NSURL *getFileUrl(const string &path_name)
  {
    return [[NSURL alloc] initFileURLWithPath:NSStringMake(path_name)];
  }
/*
  UIImage *getUIImageFromOoImage(OoImage *image)
  {
    int width     = image->getWidth();
    int height    = image->getHeight();
    uint8 *buffer = image->getPixelBuffer();
    int pitch     = image->getLinerPitch();

    CGColorSpaceRef color_space = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(buffer, width, height, 8, pitch, color_space, kCGImageAlphaPremultipliedLast);
    CGImageRef image_ref = CGBitmapContextCreateImage(context);

    UIImage *ui_image = [UIImage imageWithCGImage:image_ref];

    CGImageRelease(image_ref);
    CGContextRelease(context);
    CGColorSpaceRelease(color_space);

    return ui_image;
  }

  UIImage *getUIImageFromUIView(UIView *view)
  {
    UIImage *capture;

    UIGraphicsBeginImageContextWithOptions(view.bounds.size, NO, 0.0f);
    [view drawViewHierarchyInRect:view.bounds afterScreenUpdates:YES];
    capture = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return capture;
  }

  unique_ptr<OoImage> createOoImageFromUIImage(UIImage *ui_image)
  {
    CGImageRef cg_image = ui_image.CGImage;
    int width  = (int)CGImageGetWidth(cg_image);
    int height = (int)CGImageGetHeight(cg_image);

    vector<uint32> buffer(width * height);

    CGColorSpaceRef color_space = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(buffer.data(), width, height, 8, width * 4, color_space, kCGImageAlphaPremultipliedLast);
    CGContextDrawImage(context, CGRectMake(0, 0, width, height), cg_image);
    CGContextRelease(context);
    CGColorSpaceRelease(color_space);

    unique_ptr<OoImage> image;
    image = make_unique<OoImage>();
    image->createWithSizePixelBuffer(width, height, buffer.data());
    return image;
  }
*/
  void messageBox(id vc, string title, string message)
  {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:NSStringMake(title)
                                                                   message:NSStringMake(message)
                                                            preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil]];
    [vc presentViewController:alert animated:YES completion:nil];
  }

  void messageBoxOk(id vc, string title, string message, void (^handler_ok)())
  {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:NSStringMake(title)
                                                                   message:NSStringMake(message)
                                                            preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"OK"
                                              style:UIAlertActionStyleDefault
                                            handler:^(UIAlertAction *){
      if(handler_ok) handler_ok();
    }]];
    [vc presentViewController:alert animated:YES completion:nil];
  }

  void messageBoxOkCancel(id vc, string title, string message, void (^handler_ok)(), void (^handler_cancel)())
  {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:NSStringMake(title)
                                                                   message:NSStringMake(message)
                                                            preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"Cancel"
                                              style:UIAlertActionStyleDefault
                                            handler:^(UIAlertAction *){
      if(handler_cancel) handler_cancel();
    }]];
    [alert addAction:[UIAlertAction actionWithTitle:@"OK"
                                              style:UIAlertActionStyleDefault
                                            handler:^(UIAlertAction *){
      if(handler_ok) handler_ok();
    }]];
    [vc presentViewController:alert animated:YES completion:nil];
  }

} // namespace oo
