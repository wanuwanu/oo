// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var app = app || {};

//int gray = static_cast<int>(0.29900 * r + 0.58700 * g + 0.11400 * b + 0.5);

app.shared_iamge = null;

app.pixel_over_light_to_color = true;
app.light_image_type = 0;

app.makeColor = function (color_pixel, i) {
  var k = [0.299, 0.587, 0.114];
  var c = [0, 0, 0];
  c[0] = color_pixel[0] * i;
  c[1] = color_pixel[1] * i;
  c[2] = color_pixel[2] * i;

  if (app.pixel_over_light_to_color) {
    while (true) {
      var light = 0;
      var num_c = 0;
      var weight = 0;
      for (let i = 0; i < 3; i++) {
        if (c[i] > 255) {
          light += (c[i] - 255) * k[i];
          c[i] = 255;
        }
        if (c[i] < 255) {
          weight += k[i];
          num_c++;
        }
      }
      if (light === 0 || num_c === 0) break;
      var a = light / weight;
      for (let i = 0; i < 3; i++) {
        if (c[i] < 255) c[i] += a;
      }
    }
  }
  return [c[0], c[1], c[2], color_pixel[3]];
};


app.createLightSpotImage = function ($, rsp, img_width, img_height) {
  rsp.createWithSize(img_width, img_height);
  var r = $('#color_r').value * 1;
  var g = $('#color_g').value * 1;
  var b = $('#color_b').value * 1;
  var a = 255;
  var intensity = $('#intensity').value * 1;
  var pow = $('#power').value * 1;
  var sz = $('#size').value * 1;
  var sigma = $('#sigma').value * 1;

  if (app.light_image_type === 0) {
    oo.generateLightSpot(img_width, img_height, sz / 2, pow, true, (x, y, value) => {
      rsp.setPixel(x, y, app.makeColor([r, g, b, a], intensity * value));
    });
  }
  if (app.light_image_type === 1) {
    oo.generateGaussianDistribution(img_width, img_height, sz / 2, sigma, true, (x, y, value) => {
      rsp.setPixel(x, y, app.makeColor([r, g, b, a], intensity * value));
    });
  }

  rsp.updateCanvas();
  rsp.position.set(img_width / 2, img_height / 2);
};

oo.main(() => {

  var $ = oo.$;

  // UI作成
  var opt = {
    label_style: { width: '80px' },
    func: () => { update(); }
  };

  $(document.body, $('div', 
    $('label', 'テクスチャサイズ'),
    oo.htmlTextboxSlider('width', 'width', 256, 1, 1024, 1, opt),
    oo.htmlTextboxSlider('height', 'height', 256, 1, 1024, 1, opt)
  ));
  $(document.body, $('br'));

  // 要素追加ボタン
  // $(document.body, 'div', { tag: 'input', id: 'append', type: 'button', value: '要素の追加' });
  // $(document.body, 'br');

  $(document.body, $('div', 
    $('label', '光源の色'),
    oo.htmlTextboxSlider('color_r', 'R', 0, 0, 255, 1, opt),
    oo.htmlTextboxSlider('color_g', 'G', 128, 0, 255, 1, opt),
    oo.htmlTextboxSlider('color_b', 'B', 255, 0, 255, 1, opt),
    $('label', ''),
    oo.htmlTextboxSlider('intensity', '強度', 10, 0, 200, 1, opt),
    oo.htmlTextboxSlider('size', '対象範囲', 64, 1, 1024, 1, opt),
    oo.htmlCheckbox('checkbox_over', 'RGB余剰分を他の成分に分散', true, null),
    oo.htmlRadio('radio_dist0', '距離減衰', 'dist', 0, true, null),
    oo.htmlTextboxSlider('power', 'power', 1, 0, 3, 0.1, opt),
    oo.htmlRadio('radio_dist1', 'ガウス分布', 'dist', 1, false, null),
    oo.htmlTextboxSlider('sigma', 'σ', 1, 1, 10, 0.1, opt)
  ));
  $(document.body, $('br'));

  $(document.body, $('div', 
    $({ tag: 'label' }, '保存画像ファイル名'),
    $({ tag: 'input', id: 'save_filename', type: 'text' }),
    $({ tag: 'input', id: 'save', type: 'button', value: '保存' })
  ));
  $(document.body, $('br'));
  // キャンバス
  $(document.body, { tag: 'canvas', id: 'canvas' });
  $('#canvas').style.background = '#000';
  // UI作成ここまで

  // メイン
  var rsp = new OoRenderSprite();
  var img_width = 256;
  var img_height = 256;
  $('#width').value = img_width;
  $('#height').value = img_height;
  // UI動作定義
  $('#width').onchange = () => { update(); };
  $('#height').onchange = () => { update(); };
  $('#checkbox_over').onchange = () => {
    app.pixel_over_light_to_color = $('#checkbox_over').checked;
    update();
  };
  $('#radio_dist0').onchange = () => {
    var radios = document.getElementsByName('dist');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) app.light_image_type = radios[i].value * 1;
    }
    update();
  };
  $('#radio_dist1').onchange = () => {
    var radios = document.getElementsByName('dist');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) app.light_image_type = radios[i].value * 1;
    }
    update();
  };
  // 保存
  $('#save').onclick = () => {
    let filename = $('#save_filename').value;
    if (filename === '') filename = 'output_image.png';
    const link = document.createElement('a');
    link.href = $('#canvas').toDataURL('image/png');
    link.download = filename;
    link.click();
  };

  // キャンバス更新
  var update = () => {
    var canvas = $('#canvas');
    var ctx = canvas.getContext('2d');

    img_width = $('#width').value;
    img_height = $('#height').value;

    canvas.width = img_width;
    canvas.height = img_height;
    ctx.clearRect(0, 0, img_width, img_height);

    app.createLightSpotImage($, rsp, img_width, img_height);
    rsp.draw(ctx);

    // 外部連携
    app.shared_iamge = rsp.image;
  };

  update();
});
