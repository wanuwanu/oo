// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include <initializer_list>
#include <map>
#include <vector>

template <class T> class OoIdDataMap : public std::map<std::string, T> {
public:
  OoIdDataMap(std::initializer_list<T> data) {
    for(auto &x : data) (*this)[x._id] = x;
  }
};

