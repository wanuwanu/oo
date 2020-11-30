// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include <functional>
#include <vector>
#include "oo_environment.h"

namespace oo {

  template<class T1, class T2, class T3> inline void *memCopy(T1* dst, const T2* src, T3 n) {
    return memcpy(dst, src, static_cast<size_t>(n));
  }

  template<class T> inline void deletePtr(T &p) {
    if (p != nullptr) delete p;
    p = nullptr;
  }

  template<class T> inline void deleteArray(T &p) {
    if (p != nullptr) delete[] p;
    p = nullptr;
  }

  template<class T> inline void newArray(T* &p, sint64 n) {
    if (p != nullptr) delete[] p;
    p = nullptr;
    if (n > 0) p = new T[static_cast<size_t>(n)];
  }

  template<class T> inline void deletePtrVector(T &ap) {
    int n = (int)ap.size();
    for (int i = 0; i < n; i++) deletePtr(ap[i]);
  }

  template<class T> inline void deletePtrMapSecond(T &ap) {
    typename T::iterator p;
    for (p = ap.begin(); p != ap.end(); p++) deletePtr(p->second);
  }

  template<class T1, class T2> inline bool vectorFind(T1 &v, T2 &i) {
    for (auto &x : v) if (x == i) return true;
    return false;
  }

  template<class T1, class T2> inline bool mapFind(T1 &m, T2 &v) {
    if (m.find(v) != m.end()) return true;
    return false;
  }

  template<class T1, class T2> inline void mapOverwrite(T1 &m1, T2 &m2) {
    typename T1::iterator it;
    for (it = m2.begin(); it != m2.end(); it++) m1[it->first] = it->second;
  }

  template<class T> inline void zeroClear(T &v) {
    memset(&v, 0, sizeof(v));
  }

  template<class T> inline int numOf(T &v) {
    int n = sizeof(v) / sizeof(v[0]);
    return n;
  }

  template<class T> inline void flip(T &x) {
    x = !x;
  }

  template<class T> inline void swap(T &a, T &b) {
    T temp;
    temp = a, a = b, b = temp;
  }

  template<class T> inline T clamp(T x, T l, T h) {
    if (x < l) return l;
    if (x > h) return h;
    return x;
  }

  template<class T> inline T pow2(T x) {
    return x * x;
  }

#undef sign
  template<class T> inline T sign(T x) { return (x > 0) ? 1 : ((x < 0) ? -1 : 0); }

#undef abs
  template<class T> inline T abs(T a) { return (a >= 0) ? a : -a; }

  template<class T> inline T min2(T a, T b) { return (a < b) ? a : b; }
  template<class T> inline T max2(T a, T b) { return (a > b) ? a : b; }
  template<class T> inline T min3(T a, T b, T c) { return (a < b) ? min2(a, c) : min2(b, c); }
  template<class T> inline T max3(T a, T b, T c) { return (a > b) ? max2(a, c) : max2(b, c); }
  template<class T> inline T min4(T a, T b, T c, T d) { return min2(min2(a, b), min2(c, d)); }
  template<class T> inline T max4(T a, T b, T c, T d) { return max2(max2(a, b), max2(c, d)); }

  template<class T> inline T cmpget(bool b, T t, T f) { return b ? t : f; }

  // 最小値、最大値を同時に求める l = min4(a, b, c, d), g = max4(a, b, c, d);
  template<class T> inline void getMinMax4(T &l, T &g, T a, T b, T c, T d) {
    if (a < b) {
      l = a, g = b;
    } else {
      l = b, g = a;
    }
    if (c < d) {
      if (c < l) l = c;
      if (g < d) g = d;
    } else {
      if (d < l) l = d;
      if (g < c) g = c;
    }
  }


  template<class T> inline void getMinMax3(T &l, T &g, T a, T b, T c) {
    if (a < b) {
      l = a, g = b;
    } else {
      l = b, g = a;
    }
    if (c < l) l = c;
    if (g < c) g = c;
  }

  template<class T> inline void getMinMax2(T &l, T &g, T a, T b) {
    l = (a < b) ? a : b;
    g = (a > b) ? a : b;
  }

  // std::vectorは、clearでメモリを開放しないため作成
  template<class T> class auto_array {
  protected:
    sint64 _size = 0;
    T*     _ptr = nullptr;
  private:
    auto_array(const auto_array&);            // non copyable
    auto_array& operator=(const auto_array&); // non copyable
  public:
    ~auto_array() { clear(); }
    auto_array() {}
    auto_array(sint64 size) {
      _ptr = new T[(size_t)size]();
      _size = size;
    }
  public:
    void clear() {
      if (_ptr) delete[] _ptr;
      _size = 0;
      _ptr = nullptr;
    }
    void resize(sint64 size) {
      T* ptr = new T[(size_t)size]();
      if (_size) memcpy(ptr, _ptr, (size_t)min2(size, _size) * sizeof(T));
      clear();
      _size = size;
      _ptr = ptr;
    }
    T* data() const { return _ptr; }
    operator T*() const { return _ptr; }
    T& operator[](int i) { return _ptr[i]; }
  };

  // 2次元配列版
  template<class T> class auto_array_2d {
  protected:
    T*     _ptr = nullptr;
    sint64 _size_y = 0;
    sint64 _size_x = 0;
  private:
    auto_array_2d(const auto_array_2d&);            // non copyable
    auto_array_2d& operator=(const auto_array_2d&); // non copyable
  public:
    ~auto_array_2d() { clear(); }
    auto_array_2d() {}
    auto_array_2d(sint64 size_y, sint64 size_x) {
      sint64 size = size_y * size_x;
      _ptr = new T[(size_t)size]();
      _size_y = size_y;
      _size_x = size_x;
    }
  public:
    void clear() {
      if (_ptr) delete[] _ptr;
      _ptr = nullptr;
      _size_y = 0;
      _size_x = 0;
    }
    void resize(sint64 size_y, sint64 size_x) {
      sint64 size = size_y * size_x;
      T* ptr = new T[(size_t)size]();
      for (sint64 y = 0; y < min2(size_y, _size_y); y++) {
        memcpy(&ptr[y * size_x], &_ptr[y * _size_x], (size_t)min2(size_x, _size_x) * sizeof(T));
      }
      clear();
      _ptr = ptr;
      _size_y = size_y;
      _size_x = size_x;
    }
    T* data() const { return _ptr; }
    operator T*() const { return _ptr; }
    T* operator[](int i) { return &_ptr[i * _size_x]; }
    sint64 getWidth() { return _size_x; }
    sint64 getHeight() { return _size_y; }
  };

  // 3次元配列版
  template<class T> class auto_array_3d {
  protected:
    T*     _ptr = nullptr;
    sint64 _size_z = 0;
    sint64 _size_y = 0;
    sint64 _size_x = 0;
  private:
    auto_array_3d(const auto_array_3d&);            // non copyable
    auto_array_3d& operator=(const auto_array_3d&); // non copyable
  public:
    ~auto_array_3d() { clear(); }
    auto_array_3d() {}
    auto_array_3d(sint64 size_z, sint64 size_y, sint64 size_x) {
      sint64 size = size_z * size_y * size_x;
      _ptr = new T[(size_t)size]();
      _size_z = size_z;
      _size_y = size_y;
      _size_x = size_x;
    }
  public:
    void clear() {
      if (_ptr) delete[] _ptr;
      _ptr = nullptr;
      _size_z = 0;
      _size_y = 0;
      _size_x = 0;
    }
    void resize(sint64 size_z, sint64 size_y, sint64 size_x) {
      sint64 size = size_z * size_y * size_x;
      T* ptr = new T[(size_t)size]();
      for (sint64 z = 0; z < min2(size_z, _size_z); z++) {
        for (sint64 y = 0; y < min2(size_y, _size_y); y++) {
          memcpy(&ptr[z * size_y * size_x + y * size_x], &_ptr[z * _size_y * _size_x + y * _size_x], (size_t)min2(size_x, _size_x) * sizeof(T));
        }
      }
      clear();
      _ptr = ptr;
      _size_z = size_z;
      _size_y = size_y;
      _size_x = size_x;
    }
    T* data() const { return _ptr; }
    operator T*() const { return _ptr; }
    T& at(int x, int y, int z) { return _ptr[z * _size_y * _size_x + y * _size_x + x]; }
    sint64 getWidth() { return _size_x; }
    sint64 getHeight() { return _size_y; }
    sint64 getDepth() { return _size_z; }
  };

  template<class T> class switch_case_table {
  public:
    T _value;
    std::function<void()> _func;
  };

  template<class T> bool switch_case(const T &value, std::vector<switch_case_table<T>> &table) {
    bool result = false;
    for (auto &x : table) {
      if (value == x._value) {
        x._func();
        result = true;
      }
    }
    return result;
  }

} // namespace oo

