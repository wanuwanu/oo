// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <OpenGLES/ES2/gl.h>
#import "oo_std.h"
#import "oo_image.h"
#import "oo_memory_stream.h"
#import "oo_ios_utility.h"
#import "oo_ios_utility_cc.h"

namespace oo {

  string getDocumentsPath() {
    return stringMake(oo::getDocumentsPathNS());
  }

  string getDocumentsFilePath(string filename) {
    return stringMake(oo::getDocumentsFilePathNS(filename));
  }

  string getResourcePath() {
    return stringMake(oo::getResourcePathNS());
  }

  string getResourceFilePath(string filename) {
    return stringMake(oo::getResourceFilePathNS(filename));
  }

  string getDeviceName() {
    return stringMake([UIDevice currentDevice].name);
  }

  vector<string> getDocumentFiles() {
    vector<string> file_list;
    NSFileManager *fm = [NSFileManager defaultManager];
    for (NSString *filename in [fm contentsOfDirectoryAtPath:(oo::getDocumentsPathNS()) error:nil]){
      file_list.push_back([filename UTF8String]);
    }
    return file_list;
  }

  bool loadData(string path, OoMemoryStream *stream) {
    NSData *data = [NSData dataWithContentsOfFile:NSStringMake(path)];
    if(data == nil) return false;
    uint8 *buffer = (uint8 *)[data bytes];
    sint64 size = (sint64)[data length];
    stream->createFromMemory(buffer, size);
    return true;
  }

  bool loadResourceData(string filename, OoMemoryStream *stream) {
    return loadData(oo::getResourceFilePath(filename), stream);
  }


  bool loadDocumentsData(string filename, OoMemoryStream *stream) {
    return loadData(oo::getDocumentsFilePath(filename), stream);
  }

  bool saveData(string path, OoMemoryStream *stream) {
    void *buffer = stream->getBuffer();
    uint32 size  = (uint32)stream->getDataSize();
    NSData *data = [NSData dataWithBytes:buffer length:size];
    if([data writeToFile:NSStringMake(path) atomically:YES]) return true;
    return false;
  }

  bool saveResourceData(string filename, OoMemoryStream *stream) {
    return saveData(oo::getResourceFilePath(filename), stream);
  }

  bool saveDocumentsData(string filename, OoMemoryStream *stream) {
    return saveData(oo::getDocumentsFilePath(filename), stream);
  }

  void iosLog(string log_text) {
    NSLog(@"%@", NSStringMake(log_text));
  }

  bool checkGlError(string text) {
#ifdef OO_ENV_OPENGL
    GLenum error_code = glGetError();
    if(error_code == 0) return false;
    string t = "[ " + oo::strPrintf("GL Error : %d : ", error_code) + text + " ]";
    iosLog(t);
#endif
    return true;
  }

  string getDateTimeText(string format) {
    // ex. "yyyy/MM/dd HH:mm:ss"
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.calendar = [[NSCalendar alloc] initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
    formatter.locale   = [NSLocale systemLocale];
    formatter.timeZone = [NSTimeZone systemTimeZone];
    [formatter setDateFormat:NSStringMake(format)];
    NSString *text = [formatter stringFromDate:[NSDate date]];
    return [text UTF8String];
  }

  unique_ptr<OoImage> createOoImageFromFile(const string &path_name) {
    UIImage *ui_image = [UIImage imageWithContentsOfFile:NSStringMake(path_name)];
    if(ui_image) return createOoImageFromUIImage(ui_image);

    NSLog(@"load error : %@", NSStringMake(path_name));
    return unique_ptr<OoImage>();
  }

  bool savePngFromOoImage(string filename, OoImage *image) {
    NSString *path = oo::getDocumentsFilePathNS(NSStringMake(filename));
    UIImage *ui_image = oo::getUIImageFromOoImage(image);
    NSData *data = UIImagePNGRepresentation(ui_image);
    if([data writeToFile:path atomically:YES]) return true;
    return false;
  }

  bool savePngFromOoImage(OoImage *image) {
    UIImage *ui_image = oo::getUIImageFromOoImage(image);
    NSData *data = UIImagePNGRepresentation(ui_image);
    string date_text = getDateTimeText("yyyyMMddHHmmss");
    string filename = "ss" + date_text + ".png";
    NSString *path = [NSString stringWithUTF8String:getDocumentsPath().c_str()];
    NSString *file = [NSString stringWithUTF8String:filename.c_str()];
    path = [path stringByAppendingPathComponent:file];
    [data writeToFile:path atomically:YES];
    return true;
  }

  void messageBox(string title, string message) {
    UIViewController *vc = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:NSStringMake(title)
                                                                   message:NSStringMake(message)
                                                            preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil]];
    [vc presentViewController:alert animated:YES completion:nil];
  }

} // namespace oo

