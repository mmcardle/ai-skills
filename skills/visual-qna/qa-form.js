// visual-qna form engine.
// Inject the ENTIRE contents of this file as the `function` argument to the
// Playwright MCP browser_evaluate tool (it is already a () => {} arrow function).
// Running it once defines window.__qaInit / __qaToggle / __qaNote / __qaResults
// on the page. Then call window.__qaInit(config) in a second browser_evaluate.
//
// config = {
//   title: "My question set",
//   questions: [
//     { id: "q1", title: "...", detail: "...(optional)",
//       options: [ { letter: "A", text: "...", recommended: true } ],
//       multi: false,        // true = allow multiple selections
//       allowOther: true }   // default true; appends a dashed "O — Other"
//   ]
// }
//
// Results: window.__qaResults() returns JSON of { selections, notes }.
//   selections[id] = "B"           for single-select
//   selections[id] = ["A","C"]     for multi-select
//   notes[id]      = "free text"
() => {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function ensureStyle() {
    if (document.getElementById('qna-style')) return;
    var s = document.createElement('style');
    s.id = 'qna-style';
    s.textContent = [
      'body{margin:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0f0f0f;color:#e8e8e8;padding:32px;line-height:1.5}',
      '.qna-wrap{max-width:760px;margin:0 auto}',
      '.qna-wrap h1{font-size:22px;font-weight:600;margin:0 0 4px}',
      '.qna-sub{color:#888;font-size:13px;margin-bottom:24px}',
      '.qna-prog{position:sticky;top:0;background:#0f0f0f;padding:8px 0;font-size:12px;color:#888;z-index:2}',
      '.qna-q{background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:18px;margin-bottom:16px}',
      '.qna-qt{font-size:15px;font-weight:600;margin-bottom:4px}',
      '.qna-multi{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#60a5fa;border:1px solid #60a5fa;border-radius:4px;padding:0 5px;margin-left:6px}',
      '.qna-qd{font-size:13px;color:#888;margin-bottom:12px}',
      '.qna-opt{display:flex;gap:10px;align-items:flex-start;border:1px solid #333;border-radius:8px;padding:10px 12px;margin-bottom:8px;cursor:pointer;font-size:13px;transition:all .12s}',
      '.qna-opt:hover{border-color:#7c6ef6;background:rgba(124,110,246,.10)}',
      '.qna-opt.sel{border-color:#4ade80;background:rgba(74,222,128,.15)}',
      '.qna-opt.other{border-style:dashed}',
      '.qna-opt.other.sel{border-color:#60a5fa;background:rgba(96,165,250,.14)}',
      '.qna-ltr{width:22px;height:22px;flex:0 0 22px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:#242424;font-weight:700;font-size:12px;color:#888}',
      '.qna-opt.sel .qna-ltr{background:#4ade80;color:#0f0f0f}',
      '.qna-opt.other.sel .qna-ltr{background:#60a5fa;color:#0f0f0f}',
      '.qna-rec{font-size:9px;text-transform:uppercase;letter-spacing:.05em;background:#7c6ef6;color:#fff;padding:1px 6px;border-radius:4px;margin-left:6px}',
      '.qna-note{width:100%;box-sizing:border-box;margin-top:8px;background:#0f0f0f;border:1px solid #333;border-radius:8px;color:#e8e8e8;font:inherit;font-size:13px;padding:10px;resize:vertical;min-height:42px}',
      '.qna-note:focus{outline:none;border-color:#7c6ef6}'
    ].join('');
    document.head.appendChild(s);
  }

  function optsFor(q) {
    var base = q.options.slice();
    if (q.allowOther !== false) {
      base.push({ letter: 'O', text: 'Other — none of the above; explain in the note.', other: true });
    }
    return base;
  }

  function answered(q) {
    var v = window.__qa.selections[q.id];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }

  function render() {
    var cfg = window.__qaConfig;
    var sel = window.__qa.selections;
    var notes = window.__qa.notes;
    var done = cfg.questions.filter(answered).length;
    var anyMulti = cfg.questions.some(function (q) { return q.multi; });
    var html = '<div class="qna-wrap">';
    html += '<h1>' + esc(cfg.title || 'Questions') + '</h1>';
    html += '<div class="qna-sub">Click an option for each question. Pick <b>O</b> (Other) and add a note if none fit.'
      + (anyMulti ? ' Questions marked <b>multi-select</b> accept more than one choice.' : '') + '</div>';
    html += '<div class="qna-prog">' + done + ' of ' + cfg.questions.length + ' answered</div>';
    cfg.questions.forEach(function (q) {
      html += '<div class="qna-q"><div class="qna-qt">' + esc(q.title)
        + (q.multi ? '<span class="qna-multi">multi-select</span>' : '') + '</div>';
      if (q.detail) html += '<div class="qna-qd">' + esc(q.detail) + '</div>';
      optsFor(q).forEach(function (o) {
        var on = q.multi
          ? (Array.isArray(sel[q.id]) && sel[q.id].indexOf(o.letter) >= 0)
          : (sel[q.id] === o.letter);
        html += '<div class="qna-opt' + (on ? ' sel' : '') + (o.other ? ' other' : '')
          + '" onclick="window.__qaToggle(\'' + q.id + '\',\'' + o.letter + '\')">'
          + '<div class="qna-ltr">' + esc(o.letter) + '</div><div>' + esc(o.text)
          + (o.recommended ? '<span class="qna-rec">recommended</span>' : '') + '</div></div>';
      });
      html += '<textarea class="qna-note" placeholder="Note (required if Other)..." '
        + 'oninput="window.__qaNote(\'' + q.id + '\',this.value)">' + esc(notes[q.id] || '') + '</textarea>';
      html += '</div>';
    });
    html += '</div>';
    document.body.innerHTML = html;
  }

  window.__qaToggle = function (id, letter) {
    var q = window.__qaConfig.questions.find(function (x) { return x.id === id; });
    if (!q) return;
    var sel = window.__qa.selections;
    if (q.multi) {
      var arr = Array.isArray(sel[id]) ? sel[id] : [];
      var i = arr.indexOf(letter);
      if (i >= 0) arr.splice(i, 1); else arr.push(letter);
      sel[id] = arr;
    } else {
      sel[id] = (sel[id] === letter) ? undefined : letter;
    }
    render();
  };

  window.__qaNote = function (id, v) { window.__qa.notes[id] = v; };

  window.__qaResults = function () { return JSON.stringify(window.__qa); };

  window.__qaInit = function (config) {
    window.__qaConfig = config;
    window.__qa = { selections: {}, notes: {} };
    document.title = config.title || 'Questions';
    ensureStyle();
    render();
    return 'rendered ' + config.questions.length + ' questions';
  };
}
