// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include "oo_std.h"
#include "oo_file_utility.h"
#include "oo_memory_stream.h"

class OoFile : public OoStream {
public:
  enum FileOpenMode{ kRead = 0, kWrite, kReadWrite, kCreate, kCreateReadWrite };
public:
  // for make full path
  static inline string s_default_directory = "";
  static string GetFullPath(const string& filename) {
    if(oo::StrChrSearch(filename.c_str(), ':') > 0) return filename;
    return oo::addPath(s_default_directory, filename);
  }
protected:
  FILE          *_file = nullptr;
  sint64         _file_size = 0;
  OoMemoryStream _load_memory_stream;
public:
  OoFile() {}
  virtual ~OoFile() { free(); }
public:
  virtual void free() {
    close();
    _load_memory_stream.free();
    _file_size = 0;
  }
  virtual void close() {
    if (_file != nullptr) ::fclose(_file);
    _file = nullptr;
  }
  virtual bool openWithMode(const string &filename, FileOpenMode open_mode) {
    string path = GetFullPath(filename);
    if (open_mode == FileOpenMode::kRead)            _file = oo::fopen(path.c_str(), "rb");
    if (open_mode == FileOpenMode::kReadWrite)       _file = oo::fopen(path.c_str(), "rb+");
    if (open_mode == FileOpenMode::kCreate)          _file = oo::fopen(path.c_str(), "wb");
    if (open_mode == FileOpenMode::kCreateReadWrite) _file = oo::fopen(path.c_str(), "wb+");
    if(_file == nullptr) return false;
    _file_size = getFileSize();
    if(_file_size > 0) _eos = false;
    return true;
  }
  virtual bool open(const string &filename) { return openWithMode(filename, OoFile::kRead); }
  virtual bool isEOF() { return _eos; }
  virtual bool load(const string &filename) {
    if (!open(filename)) return false;
    // create memory stream for load
    if(!_load_memory_stream.createFix(_file_size)) return false;
    sint64 actual_read = read(_load_memory_stream.getBuffer(), _file_size);
    close();
    if(actual_read != _file_size) return false;
    return true;
  }
  virtual FILE *getFileHandle() { return _file; }
  virtual OoMemoryStream *getLoadMemoryStream() { return &_load_memory_stream; }
  virtual uint8 *getBuffer() { return _load_memory_stream.getBuffer(); }
  virtual sint64 getFileSize() { return _file ? oo::getFileSize(_file) : 0; }
  // OoStream
  virtual sint64 getStreamSize() { return getFileSize(); }
  virtual sint64 getCurrentPosition() { return ::fseeko(_file, 0, SEEK_CUR); }
  virtual bool   setCurrentPosition(sint64 position) { return ::fseeko(_file, position, SEEK_SET) != -1; }
  virtual sint64 read(void *buffer, sint64 size) {
    sint64 actual_read = ::fread(buffer, 1, (size_t)size, _file);
    if (actual_read == 0) _eos = true;
    return actual_read;
  }
  virtual sint64 write(const void *buffer, sint64 size) { return ::fwrite(buffer, 1, (size_t)size, _file); }
};

