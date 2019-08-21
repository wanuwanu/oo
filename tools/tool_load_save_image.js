// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.main(() => {
  // 画像の読み込みと保存のテンプレ
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
    $({ tag: 'label' }, '保存画像ファイル名'),
    $({ tag: 'input', id: 'save_filename', type: 'text' }),
    $({ tag: 'input', id: 'save', type: 'button', value: '保存' })
  ));
  $(document.body, $('br'));
  // キャンバス
  $(document.body, { tag: 'canvas', id: 'canvas' });
  $('#canvas').style.background = '#000';
  // UI作成終わり

  // メイン
  let target_image = null;
  // キャンバス更新
  const update = () => {
    // キャンバスサイズを変更
    $('#canvas').width = target_image ? target_image.width : 0;
    $('#canvas').height = target_image ? target_image.height : 0;
    // 画像を描画
    const context = $('#canvas').getContext('2d');
    if (target_image) context.drawImage(target_image, 0, 0);
  };
  // 読み込み
  $('#load').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      target_image = new Image();
      target_image.src = reader.result;
      target_image.onload = () => { update(); };
    };
    reader.readAsDataURL(e.target.files[0]);
  };
  // クリア
  $('#clear').onclick = () => {
    target_image = null;
    $('#load').value = '';
    update();
  };
  // 保存
  $('#save').onclick = () => {
    if (!target_image) return;
    let filename = $('#save_filename').value;
    if (filename === '') filename = 'output_image.png';
    const link = document.createElement('a');
    link.href = $('#canvas').toDataURL('image/png');
    link.download = filename;
    link.click();
  };
});

