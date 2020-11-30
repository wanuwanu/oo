// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once

class OoNonCopyable {
protected:
  OoNonCopyable() {}
private:
  OoNonCopyable(const OoNonCopyable&);            // non copyable
  OoNonCopyable& operator=(const OoNonCopyable&); // non copyable
};

