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

    function titleCaseShow(value) {
        value = clean(value);

        if (value !== value.toUpperCase()) {
            return value;
        }

        const smallWords = ["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"];

        return value.toLowerCase().split(" ").map(function (word, index) {
            return word.split("-").map(function (part) {
                if (index !== 0 && smallWords.includes(part)) {
                    return part;
                }

                return part.charAt(0).toUpperCase() + part.slice(1);
            }).join("-");
        }).join(" ");
    }

    function parseDate(value) {
        value = value.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1").trim();

        let match = value.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
        if (match) {
            return match[1] + "-" + match[2].padStart(2, "0") + "-" + match[3].padStart(2, "0");
        }

        match = value.match(/\b([A-Za-z]+)\s+(\d{1,2}),?\s+(20\d{2})\b/);
        if (!match) {
            match = value.match(/\b(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})\b/);
            if (match) {
                const month = new Date(match[2] + " 1, 2000").getMonth() + 1;
                if (month > 0) {
                    return match[3] + "-" + String(month).padStart(2, "0") + "-" + match[1].padStart(2, "0");
                }
            }
        } else {
            const month = new Date(match[1] + " 1, 2000").getMonth() + 1;
            if (month > 0) {
                return match[3] + "-" + String(month).padStart(2, "0") + "-" + match[2].padStart(2, "0");
            }
        }

        return "";
    }

    function isFileType(value) {
        return /\b(mp3|m4a|wav|flac|mp4|mov|mkv|vobs?|avi|wmv|mpeg|m4v|webm)\b/i.test(value);
    }

    function addNote(row, value) {
        value = clean(value);
        if (value) {
            row.Notes = row.Notes ? row.Notes + " " + value : value;
        }
    }

    function parseMetadata(line, row, kind, dateHeader, fileTypeHeader) {
        if (line.indexOf("|") === -1) {
            return false;
        }

        const parts = line.split("|").map(clean);
        let dateFound = false;
        const production = [];

        parts.forEach(function (part) {
            const date = parseDate(part);

            if (date) {
                row[dateHeader] = date;
                dateFound = true;
            } else if (isFileType(part)) {
                row[fileTypeHeader] = part.replace(/\s*\([^)]*\)/g, "").trim().toUpperCase();
            } else if (/\b(untracked|tracked)\b/i.test(part)) {
                if (kind === "Audio") {
                    row["tracked/untracked"] = /untracked/i.test(part) ? "untracked" : "tracked";
                }
            } else if (/\b\d+(?:\.\d+)?\s*(?:KB|MB|GB|TB)\b/i.test(part)) {
                row.Size = part.match(/\b\d+(?:\.\d+)?\s*(?:KB|MB|GB|TB)\b/i)[0].replace(/\s+/g, "");
                const extra = part.replace(/\b\d+(?:\.\d+)?\s*(?:KB|MB|GB|TB)\b/i, "").replace(/[()]/g, "").trim();
                if (extra) {
                    row.textSizeExtra = extra;
                }
            } else if (part) {
                production.push(part);
            }
        });

        if (dateFound && production.length) {
            row.Production = production.join(", ");
        }

        return dateFound;
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
        let showSet = false;

        lines.forEach(function (line) {
            let match;

            if ((match = line.match(/^show\s*:\s*(.+)$/i))) {
                row.Show = titleCaseShow(match[1]);
                showSet = true;
                return;
            }

            if ((match = line.match(/^production\s*:\s*(.+)$/i))) {
                row.Production = match[1];
                return;
            }

            if ((match = line.match(/^master\s*:\s*(.+)$/i))) {
                row.Master = match[1];
                return;
            }

            if ((match = line.match(/^cast\s*:\s*(.*)$/i))) {
                row.Cast = match[1];
                return;
            }

            if ((match = line.match(/^notes?\s*:\s*(.+)$/i))) {
                addNote(row, match[1]);
                return;
            }

            if ((match = line.match(/^my\s+notes?\s*:\s*(.+)$/i))) {
                row["My Notes"] = match[1];
                return;
            }

            if ((match = line.match(/^highlights?\s*:\s*(.+)$/i))) {
                row.Highlights = match[1];
                return;
            }

            if ((match = line.match(/^language\s*:\s*(.+)$/i))) {
                row.language = match[1];
                return;
            }

            if (/^never\s+gift$/i.test(line)) {
                row[kind === "Audio" ? "Never Gift" : "Never gift"] = "TRUE";
                return;
            }

            if (/^NFT except through master$/i.test(line)) {
                row["NFT except through master"] = "TRUE";
                return;
            }

            if (/^only\s+gift$/i.test(line)) {
                row[kind === "Audio" ? "Only gift" : "Only Gift"] = "TRUE";
                return;
            }

            if (/limited\s+trade/i.test(line)) {
                if (/2\s*:\s*1/.test(line)) {
                    row[kind === "Audio" ? "Limited trades 2:1" : "limited trade 2:1"] = "TRUE";
                }
                if (/3\s*:\s*1/.test(line)) {
                    row.textLimitedThree = "TRUE";
                    if (kind === "Video") {
                        row["limited trade 3:1"] = "TRUE";
                    }
                }
                return;
            }

            if (/includes?\s+subtitles/i.test(line) && kind === "Video") {
                row["Includes subtitles"] = "TRUE";
                return;
            }

            if (parseMetadata(line, row, kind, dateHeader, fileTypeHeader)) {
                return;
            }

            if (!row[dateHeader]) {
                const date = parseDate(line);
                if (date) {
                    row[dateHeader] = date;
                    return;
                }
            }

            if (/\b(untracked|tracked)\b/i.test(line) && kind === "Audio") {
                row["tracked/untracked"] = /untracked/i.test(line) ? "untracked" : "tracked";
                return;
            }

            if (isFileType(line)) {
                row[fileTypeHeader] = line.match(/\b(mp3|m4a|wav|flac|mp4|mov|mkv|vobs?|avi|wmv|mpeg|m4v|webm)\b/i)[0].toUpperCase();
                return;
            }

            if (!showSet && !row.Show) {
                row.Show = titleCaseShow(line);
                showSet = true;
                return;
            }

            addNote(row, line);
        });

        return row;
    }

    function formatText(row, kind) {
        const headerLines = [];
        const sections = [];
        const show = row.Show || "";
        const date = row[kind === "Audio" ? "Date (YYYY-MM-DD)" : "Date"] || "";
        const fileType = row[kind === "Audio" ? "Type" : "File Type"] || "";
        const size = row.Size ? row.Size + (row.textSizeExtra ? " (" + row.textSizeExtra + ")" : "") : "";

        headerLines.push(show);

        if (kind === "Audio") {
            headerLines.push([
                row.Production, date, row.Master, row["tracked/untracked"]
            ].filter(Boolean).join(" | "));

            if (fileType || size) {
                headerLines.push("(" + [fileType, size].filter(Boolean).join(", ") + ")");
            }
        } else {
            headerLines.push([
                row.Production, date, row.Master, fileType, size
            ].filter(Boolean).join(" | "));
        }

        const flags = [];
        const neverGift = row[kind === "Audio" ? "Never Gift" : "Never gift"];
        const onlyGift = row[kind === "Audio" ? "Only gift" : "Only Gift"];
        const limitedTwo = row[kind === "Audio" ? "Limited trades 2:1" : "limited trade 2:1"];
        const limitedThree = row.textLimitedThree || (kind === "Video" ? row["limited trade 3:1"] : "");

        if (neverGift) flags.push("Never Gift");
        if (row["NFT except through master"]) flags.push("NFT except through master");
        if (row.language) flags.push(row.language);
        if (row.Highlights) flags.push(row.Highlights);
        if (limitedTwo) flags.push("Limited trades (2:1)");
        if (limitedThree) flags.push("Limited trades (3:1)");
        if (kind === "Video" && row["Includes subtitles"]) flags.push("Includes subtitles");
        if (onlyGift) flags.push("Only Gift");

        if (flags.length) {
            headerLines.push(flags.join("、"));
        }

        if (row.Cast) {
            sections.push(row.Cast);
        }

        if (row.Notes) {
            sections.push("Notes: " + row.Notes);
        }

        if (kind === "Video" && row["My Notes"]) {
            sections.push("My Notes: " + row["My Notes"]);
        }

        return headerLines.filter(Boolean).join("\n") +
            (sections.length ? "\n\n" + sections.join("\n\n") : "");
    }

    function toTSV(row, kind) {
        const headers = kind === "Audio" ? audioHeaders : videoHeaders;

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
        const rows = blocks.map(function (block) {
            return parseEntry(block, kind);
        });

        $("#text-output").value = rows.map(function (row) {
            return formatText(row, kind);
        }).join("\n\n");

        $("#tsv-output").value = rows.map(function (row) {
            return toTSV(row, kind);
        }).join("\n");

        $("#converter-status").textContent =
            rows.length + " entr" + (rows.length === 1 ? "y" : "ies") + " converted.";
    }

    async function copyOutput(selector, label) {
        const output = $(selector).value;

        if (!output) {
            $("#converter-status").textContent = "There is no " + label + " to copy yet.";
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            $("#converter-status").textContent = label + " copied!";
        } catch (error) {
            $(selector).select();
            $("#converter-status").textContent = "Select and copy the " + label + " manually.";
        }
    }

    $("#convert-button").addEventListener("click", convert);

    $("#copy-text-button").addEventListener("click", function () {
        copyOutput("#text-output", "Text");
    });

    $("#copy-tsv-button").addEventListener("click", function () {
        copyOutput("#tsv-output", "TSV");
    });

    $("#clear-button").addEventListener("click", function () {
        $("#source-text").value = "";
        $("#text-output").value = "";
        $("#tsv-output").value = "";
        $("#converter-status").textContent = "";
    });
})();