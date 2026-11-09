(function () {

  function parseCSV(csvText) {
    var rows = [];
    var row = [];
    var cell = "";
    var inQuotes = false;

    for (var i = 0; i < csvText.length; i++) {
      var character = csvText[i];
      var nextCharacter = csvText[i + 1];

      if (inQuotes) {
        if (character === '"' && nextCharacter === '"') {
          cell = cell + '"';
          i++;
        } else if (character === '"') {
          inQuotes = false;
        } else {
          cell = cell + character;
        }
      } else {
        if (character === '"') {
          inQuotes = true;
        } else if (character === ",") {
          row.push(cell);
          cell = "";
        } else if (character === "\n") {
          cell = cell.replace(/\r$/, "");
          row.push(cell);
          rows.push(row);

          row = [];
          cell = "";
        } else {
          cell = cell + character;
        }
      }
    }

    if (cell !== "" || row.length > 0) {
      cell = cell.replace(/\r$/, "");
      row.push(cell);
      rows.push(row);
    }

    var newRows = [];

    for (var a = 0; a < rows.length; a++) {
      var currentRow = rows[a];
      var hasSomething = false;

      for (var b = 0; b < currentRow.length; b++) {
        if (String(currentRow[b]).trim() !== "") {
          hasSomething = true;
        }
      }

      if (hasSomething) {
        newRows.push(currentRow);
      }
    }

    return newRows;
  }


  function normalizeHeader(header) {
    var name = String(header || "");

    name = name.replace(/\r/g, "");
    name = name.replace(/\n/g, " ");
    name = name.trim();
    name = name.toLowerCase();

    return name;
  }


  async function loadSheet(kind) {
    if (!window.GZYLZ_CONFIG) {
      throw new Error("Sheet settings are missing.");
    }

    var sheetLinks = window.GZYLZ_CONFIG.sheets;

    if (!sheetLinks) {
      throw new Error("Sheet links are missing.");
    }

    var link = sheetLinks[kind];

    if (!link) {
      throw new Error("Sheet not found: " + kind);
    }

    var response = await fetch(link, {
      cache: "no-store"
    });

    if (response.ok === false) {
      throw new Error("Google Sheets returned " + response.status);
    }

    var text = await response.text();
    var rows = parseCSV(text);

    if (rows.length === 0) {
      return [];
    }

    var firstRow = rows[0];
    var headers = [];

    for (var i = 0; i < firstRow.length; i++) {
      var headerName = normalizeHeader(firstRow[i]);
      headers.push(headerName);
    }

    var recordings = [];

    for (var rowNumber = 1; rowNumber < rows.length; rowNumber++) {
      var cells = rows[rowNumber];
      var recording = {};

      recording._id = kind + "-" + (rowNumber - 1);
      recording._kind = kind;

      for (var columnNumber = 0; columnNumber < headers.length; columnNumber++) {
        var name = headers[columnNumber];
        var value = "";

        if (cells[columnNumber] !== undefined) {
          value = cells[columnNumber];
        }

        value = String(value).trim();

        if (name !== "") {
          recording[name] = value;
        }
      }

      recordings.push(recording);
    }

    return recordings;
  }


  function get(row) {
    if (!row) {
      return "";
    }

    var names = [];

    for (var i = 1; i < arguments.length; i++) {
      names.push(arguments[i]);
    }

    for (var a = 0; a < names.length; a++) {
      var name = names[a];

      if (row[name] !== undefined) {
        if (row[name] === null) {
          return "";
        }

        return row[name] || "";
      }
    }

    return "";
  }


  window.GZYLZ_DATA = {
    parseCSV: parseCSV,
    loadSheet: loadSheet,
    get: get
  };

})();
