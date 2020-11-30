// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.main(() => {
  var $ = oo.$;

  // UI作成
  $(document.body, $('div',
    { tag: 'input', id: 'load', type: 'file', accept: 'image/*' }
  ));
  $(document.body, $('br'));
  $(document.body, $('div',
    { tag: 'input', id: 'clear', type: 'button', value: 'クリア' }
  ));
  $(document.body, $('br'));
  $(document.body, $('div', 
    $({ tag: 'label' }, 'σ値'),
    $({ tag: 'input', id: 'sigma', type: 'number', value: 1 })
  ));
  $(document.body, $('br'));
  $(document.body, $('div', 
    $('label', '保存画像ファイル名'),
    $({ tag: 'input', id: 'save_filename', type: 'text' }),
    $({ tag: 'input', id: 'save', type: 'button', value: '保存' })
  ));
  $(document.body, $('br'));
  // キャンバス
  $(document.body, { tag: 'canvas', id: 'canvas' });
  $('#canvas').style.background = '#000';

  let load_image = null;
  let save_image = null;
  let src = new oo.RenderSprite();
  let dst = new oo.RenderSprite();

  // キャンバス更新
  const update = () => {
    // フィルタ適用
    if (load_image) {
      let sigma = $('#sigma').value * 1;
      let w = load_image.width;
      let h = load_image.height;
      src.createFromImage(load_image);
      dst.createWithSize(w, h);
      oo.filterGaussian(dst, src, sigma);
      dst.updateCanvas();
      save_image = dst.image;
    }
    // キャンバスサイズを変更
    $('#canvas').width = save_image ? save_image.width : 0;
    $('#canvas').height = save_image ? save_image.height : 0;
    // 画像を描画
    const context = $('#canvas').getContext('2d');
    if (save_image) context.drawImage(save_image, 0, 0);
  };
  // 読み込み
  $('#load').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      load_image = new Image();
      load_image.src = reader.result;
      load_image.onload = () => { update(); };
    };
    reader.readAsDataURL(e.target.files[0]);
  };
  // クリア
  $('#clear').onclick = () => {
    load_image = null;
    save_image = null;
    $('#load').value = '';
    update();
  };
  // 保存
  $('#sigma').onchange = () => {
    update();
  };
  // 保存
  $('#save').onclick = () => {
    if (!save_image) return;
    let filename = $('#save_filename').value;
    if (filename === '') filename = 'output_image.png';
    const link = document.createElement('a');
    link.href = $('#canvas').toDataURL('image/png');
    link.download = filename;
    link.click();
  };
});
