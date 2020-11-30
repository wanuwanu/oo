// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#import <Foundation/Foundation.h>
#import "oo_std.h"

class OoImage;

namespace oo {

  NSString *NSStringMake(string str);
  string stringMake(NSString *nsstr);

  NSString *getDocumentsPath();
  NSString *getDocumentsFilePath(NSString *file);
  NSString *getDocumentsFilePath(const string &filename);

  NSString *getResourcePath();
  NSString *getResourceFilePath(NSString *file);
  NSString *getResourceFilePath(const string &filename);

  NSURL *getFileUrl(const string &path_name);

//  UIImage *getUIImageFromOoImage(OoImage *image);
//  UIImage *getUIImageFromUIView(UIView *view);
//  unique_ptr<OoImage> createOoImageFromUIImage(UIImage *ui_image);

  void messageBox(id vc, string title, string message);
  void messageBoxOk(id vc, string title, string message, void (^handler_ok)());
  void messageBoxOkCancel(id vc, string title, string message, void (^handler_ok)(), void (^handler_cancel)());

} // namespace oo
