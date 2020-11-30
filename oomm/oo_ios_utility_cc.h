// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#import "oo_std.h"

class OoImage;
class OoMemoryStream;

namespace oo {

  string getDocumentsPath();
  string getDocumentsFilePath(string filename);

  string getResourcePath();
  string getResourceFilePath(string filename);

  string getDeviceName();

  vector<string> getDocumentFiles();

  bool loadData(string path, OoMemoryStream *stream);
  bool loadResourceData(string filename, OoMemoryStream *stream);
  bool loadDocumentsData(string filename, OoMemoryStream *stream);
  bool saveData(string path, OoMemoryStream *stream);
  bool saveResourceData(string filename, OoMemoryStream *stream);
  bool saveDocumentsData(string filename, OoMemoryStream *stream);

  void iosLog(string log_text);
  bool checkGlError(string text);
  string getDateTimeText(string format);

  unique_ptr<OoImage> createOoImageFromFile(const string &path_name);
  bool savePngFromOoImage(string filename, OoImage *image);
  bool savePngFromOoImage(OoImage *image);

  void messageBox(string title, string message);

} // namespace oo

