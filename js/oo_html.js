// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

// option : {func, labal_style, textbox_style, slider_style}
oo.htmlTextboxSlider = function (id, name, value, min, max, step, option) {
  var div = document.createElement('div');
  var label = document.createElement('label');
  var text = document.createTextNode(name);
  var textbox = document.createElement('input');
  var slider = document.createElement('input');
  //
  var func = option ? option.func : null;
  // ラベル
  Object.assign(label.style, { textAlign: 'right', marginRight: '10px', width: '50px', float: 'left' });
  if (option && option.label_style) Object.assign(label.style, option.label_style);
  // テキストボックス
  Object.assign(textbox, { id, type: 'text', value });
  textbox.style.width = '50px';
  if (option && option.textbox_style) Object.assign(textbox.style, option.textbox_style);
  // スライダ
  Object.assign(slider, { id: id + '.range', type: 'range', min, max, step, value });
  slider.style.verticalAlign = 'middle';
  if (option && option.slider_style) Object.assign(slider.style, option.slider_style);
  // イベント対応
  textbox.oninput = () => {
    slider.value = textbox.value;
    func && func(textbox.value);
  };
  slider.oninput = () => {
    textbox.value = slider.value;
    func && func(slider.value);
  };
  label.appendChild(text);
  div.appendChild(label);
  div.appendChild(textbox);
  div.appendChild(slider);
  return div;
};

// option : {func, labal_style, checkbox_style}
oo.htmlCheckbox = function (id, text, checked, option) {
  var div = document.createElement('div');
  var label = document.createElement('label');
  var text_node = document.createTextNode(text);
  var checkbox = document.createElement('input');
  //
  var func = option ? option.func : null;
  // ラベル
  if (option && option.label_style) Object.assign(label.style, option.label_style);
  // チェックボックス
  if (option && option.checkbox_style) Object.assign(checkbox.style, option.checkbox_style);
  Object.assign(checkbox, { id, type: 'checkbox', checked: checked });
  checkbox.onchange = () => { func && func(checkbox.checked); };
  label.appendChild(checkbox);
  label.appendChild(text_node);
  div.appendChild(label);
  return div;
};

// option : {func, labal_style, radio_style}
oo.htmlRadio = function (id, text, name, value, checked, option) {
  var div = document.createElement('div');
  var label = document.createElement('label');
  var text_node = document.createTextNode(text);
  var radio = document.createElement('input');
  //
  var func = option ? option.func : null;
  // ラベル
  if (option && option.label_style) Object.assign(label.style, option.label_style);
  // チェックボックス
  if (option && option.radio_style) Object.assign(radio.style, option.radio_style);
  Object.assign(radio, { id, type: 'radio', name, value, checked });
  radio.onchange = () => { func && func(radio.value); };
  label.appendChild(radio);
  label.appendChild(text_node);
  div.appendChild(label);
  return div;
};

