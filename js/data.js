(function () {
  function parseCSV(csvText) {
    var result = Papa.parse(csvText, {
      skipEmptyLines: true
    });

    return result.data.filter(function (currentRow) {
      return currentRow.some(function (value) {
        return String(value).trim() !== "";
      });
    });
  }

  function normalizeHeader(header) {
    return String(header || "")
      .replace(/^\uFEFF/, "")
      .replace(/\r/g, "")
      .replace(/\n/g, " ")
      .trim()
      .toLowerCase();
  }

  async function loadRecords(kind) {
    var response = await fetch(window.GZYLZ_CONFIG.listFile);

    if (!response.ok) {
      throw new Error("Could not load list.csv");
    }

    var rows = parseCSV(await response.text());

    if (rows.length === 0) {
      return [];
    }

    var headers = rows[0].map(normalizeHeader);
    var recordings = [];

    for (var i = 1; i < rows.length; i++) {
      var recording = {};
      recording._id = kind + "-" + i;
      recording._kind = kind;

      for (var j = 0; j < headers.length; j++) {
        var name = headers[j];
        var value = rows[i][j] || "";

        if (name) {
          recording[name] = value.trim();
        }
      }

      if (String(recording.kind || "").toLowerCase() === kind.toLowerCase()) {
        recordings.push(recording);
      }
    }

    return recordings;
  }

  function get(row) {
    if (!row) {
      return "";
    }

    for (var i = 1; i < arguments.length; i++) {
      var name = String(arguments[i]).toLowerCase().replace(/\r?\n/g, " ").trim();

      if (row[name] !== undefined) {
        return row[name] || "";
      }
    }

    return "";
  }

  window.GZYLZ_DATA = {
    parseCSV: parseCSV,
    loadRecords: loadRecords,
    get: get
  };
})();
