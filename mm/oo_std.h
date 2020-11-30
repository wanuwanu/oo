// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#pragma once
#include <functional>
#include <vector>
#include <string>
#include <map>
#include <memory>

using std::vector;
using std::string;
using std::wstring;
using std::map;
using std::unique_ptr;
using std::shared_ptr;
using std::weak_ptr;
using std::make_unique;
using std::make_shared;

#include "oo_environment.h"
#include "oo_template.h"
#include "oo_non_copyable.h"
//#include "oo_utility.h"
//#include "oo_settings.h"

#ifdef OO_ENV_IOS
#import "oo_ios_utility.h"
#endif

