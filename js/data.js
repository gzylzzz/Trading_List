/*
  This file is responsible for reading information from Google Sheets.

  The information in the sheets is published as CSV text.
  CSV looks simple at first, but it has a few special cases:
  - A comma can separate two columns.
  - A comma can also appear inside a cell if that cell uses quotation marks.
  - A cell can contain quotation marks written as two quotation marks.
  - A cell can even contain a line break.

  I am keeping the steps below separate so it is easier to follow what happens.
*/

(function () {

  // ------------------------------------------------------------
  // 1. Turn CSV text into rows and cells
  // ------------------------------------------------------------

  function parseCSV(csvText) {
    // This will contain every row after we finish reading the CSV.
    var allRows = [];

    // These variables describe the row and cell we are working on now.
    var currentRow = [];
    var currentCell = "";

    // When this is true, commas and line breaks belong to the cell,
    // not to the CSV structure.
    var insideQuotes = false;

    // Read the text one character at a time.
    for (var position = 0; position < csvText.length; position++) {
      var currentCharacter = csvText[position];
      var nextCharacter = csvText[position + 1];

      // CASE 1: We are already inside a quoted cell.
      if (insideQuotes === true) {

        // Two quotation marks together mean that the cell contains
        // one real quotation mark.
        if (currentCharacter === '"' && nextCharacter === '"') {
          currentCell = currentCell + '"';
          position = position + 1;
        }

        // A single quotation mark closes the quoted part of the cell.
        else if (currentCharacter === '"') {
          insideQuotes = false;
        }

        // Any other character is ordinary cell content.
        else {
          currentCell = currentCell + currentCharacter;
        }
      }

      // CASE 2: We are not inside a quoted cell.
      else {

        // A quotation mark means that a quoted cell is starting.
        if (currentCharacter === '"') {
          insideQuotes = true;
        }

        // A comma ends the current cell.
        else if (currentCharacter === ",") {
          currentRow.push(currentCell);
          currentCell = "";
        }

        // A line break ends the current row.
        else if (currentCharacter === "\n") {
          // Google Sheets normally uses line breaks that may include \r.
          // Remove that extra character from the end of the cell.
          currentCell = currentCell.replace(/\r$/, "");

          // Save the last cell and then save the complete row.
          currentRow.push(currentCell);
          allRows.push(currentRow);

          // Start with a fresh row and a fresh cell.
          currentRow = [];
          currentCell = "";
        }

        // If it is not a comma, quote, or line break, keep the character.
        else {
          currentCell = currentCell + currentCharacter;
        }
      }
    }

    // The loop has ended. There may still be one last cell to save.
    // This also keeps an empty last cell when a row ends with a comma.
    if (currentCell.length > 0 || currentRow.length > 0) {
      currentCell = currentCell.replace(/\r$/, "");
      currentRow.push(currentCell);
      allRows.push(currentRow);
    }

    // Ignore completely empty rows. They do not contain useful sheet data.
    var rowsWithoutEmptyLines = [];

    for (var rowIndex = 0; rowIndex < allRows.length; rowIndex++) {
      var rowToCheck = allRows[rowIndex];
      var rowHasContent = false;

      for (var cellIndex = 0; cellIndex < rowToCheck.length; cellIndex++) {
        var cellText = String(rowToCheck[cellIndex]);

        if (cellText.trim() !== "") {
          rowHasContent = true;
          break;
        }
      }

      if (rowHasContent === true) {
        rowsWithoutEmptyLines.push(rowToCheck);
      }
    }

    return rowsWithoutEmptyLines;
  }


  // ------------------------------------------------------------
  // 2. Make column names easier to use
  // ------------------------------------------------------------

  function normalizeHeader(headerText) {
    var cleanedHeader = String(headerText || "");

    // A heading might accidentally contain a line break.
    cleanedHeader = cleanedHeader.replace(/\r/g, "");
    cleanedHeader = cleanedHeader.replace(/\n/g, " ");

    // Remove spaces at the beginning and end, then use lowercase.
    cleanedHeader = cleanedHeader.trim();
    cleanedHeader = cleanedHeader.toLowerCase();

    return cleanedHeader;
  }


  // ------------------------------------------------------------
  // 3. Read one of the Google Sheets
  // ------------------------------------------------------------

  async function loadSheet(sheetName) {
    // First, check whether the settings and the requested sheet exist.
    if (!window.GZYLZ_CONFIG || !window.GZYLZ_CONFIG.sheets) {
      throw new Error("The Google Sheets settings could not be found.");
    }

    var sheetURL = window.GZYLZ_CONFIG.sheets[sheetName];

    if (!sheetURL) {
      throw new Error("There is no Google Sheets link for: " + sheetName);
    }

    // Ask Google Sheets for the latest published CSV text.
    var response = await fetch(sheetURL, {
      cache: "no-store"
    });

    // A response that is not OK usually means that the link or request failed.
    if (!response.ok) {
      throw new Error("Google Sheets returned " + response.status);
    }

    // Read the response as text, then turn that text into rows.
    var csvText = await response.text();
    var allRows = parseCSV(csvText);

    // An empty sheet does not have a heading row or any recording rows.
    if (allRows.length === 0) {
      return [];
    }

    // The first row contains the column names.
    var headerRow = allRows[0];
    var headerNames = [];

    for (var headerIndex = 0; headerIndex < headerRow.length; headerIndex++) {
      var oneHeader = normalizeHeader(headerRow[headerIndex]);
      headerNames.push(oneHeader);
    }

    // All rows after the first row contain the actual information.
    var dataRows = [];

    for (var dataIndex = 1; dataIndex < allRows.length; dataIndex++) {
      var cellsInThisRow = allRows[dataIndex];

      // Keep an ID and a type for each row. Other scripts use these values.
      var rowObject = {};
      rowObject._id = sheetName + "-" + (dataIndex - 1);
      rowObject._kind = sheetName;

      // Match each cell with the heading in the same column.
      for (var columnIndex = 0; columnIndex < headerNames.length; columnIndex++) {
        var columnName = headerNames[columnIndex];
        var cellValue = "";

        // Some rows may have fewer cells than the heading row.
        // In that case, leave the missing value as an empty string.
        if (cellsInThisRow[columnIndex] !== undefined) {
          cellValue = String(cellsInThisRow[columnIndex]);
        }

        // Remove spaces around the value before saving it.
        cellValue = cellValue.trim();

        // Save this value under its column name.
        if (columnName !== "") {
          rowObject[columnName] = cellValue;
        }
      }

      dataRows.push(rowObject);
    }

    return dataRows;
  }


  // ------------------------------------------------------------
  // 4. Get a value from a row
  // ------------------------------------------------------------

  function get(row, ...possibleNames) {
    // If there is no row, there is nothing to look up.
    if (!row) {
      return "";
    }

    // Some sheet headings have more than one possible name.
    // Check those names in the order provided by the calling script.
    for (var nameIndex = 0; nameIndex < possibleNames.length; nameIndex++) {
      var columnName = possibleNames[nameIndex];

      if (row[columnName] !== undefined) {
        // Keep the existing behaviour: a blank value is returned as blank.
        return row[columnName] || "";
      }
    }

    // None of the requested column names existed in this row.
    return "";
  }


  // ------------------------------------------------------------
  // 5. Make these functions available to the other website scripts
  // ------------------------------------------------------------

  window.GZYLZ_DATA = {
    parseCSV: parseCSV,
    loadSheet: loadSheet,
    get: get
  };

})();
