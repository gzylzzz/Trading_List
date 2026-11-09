window.GZYLZ_DATA = {};

function splitCSVLine(line) {
  const cells = [];
  let currentCell = "";
  let insideQuotes = false; // 目前是不是在雙引號裡

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // 有引號就切換狀態
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      // 不逗號
      cells.push(currentCell.trim());
      currentCell = "";
    } else {
      // 其他都放進儲存格
      currentCell += char;
    }
  }

  // 最後一格
  cells.push(currentCell.trim());
  return cells;
}

// 載入解析
window.GZYLZ_DATA.loadSheet = async function(kind) {
  const csvUrl = window.GZYLZ_CONFIG.sheets[kind];
  const response = await fetch(csvUrl);
  const rawText = await response.text();

  // 拆
  const lines = rawText.split("\n");
  if (lines.length === 0) return [];

  // 切第一行標題
  const rawHeaders = splitCSVLine(lines[0]);
  const headers = rawHeaders.map(h => h.toLowerCase());

  const resultList = [];

  // 處理資料
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (currentLine === "") continue;

    // 處理引號
    const cells = splitCSVLine(currentLine);

    const rowObject = {
      _id: kind + "-" + i,
      _kind: kind
    };

    // 對照標題和資料
    for (let j = 0; j < headers.length; j++) {
      const headerName = headers[j];
      const cellValue = cells[j] || "";
      rowObject[headerName] = cellValue;
    }

    resultList.push(rowObject);
  }

  return resultList;
};
