// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_std.h"
#include <sys/stat.h>

namespace oo {

  inline FILE *fopen(const string &filename, const char *mode) {
    FILE *f = nullptr;
#ifdef OO_ENV_WINDOWS
    ::fopen_s(&f, filename.c_str(), mode);
#else
    f = ::fopen(filename.c_str(), mode);
#endif
    return f;
  }

  inline sint64 getFileSize(FILE *f) {
    struct stat stat_buffer;
#ifdef OO_ENV_WINDOWS
    ::fstat(_fileno(f), &stat_buffer);
#else
    ::fstat(fileno(f), &stat_buffer);
#endif
    return stat_buffer.st_size;
  }

  inline string addPath(const string& path_high, const string& path_low) {
    if(path_high == "") return path_low;
    if(path_low  == "") return path_high;
    // for root
    int pos = (int)path_high.size() - 1;
    int pos1 = oo::StrChrSearchLast(path_high.c_str(), '/');
    int pos2 = oo::StrChrSearchLast(path_high.c_str(), ':');
    string path = path_high + "/" + path_low;
    if(pos1 == pos || pos2 == pos) path = path_high + path_low;
    return path;
  }

  inline string getFileExtension(const string& path_name) {
    int pos = oo::StrChrSearchLast(path_name.c_str(), '/');
    string file_name = path_name.substr(pos + 1, string::npos);
    pos = oo::StrChrSearchLast(file_name.c_str(), '.');
    if(pos == -1) return "";
    string extension = file_name.substr(pos + 1, string::npos);
    return extension;
  }

  inline string getFileExtensionLower(const string& path_name) {
    string extension = oo::getFileExtension(path_name);
    string extension_lower = oo::strToLower(extension);
    return extension_lower;
  }

  inline string getFileName(const string& path_name) {
    int pos = oo::StrChrSearchLast(path_name.c_str(), '/');
    string file_name = path_name.substr(pos + 1, string::npos);
    return file_name;
  }

  inline string getFileNameNonExtension(const string& path_name) {
    string file_name = oo::getFileName(path_name);
    int pos = oo::StrChrSearchLast(file_name.c_str(), '.');
    // erase extension
    if(pos != -1) file_name.erase(pos);
    return file_name;
  }

  inline string getPathNameNonExtension(const string& path_name) {
    string path_non_extension = path_name;
    int pos  = oo::StrChrSearchLast(path_name.c_str(), '/');
    int pos2 = oo::StrChrSearchLast(path_name.c_str() + pos + 1, '.');
    // erase extension
    if(pos2 != -1) path_non_extension.erase(pos + 1 + pos2);
    return path_non_extension;
  }

  inline string getFolderName(const string& path_name) {
    string folder = path_name;
    int pos = oo::StrChrSearchLast(folder.c_str(), '/');
    if(pos != -1){
      folder.erase(pos);
      // for root
      pos = (int)folder.size() - 1;
      int pos1 = oo::StrChrSearchLast(folder.c_str(), ':');
      if(pos1 == pos) folder += "/";
    }else{
      folder = "";
    }
    return folder;
  }

  inline string getDriveName(const string& path_name) {
    string drive = "";
    int pos = oo::StrChrSearchLast(path_name.c_str(), ':');
    if(pos != -1){
      drive = path_name;
      drive.erase(pos);
    }
    return drive;
  }

  inline bool cmpExtension(const string& path_name, const string& extension) {
    string file_extension = getFileExtension(path_name);
    if (extension.size() != file_extension.size()) return false;
    for (unsigned int i = 0; i < extension.size(); i++) {
      if (toupper(*(extension.c_str() + i)) != toupper(*(file_extension.c_str() + i))) return false;
    }
    return true;
  }

} // namespace oo

