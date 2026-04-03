// ============================================================
// CEIP Library — Google Apps Script
// ============================================================
// このコードを Google スプレッドシートの「拡張機能 → Apps Script」に貼り付け、
// 「デプロイ → ウェブアプリとして公開」→「アクセスできるユーザー: 全員」で公開する。
//
// 発行されたURLをReactアプリの api/data.js に設定する。
// ============================================================

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("📚 CEIP人物索引");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];

  // ヘッダーのクリーニング（改行を除去）
  headers = headers.map(function(h) {
    return String(h).replace(/\n/g, '').trim();
  });

  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    // 空行スキップ
    if (!row[0] || String(row[0]).trim() === '') continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    data.push(obj);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
