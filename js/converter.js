(function () {
    const $ = function (selector) {
        return document.querySelector(selector);
    };

    const audioHeaders = [
        "Show", "Production", "Date (YYYY-MM-DD)", "Master", "Cast",
        "Notes", "Type", "tracked/untracked", "Size", "Never Gift",
        "NFT except through master", "My Notes", "Concert", "language",
        "Highlights", "title", "Uncertain", "Limited trades 2:1", "Only gift"
    ];

    const videoHeaders = [
        "Show", "Production", "Date", "Master", "Cast", "Notes",
        "File Type", "Size", "Never gift", "NFT except through master",
        "Highlights", "Concert", "Includes subtitles", "tital",
        "Only Gift", "limited trade 2:1", "limited trade 3:1"
    ];

    function clean(value) {
        return String(value || "").trim();
    }

    function parseDate(text) {
        const value = text.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1").trim();
        let match = value.match(/\b(20\d{2})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?\b/);

        if (match) {
            return match[1] + "-" + match[2].padStart(2, "0") +
                (match[3] ? "-" + match[3].padStart(2, "0") : "");
        }

        const date = new Date(value);
        if (!isNaN(date.getTime()) && /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(value)) {
            return date.getFullYear() + "-" +
                String(date.getMonth() + 1).padStart(2, "0") + "-" +
                String(date.getDate()).padStart(2, "0");
        }

        return "";
    }

    function parseEntry(block, kind) {
        const headers = kind === "Audio" ? audioHeaders : videoHeaders;
        const dateHeader = kind === "Audio" ? "Date (YYYY-MM-DD)" : "Date";
        const fileTypeHeader = kind === "Audio" ? "Type" : "File Type";
        const row = {};

        headers.forEach(function (header) {
            row[header] = "";
        });

        const lines = block.split(/\r?\n/).map(clean).filter(Boolean);
        const notes = [];
        let showSet = false;
        let productionSet = false;

        lines.forEach(function (line) {
            let match;

            if ((match = line.match(/^show\s*:\s*(.+)$/i))) {
                row.Show = match[1];
                showSet = true;
                return;
            }

            if ((match = line.match(/^production\s*:\s*(.+)$/i))) {
                row.Production = match[1];
                productionSet = true;
                return;
            }

            if ((match = line.match(/^master\s*:\s*(.+)$/i))) {
                row.Master = match[1];
                return;
            }

            if ((match = line.match(/^cast\s*:\s*(.+)$/i))) {
                row.Cast = match[1];
                return;
            }

            if ((match = line.match(/^my\s+notes?\s*:\s*(.+)$/i))) {
                if (kind === "Audio") {
                    row["My Notes"] = match[1];
                } else {
                    notes.push(line);
                }
                return;
            }

            if ((match = line.match(/^notes?\s*:\s*(.+)$/i))) {
                row.Notes = match[1];
                return;
            }

            if ((match = line.match(/^highlights?\s*:\s*(.+)$/i))) {
                row.Highlights = match[1];
                return;
            }

            if ((match = line.match(/^language\s*:\s*(.+)$/i))) {
                if (kind === "Audio") {
                    row.language = match[1];
                } else {
                    notes.push(line);
                }
                return;
            }

            const date = parseDate(line);
            if (date && !row[dateHeader]) {
                row[dateHeader] = date;
                return;
            }

            if (kind === "Audio" && /\b(untracked|tracked)\b/i.test(line)) {
                row["tracked/untracked"] = /untracked/i.test(line) ? "untracked" : "tracked";
            }

            if (!row[fileTypeHeader] && /\b(mp3|m4a|wav|flac|mp4|mov|mkv|vob|avi|wmv|mpeg|m4v|webm)\b/i.test(line)) {
                row[fileTypeHeader] = line.match(/\b(mp3|m4a|wav|flac|mp4|mov|mkv|vob|avi|wmv|mpeg|m4v|webm)(?:\s*\+\s*\w+)?/i)[0].toUpperCase();
            }

            if (!row.Size && /\b\d+(?:\.\d+)?\s*(?:KB|MB|GB|TB)\b/i.test(line)) {
                row.Size = line.match(/\b\d+(?:\.\d+)?\s*(?:KB|MB|GB|TB)\b/i)[0];
            }

            if (/\bconcert\b/i.test(line)) {
                row.Concert = "TRUE";
            }

            if (/\bNFT except through master\b/i.test(line)) {
                row["NFT except through master"] = "TRUE";
            }

            if (!showSet) {
                row.Show = line;
                showSet = true;
                return;
            }

            if (!productionSet && !row.Production && !date) {
                row.Production = line;
                productionSet = true;
                return;
            }

            notes.push(line);
        });

        if (notes.length && !row.Notes) {
            row.Notes = notes.join(" ");
        }

        return headers.map(function (header) {
            return String(row[header] || "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
        }).join("\t");
    }

    function convert() {
        const source = clean($("#source-text").value);
        const kind = $("#record-kind").value;

        if (!source) {
            $("#converter-status").textContent = "Paste some text first.";
            return;
        }

        const blocks = source.split(/\r?\n\s*\r?\n+/).map(clean).filter(Boolean);
        const output = blocks.map(function (block) {
            return parseEntry(block, kind);
        });

        $("#tsv-output").value = output.join("\n");
        $("#converter-status").textContent =
            output.length + " entr" + (output.length === 1 ? "y" : "ies") +
            " converted. Please review the columns before importing.";
    }

    $("#convert-button").addEventListener("click", convert);

    $("#copy-button").addEventListener("click", async function () {
        const output = $("#tsv-output").value;

        if (!output) {
            $("#converter-status").textContent = "There is no TSV to copy yet.";
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            $("#converter-status").textContent = "TSV copied!";
        } catch (error) {
            $("#tsv-output").select();
            $("#converter-status").textContent = "Select and copy the text manually.";
        }
    });

    $("#clear-button").addEventListener("click", function () {
        $("#source-text").value = "";
        $("#tsv-output").value = "";
        $("#converter-status").textContent = "";
    });
})();