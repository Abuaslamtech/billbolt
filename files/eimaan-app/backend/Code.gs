/**
 * EIMAAN MAISON — Backend API (Apps Script)
 * ------------------------------------------------
 * Serves two purposes:
 *  1. In-sheet menu form (desktop UX) — unchanged from before.
 *  2. JSON API for the Expo mobile app (doPost / doGet).
 *
 * SETUP:
 *  1. Open your Google Sheet → Extensions → Apps Script.
 *  2. Replace/create a file named "Code.gs" with this content.
 *  3. Create a second file "WebApp.html" (see the separate file provided).
 *  4. Deploy → New deployment → type "Web app" →
 *       Execute as: Me
 *       Who has access: Anyone
 *     Copy the resulting URL — you'll paste it into the Expo app's src/api.ts.
 *  5. Reload the spreadsheet — a new "Eimaan Maison" menu will appear.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Eimaan Maison')
    .addItem('Open Data Entry Form', 'showForm')
    .addToUi();
}

function showForm() {
  var html = HtmlService.createHtmlOutputFromFile('WebApp')
    .setWidth(440)
    .setHeight(620);
  SpreadsheetApp.getUi().showModalDialog(html, 'Eimaan Maison — Add Data');
}

// ---------- web entry points ----------

function doGet(e) {
  if (e.parameter && e.parameter.action === 'getProducts') {
    return jsonOut_({ success: true, result: getProducts() });
  }
  return HtmlService.createHtmlOutputFromFile('WebApp')
    .setTitle('Eimaan Maison — Add Data')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// JSON API used by the Expo app. Body: { action: string, data: object }
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var data = body.data || {};
    var result;
    switch (action) {
      case 'submitSale': result = submitSale(data); break;
      case 'submitRestock': result = submitRestock(data); break;
      case 'submitProduct': result = submitProduct(data); break;
      case 'getProducts': result = getProducts(); break;
      default: throw new Error('Unknown action: ' + action);
    }
    return jsonOut_({ success: true, result: result });
  } catch (err) {
    return jsonOut_({ success: false, error: err.message });
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- data helpers ----------

function getProducts() {
  var sh = SpreadsheetApp.getActive().getSheetByName('Products');
  var vals = sh.getRange('A5:A34').getValues().flat().filter(String);
  return vals;
}

function findEmptyRow_(sheetName, col, startRow, endRow) {
  var sh = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var vals = sh.getRange(startRow, col, endRow - startRow + 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (!vals[i][0]) return startRow + i;
  }
  return -1;
}

// ---------- form / API submit handlers ----------

function submitSale(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // wait up to 10s for other submissions to finish
  try {
    var row = findEmptyRow_('Sales Log', 2, 5, 304);
    if (row === -1) throw new Error('Sales Log is full — message me to expand it.');
    var sh = SpreadsheetApp.getActive().getSheetByName('Sales Log');
    sh.getRange(row, 1, 1, 4).setValues([[
      new Date(data.date), data.product, Number(data.qty), data.soldBy || ''
    ]]);
    return { message: 'Sale logged: ' + data.product + ' x' + data.qty, row: row };
  } finally {
    lock.releaseLock();
  }
}

function submitRestock(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var row = findEmptyRow_('Restocks Log', 2, 5, 204);
    if (row === -1) throw new Error('Restocks Log is full — message me to expand it.');
    var sh = SpreadsheetApp.getActive().getSheetByName('Restocks Log');
    sh.getRange(row, 1, 1, 4).setValues([[
      new Date(data.date), data.product, Number(data.qty), Number(data.cost)
    ]]);
    return { message: 'Restock logged: ' + data.product + ' x' + data.qty, row: row };
  } finally {
    lock.releaseLock();
  }
}

function submitProduct(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var row = findEmptyRow_('Products', 1, 5, 34);
    if (row === -1) throw new Error('Products sheet is full — message me to expand it.');
    var sh = SpreadsheetApp.getActive().getSheetByName('Products');
    sh.getRange(row, 1, 1, 4).setValues([[
      data.name, data.category || '', Number(data.cost), Number(data.price)
    ]]);
    sh.getRange(row, 6).setValue(Number(data.reorder));
    return { message: 'Product added: ' + data.name, row: row };
  } finally {
    lock.releaseLock();
  }
}
