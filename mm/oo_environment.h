#pragma once

#ifdef _WIN32
  // windows
  #define OO_ENV_WINDOWS
  #define OO_ENV_DIRECTX11
#endif

#ifdef __APPLE__
  // ios
  #define OO_ENV_IOS
  #define OO_ENV_OPENGL
  #define OO_ENV_METAL
#endif

#ifdef OO_ENV_WINDOWS
  #define _WINSOCKAPI_
  #define _CRT_SECURE_NO_WARNINGS
  #define fseeko _fseeki64
  #include <windows.h>
  #include <math.h>
#endif

#ifdef OO_ENV_IOS
  #include <stddef.h>
  #include <math.h>
  #include <string.h>
#endif

#ifdef OO_ENV_IOS
typedef __int8_t   sint8;
typedef __int16_t  sint16;
typedef __int32_t  sint32;
typedef __int64_t  sint64;
typedef __uint8_t  uint8;
typedef __uint16_t uint16;
typedef __uint32_t uint32;
typedef __uint64_t uint64;
typedef float      float32;
typedef double     float64;
#endif

#ifdef OO_ENV_WINDOWS
typedef   signed __int8    sint8;
typedef   signed __int16   sint16;
typedef   signed __int32   sint32;
typedef   signed __int64   sint64;
typedef unsigned __int8    uint8;
typedef unsigned __int16   uint16;
typedef unsigned __int32   uint32;
typedef unsigned __int64   uint64;
typedef float              float32;
typedef double             float64;
#endif

