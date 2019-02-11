// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.main(() => {
  var $ = oo.$();

  // デフォルトの設定
  var app = app || {};
  app.screen_width = 1080;
  app.screen_height = 1920;
  app.display_scale = 120; //(n/360で指定)
  app.filename = 'layout.json';

  // CSS
  var style = document.createElement('style');
  document.head.appendChild(style);
  var sheet = style.sheet;

  sheet.insertRule('#editor ul li {list-style: none;margin-left: -40px;padding: 2px;}', sheet.cssRules.length);
  sheet.insertRule('#editor ul {margin: 2px;}', sheet.cssRules.length);
  sheet.insertRule('#editor label {margin-right: 10px;width: 40px;float: left;}', sheet.cssRules.length);
  sheet.insertRule('div.cell1 {display: inline-block;vertical-align: top; }', sheet.cssRules.length);
  sheet.insertRule('div.cell2 {display: inline-block;width: 1000px;}', sheet.cssRules.length);

  var preview_style = {
    overflow: 'scroll',
    width: 'calc(400px - 16px)',
    height: 'calc(100vh - 16px)',
    display: 'inline-block',
    verticalAlign: 'top',
  };

  var editor_style = {
    position: 'absolute',
    display: 'inline-block',
    verticalAlign: 'top',
    margin: '6px',
    width: '1000px',
  };

  var panel_style = {
    display: 'inline-block',
    verticalAlign: 'bottom',
    margin: '2px',
  };

  var sub_panel_style = {
    display: 'inline-block',
    verticalAlign: 'top',
  };

  var cell_array_style = {
    position: 'absolute',
    left: '400px',
    top: '120px',
    overflow: 'scroll',
    width: 'calc(100vw - 400px - 8px)',
    height: 'calc(100vh - 130px)',
  };

  var cell_style = {
    background: 'linear-gradient(#fcfcfc, #eeeeee)',
    padding: '5px',
    marginTop: '5px',
    marginBottom: '5px',
    display: 'table',
    width: '1040px',
  };

  var cell_label_style = {
    marginLeft: '10px',
  };

  var cell_input_style = {
    margin: '2px',
    verticalAlign: 'middle',
  };

  // DOM構築
  // プレビュー画面
  $({ tag: 'div', id: 'preview', style: preview_style });

  $({ tag: 'canvas', id: 'canvas' });
  $('#canvas').style.background = '#000';

  $('#preview', $('#canvas'));
  $(document.body, $('#preview'));

  // 編集画面
  $({ tag: 'div', id: 'editor', style: editor_style });

  panel_style['background'] = 'linear-gradient(#ffffff, #ddeeff)';
  $({ tag: 'div', id: 'panel_1', style: panel_style });

  $('#panel_1', { tag: 'div', id: 'panel_1a', style: sub_panel_style }, 'div', '@表示画面サイズ');
  $('#panel_1a', { tag: 'ul', id: 'panel_1_ul' }, [
    $('li', [
      $('label', '@width'),
      { tag: 'input', id: 'd_width', style: { width: '80px' } }
    ]),
    $('li', [
      $('label', '@height'),
      { tag: 'input', id: 'd_height', style: { width: '80px' } }
    ])
  ]);

  $('#panel_1', { tag: 'div', id: 'panel_1b', style: sub_panel_style }, 'div', '@表示比率');
  $('#panel_1b', { tag: 'div', style: { margin: '2px', padding: '2px' } },
    { tag: 'select', id: 'scale_select', style: { padding: '2px' } });

  var scale_list = [
    ['45', '1/8倍'],
    ['90', '1/4倍(25%)'],
    ['120', '1/3倍'],
    ['180', '1/2倍(50%)'],
    ['360', '等倍(100%)'],
    ['720', '2倍(200%)'],
    ['1080', '3倍(300%)'],
    ['1140', '4倍(400%)'],
    ['2880', '8倍(800%)'],
  ];

  for (var i of scale_list) {
    $('#scale_select', { tag: 'option', id: 'scale_select_option' + i });
    var e = $('#scale_select_option' + i);
    if (i[0] === '360') e.selected = true;
    e.value = i[0];
    $(e, '@' + i[1]);
  }

  panel_style['background'] = 'linear-gradient(#ffffff, #ddffee)';
  $({ tag: 'div', id: 'panel_2', style: panel_style });
  $('#panel_2', 'div', '@仮想画面サイズ');
  $('#panel_2', { tag: 'ul', id: 'panel_2_ul' });
  $('#panel_2_ul', { tag: 'li', id: 'li_v_width' }, 'label', '@width');
  $('#panel_2_ul', { tag: 'li', id: 'li_v_height' }, 'label', '@height');
  $('#li_v_width', { tag: 'input', id: 'v_width', style: { width: '80px' } });
  $('#li_v_height', { tag: 'input', id: 'v_height', style: { width: '80px' } });

  panel_style['background'] = 'linear-gradient(#ffffff, #ffeedd)';
  $({ tag: 'div', id: 'panel_3', style: panel_style });
  $('#panel_3', 'div', '@ファイル');
  $('#panel_3', { tag: 'ul', id: 'panel_3_ul' });
  $('#panel_3_ul', 'li', { tag: 'input', property: { id: 'load', type: 'button', value: 'レイアウト読み込み' } });
  $('#panel_3_ul', 'li', { tag: 'input', property: { id: 'save', type: 'button', value: 'レイアウト書き出し' } });

  panel_style['background'] = 'linear-gradient(#ffffff, #ffddee)';
  $({ tag: 'div', id: 'panel_4', style: panel_style });
  $('#panel_4', 'div', '@設定');
  $('#panel_4', { tag: 'ul', id: 'panel_4_ul' });
  $('#panel_4_ul', { tag: 'li', id: 'li_layout_name' }, { tag: 'label', style: { width: '140px' } }, '@レイアウトファイル名');
  $('#panel_4_ul', { tag: 'li', id: 'li_image_base_path' }, { tag: 'label', style: { width: '140px' } }, '@画像ベースフォルダ');

  $('#li_layout_name', {
    tag: 'input',
    property: { id: 'layout_name', type: 'text' },
    style: { width: '250px' }
  });
  $('#li_image_base_path', {
    tag: 'input',
    property: { id: 'image_base_path', type: 'text' },
    style: { width: '250px' }
  });

  // 要素追加ボタン
  $({ tag: 'div', id: 'append_button_area' },
    { tag: 'div', style: { display: 'inline-block', margin: '5px', verticalAlign: 'middle' } },
    { tag: 'input', property: { id: 'append', type: 'button', value: '要素の追加' } }
  );

  $('#editor', '#panel_1');
  $('#editor', '#panel_2');
  $('#editor', '#panel_3');
  $('#editor', '#panel_4');
  $('#editor', '#append_button_area');
  $(document.body, '#editor');

  // 編集セルエリア
  $({ tag: 'div', id: 'cell_array', style: cell_array_style });
  $(document.body, '#cell_array');

  // DOM構築終わり

  var screen_width = app.screen_width;
  var screen_height = app.screen_height;
  var display_width = app.screen_width * app.display_scale / 360;
  var display_height = app.screen_height * app.display_scale / 360;

  var layout = new OoGameLayout();

  var num_cells = 0;
  var cell_map = new Map();

  // プレビュー画面更新
  var update = function () {
    var canvas = $('#canvas');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, screen_width, screen_height);

    layout.screen_width = screen_width;
    layout.screen_height = screen_height;
    layout.cells = [];
    for (var cell of cell_map.values()) layout.cells.push(cell);
    layout.updateCellMap();
    layout.updateCoordinate();
    layout.updateOrder();
    layout.draw(ctx);
  };

  // キャンバスサイズ更新
  var updateCanvasParam = function () {
    var canvas = $('#canvas');
    canvas.width = screen_width;
    canvas.height = screen_height;
    canvas.style.width = display_width + 'px';
    canvas.style.height = display_height + 'px';
  };

  // レイアウト読み込み
  var loadLayoutData = function (data) {
    layout = new OoGameLayout();
    num_cells = 0;
    cell_map = new Map();

    // Cellフォームの削除
    var element = $('#cell_array');
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    var obj = JSON.parse(data);

    for (var x of obj.cells) {
      $('#cell_array').appendChild(createCellForm(num_cells));
      var cell = new OoGameLayoutCell();
      Object.assign(cell, x);
      cell_map.set(num_cells, cell);
      updateForm(num_cells);
      num_cells++;
    }

    // display_width = obj.display_width;
    // display_height = obj.display_height;
    screen_width = obj.screen_width;
    screen_height = obj.screen_height;
    $('#image_base_path').value = obj.image_base_path;
    layout.image_base_path = obj.image_base_path;

    $('#v_width').value = screen_width;
    $('#v_height').value = screen_height;
    $('#scale_select').value = app.display_scale;
    var scale = app.display_scale;
    display_width = screen_width * scale / 360;
    display_height = screen_height * scale / 360;
    $('#d_width').value = display_width;
    $('#d_height').value = display_height;

    updateCanvasParam();

    oo.serial(function* () {
      for (var cell of cell_map.values()) {
        if (cell['image']) {
          const path_name = oo.addPath(layout.image_base_path, cell['image']);
          cell.img = yield oo.gnCreateImage(path_name);
        }
      }
    }, update);
  };

  // 入力リスナー
  var loadImageListener = (e) => {
    var cell_num = e.target.getAttribute('data-cell-id');
    var file = e.target.files[0];
    var reader = new FileReader();

    var cell = cell_map.get(parseInt(cell_num));
    cell['image'] = file.name;

    reader.onload = () => {
      cell.img = new Image();
      cell.img.src = reader.result;
      cell.img.onload = () => { update(); };
    };
    reader.readAsDataURL(file);
    updateForm(cell_num);
  };

  var inputListener = (e) => {
    var cell_num = e.target.getAttribute('data-cell-id');
    var cell = cell_map.get(parseInt(cell_num));
    var name = e.target.name;

    if (e.target.type === 'number') {
      if (e.target.name === 'alpha') {
        var v = parseFloat(e.target.value);
        if (Number.isFinite(v)) cell[name] = v;
      } else {
        var v = parseInt(e.target.value);
        if (Number.isInteger(v)) cell[name] = v;
      }
    } else {
      cell[name] = e.target.value;
    }

    updateForm(cell_num);
    update();
  };

  var checkboxListener = (e) => {
    var cell_num = e.target.getAttribute('data-cell-id');
    var cell = cell_map.get(parseInt(cell_num));
    var name = e.target.name;
    cell[name] = e.target.checked;
    update();
  };

  var colorListener = (e) => {
    var cell_num = e.target.getAttribute('data-cell-id');
    var cell = cell_map.get(parseInt(cell_num));
    cell['color'] = e.target.value;

    updateForm(cell_num);
    update();
  };

  var deleteListener = (e) => {
    var cell_num = e.target.getAttribute('data-cell-id');
    cell_map.delete(parseInt(cell_num));
    $('#cell_array').removeChild($('#cell-' + cell_num));
    update();
  };

  // 入力セルの更新
  var updateForm = function (cell_num) {
    var cell = cell_map.get(parseInt(cell_num));
    $('#cell-input-show-' + cell_num).checked = cell['show'];

    $('#cell-input-name-' + cell_num).value = cell['name'];
    $('#cell-input-parent-' + cell_num).value = cell['parent'];
    $('#cell-input-order-' + cell_num).value = cell['order'];
    $('#cell-input-alpha-' + cell_num).value = cell['alpha'];
    $('#cell-input-align-' + cell_num).value = cell['align'];
    $('#cell-input-x-' + cell_num).value = cell['x'];
    $('#cell-input-y-' + cell_num).value = cell['y'];
    $('#cell-input-w-' + cell_num).value = cell['w'];
    $('#cell-input-h-' + cell_num).value = cell['h'];
    $('#cell-input-border-' + cell_num).checked = cell['border'];

    $('#cell-input-text-' + cell_num).value = cell['text'];
    $('#cell-input-fontsize-' + cell_num).value = cell['fontsize'];
    $('#cell-input-color-' + cell_num).value = cell['color'];
    $('#cell-input-picker-' + cell_num).value = cell['color'];
    $('#cell-input-bold-' + cell_num).checked = cell['bold'];
    $('#cell-input-wrap-' + cell_num).checked = cell['wrap'];
    $('#cell-input-image_file-' + cell_num).value = cell['image'];
  };

  // UIパーツの追加
  var appendUI = function (element, cell_num, label_text, input_type, input_name, width, input_value) {
    if (width === void 0) width = 0;

    var text = document.createTextNode(label_text);
    var label = $({ tag: 'label', style: cell_label_style });
    var input = $({ tag: 'input', style: cell_input_style });
    input.type = input_type;
    input.name = input_name;
    input.id = 'cell-input-' + input_name + '-' + cell_num;
    input.setAttribute('data-cell-id', cell_num);

    if (width > 0) input.style.width = width + 'px';

    if (input_type === 'file') {
      input.addEventListener('change', loadImageListener, false);
    }
    if (input_type === 'number') {
      input.addEventListener('input', inputListener, false);
    }
    if (input_type === 'text') {
      input.addEventListener('input', inputListener, false);
    }
    if (input_type === 'checkbox') {
      input.addEventListener('change', checkboxListener, false);
    }
    if (input_type === 'color') {
      input.addEventListener('change', colorListener, false);
    }
    if (input_type === 'button') {
      input.addEventListener('click', deleteListener, false);
    }

    if (input_type === 'checkbox') {
      label.appendChild(input);
      label.appendChild(text);
      element.appendChild(label);
    } else {
      label.appendChild(text);
      element.appendChild(label);
      element.appendChild(input);
    }
  };

  // 入力セルの作成
  var createCellForm = function (cell_num) {
    var div = $({ tag: 'div', id: 'cell-' + cell_num, style: cell_style });
    div.setAttribute('data-cell-id', cell_num);

    var cell_1 = document.createElement('div');
    cell_1.className = 'cell1';
    appendUI(cell_1, cell_num, '', 'checkbox', 'show');

    var cell_2 = document.createElement('div');
    cell_2.className = 'cell2';
    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    var div3 = document.createElement('div');

    appendUI(div1, cell_num, '名前', 'text', 'name', 80);
    appendUI(div1, cell_num, '親', 'text', 'parent', 80);
    appendUI(div1, cell_num, '順位', 'number', 'order', 40);
    appendUI(div1, cell_num, 'α', 'number', 'alpha', 50);
    div1.lastElementChild.step = 0.01;
    div1.lastElementChild.min = 0.0;
    div1.lastElementChild.max = 1.0;

    appendUI(div1, cell_num, '配置', 'number', 'align', 40);
    appendUI(div1, cell_num, 'x', 'number', 'x', 60);
    appendUI(div1, cell_num, 'y', 'number', 'y', 60);
    appendUI(div1, cell_num, 'w', 'number', 'w', 60);
    appendUI(div1, cell_num, 'h', 'number', 'h', 60);
    appendUI(div1, cell_num, '枠線', 'checkbox', 'border');

    appendUI(div2, cell_num, '文言', 'text', 'text', 200);
    appendUI(div2, cell_num, 'サイズ', 'number', 'fontsize', 40);
    appendUI(div2, cell_num, '色', 'text', 'color', 80);
    appendUI(div2, cell_num, '', 'color', 'picker');
    appendUI(div2, cell_num, 'ボールド', 'checkbox', 'bold');
    appendUI(div2, cell_num, '折り返し', 'checkbox', 'wrap');

    appendUI(div3, cell_num, '画像', 'file', 'image');
    appendUI(div3, cell_num, '', 'text', 'image_file');
    div3.lastElementChild.disabled = 'disabled';
    appendUI(div3, cell_num, '', 'button', 'delete');
    div3.lastElementChild.style.cssFloat = 'right';
    div3.lastElementChild.value = '削除';

    cell_2.appendChild(div1);
    cell_2.appendChild(div2);
    cell_2.appendChild(div3);

    div.appendChild(cell_1);
    div.appendChild(cell_2);

    return div;
  };

  // 初期値設定
  $('#layout_name').value = app.filename;
  $('#d_width').value = display_width;
  $('#d_height').value = display_height;
  $('#scale_select').value = app.display_scale;
  $('#v_width').value = screen_width;
  $('#v_height').value = screen_height;

  // リスナー登録
  $('#scale_select').addEventListener('input', () => {
    var scale = parseInt($('#scale_select').value);
    if (scale > 0) {
      display_width = screen_width * scale / 360;
      display_height = screen_height * scale / 360;
      $('#d_width').value = display_width;
      $('#d_height').value = display_height;
      updateCanvasParam();
      update();
    }
  }, false);

  $('#d_width').addEventListener('input', () => {
    display_width = oo.strToInt($('#d_width').value);
    updateCanvasParam();
    update();
  }, false);
  $('#d_height').addEventListener('input', () => {
    display_height = oo.strToInt($('#d_height').value);
    updateCanvasParam();
    update();
  }, false);
  $('#v_width').addEventListener('input', () => {
    screen_width = oo.strToInt($('#v_width').value);
    updateCanvasParam();
    update();
  }, false);
  $('#v_height').addEventListener('input', () => {
    screen_height = oo.strToInt($('#v_height').value);
    updateCanvasParam();
    update();
  }, false);

  // レイアウトの読み込み
  $('#load').addEventListener('click', () => {
    var reader = new FileReader();

    var inputLoad = document.createElement('input');
    inputLoad.type = 'file';
    inputLoad.accept = '*/*';
    inputLoad.addEventListener('change', (e) => {
      var file = e.target.files[0];
      $('#layout_name').value = file.name;
      reader.onload = () => { loadLayoutData(reader.result); };
      reader.readAsText(file);
    }, false);
    inputLoad.click();
  }, false);

  // レイアウトの書き出し
  $('#save').addEventListener('click', () => {
    var filename = $('#layout_name').value;
    if (!filename) filename = app.filename;

    layout.image_base_path = $('#image_base_path').value;
    layout.display_width = display_width;
    layout.display_height = display_height;
    layout.screen_width = screen_width;
    layout.screen_height = screen_height;
    // 書き出し用にコピー
    var data = oo.deepClone(layout);
    // 不要情報の削除
    delete data.cell_map;
    delete data.cell_order;
    delete data.offset;
    delete data.context;
    for (var cell of data.cells) {
      delete cell.img;
      delete cell.rect;
    }
    // テキスト化
    var text = JSON.stringify(data, null, ' ');

    var blob = new Blob([text], { type: 'text/plain' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, false);

  // 要素の追加
  $('#append').addEventListener('click', () => {
    $('#cell_array').appendChild(createCellForm(num_cells));
    cell_map.set(num_cells, new OoGameLayoutCell());
    updateForm(num_cells);
    num_cells++;
  }, false);

  // 画面更新
  updateCanvasParam();
  update();
});
