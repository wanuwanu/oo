#pragma once

class OoGameFrame{
public:
  OoGameFrame(){}
  virtual ~OoGameFrame(){}
public:
  virtual void init(){}
  virtual void update(){}
  virtual void render(){}
};

