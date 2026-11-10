(function () {
    const $ = function (selector) {
        return document.querySelector(selector);
    };

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    let audio = [];
    let video = [];
    let filter = "all";

    function get(record, ...names) {
        return window.GZYLZ_DATA.get(record, ...names);
    }

    function has(value) {
        return String(value ?? "").trim() !== "";
    }

    function pill(value, className = "") {
        if (!has(value)) {
            return "";
        }

        return '<span class="pill ' + className + '">' +
            escapeHTML(value) +
            "</span>";
    }

    function giftClass(value) {
        const text = String(value ?? "").trim().toLowerCase();

        if (text.includes("never gift")) {
            return "pill-never";
        }

        if (text.includes("limited trade")) {
            return "pill-limited";
        }

        if (text.includes("only gift")) {
            return "pill-only-gift";
        }

        return "";
    }

    function record(recordData) {
        const kind = recordData._kind;
        const show = get(recordData, "show") || "Untitled recording";
        const production = get(recordData, "production");
        const date = get(recordData, "date (yyyy-mm-dd)", "date");
        const master = get(recordData, "master");
        const cast = get(recordData, "cast");
        const notes = get(recordData, "notes");
        const myNotes = get(recordData, "my notes");
        const nft = get(recordData, "nft");
        const type = get(recordData, "type", "file type");
        const size = get(recordData, "size");
        const tracking = get(recordData, "tracked/untracked");
        const gift = get(recordData, "gift / limited trade", "gift/limited trade");
        const concert = get(recordData, "concert or not");
        const uncertain = get(recordData, "uncertain");
        const highlights = get(recordData, "highlights");
        const language = get(recordData, "language");
        const subtitles = get(recordData, "subtitles");

        const id = recordData._id;
        const line = [show, date, master, size].filter(has).join(" | ");
        const disabled = has(nft);
        const kindName = kind === "audio" ? "Audio" : "Video";

        let html =
            '<article class="record">' +
            '<div class="record-summary">' +
            '<input class="record-check" type="checkbox"' +
            '' +
            ' data-select-record="' + id + '"' +
            ' data-kind="' + kindName + '"' +
            ' data-line="' + escapeHTML(line) + '"' +
            (disabled ? ' disabled title="NFT EXCEPT THROUGH MASTER"' : "") +
            '>' +
            '<button type="button" class="record-summary-button">' +
            '<span class="record-summary-main">' +
            '<span class="record-show">' + escapeHTML(show) + "</span>" +
            pill(kindName, "pill-type") +
            '<span class="record-meta">' +
            escapeHTML([production, date].filter(has).join(" | ")) +
            "</span>" +
            '<span class="record-master">' +
            (has(master) ? "| " + escapeHTML(master) : "") +
            "</span>" +
            "</span>" +
            '<span class="chevron">⌄</span>' +
            "</button>" +
            "</div>" +
            '<div class="record-details" hidden>';

        html += '<div class="detail-line"><strong>' + escapeHTML(show) + "</strong> ";
        html += pill(concert === "Concert" ? "Concert" : "");
        html += "</div>";

        if (has(production) || has(date)) {
            html += '<div class="detail-line"><strong>' +
                escapeHTML([production, date].filter(has).join(" | ")) +
                "</strong> " +
                pill(uncertain.toLowerCase() === "yes" ? "Unsure date info" : "") +
                "</div>";
        }

        if (has(master)) {
            html += '<div class="detail-line"><span class="detail-label">Master:</span> ' +
                escapeHTML(master) + "</div>";
        }

        if (has(cast)) {
            html += '<div class="detail-line"><span class="detail-label">Cast:</span> ' +
                escapeHTML(cast) + "</div>";
        }

        if (has(notes)) {
            html += '<div class="detail-line"><span class="detail-label">Notes:</span> ' +
                escapeHTML(notes) + "</div>";
        }

        if (has(myNotes)) {
            html += '<div class="detail-line my-notes">My Notes: ' +
                escapeHTML(myNotes) + "</div>";
        }

        if (has(highlights)) {
            html += '<div class="detail-line"><span class="detail-label">Highlights:</span> ' +
                escapeHTML(highlights) + "</div>";
        }

        if (has(language)) {
            html += '<div class="detail-line"><span class="detail-label">Language:</span> ' +
                escapeHTML(language) + "</div>";
        }

        if (has(subtitles)) {
            html += '<div class="detail-line"><span class="detail-label">Subtitles:</span> ' +
                escapeHTML(subtitles) + "</div>";
        }

        html +=
            '<div class="record-pills">' +
            pill(type, "pill-type") +
            pill(size) +
            pill(tracking, "pill-tracking") +
            pill(gift, giftClass(gift)) +
            pill(nft, "pill-nft") +
            "</div>" +
            "</div>" +
            "</article>";

        return html;
    }

    function render() {
        const search = $("#home-search");
        const output = $("#home-results");
        const count = $("#home-result-count");
        const query = search.value.trim().toLowerCase();

        if (!query) {
            output.innerHTML = "";

            if (count) {
                count.textContent = "";
            }

            return;
        }

        let records = [];

        if (filter === "audio") {
            records = audio;
        } else if (filter === "video") {
            records = video;
        } else {
            records = audio.concat(video);
        }

        const matches = records.filter(function (recordData) {
            return Object.entries(recordData).some(function (entry) {
                const key = entry[0];
                const value = entry[1];

                return !key.startsWith("_") &&
                    String(value).toLowerCase().includes(query);
            });
        });

        if (count) {
            count.textContent = matches.length +
                " matching recording" +
                (matches.length === 1 ? "" : "s");
        }

        matches.sort(function (a, b) {
            return String(get(a, "show")).localeCompare(
                String(get(b, "show")),
                undefined,
                { sensitivity: "base" }
            );
        });

        const groups = new Map();

        matches.forEach(function (recordData, index) {
            const title = get(recordData, "title") || get(recordData, "tital");
            let groupName = title;

            if (!has(groupName)) {
                groupName = "Other recordings " + (index + 1);
            }

            if (!groups.has(groupName)) {
                groups.set(groupName, []);
            }

            groups.get(groupName).push(recordData);
        });

        let html = "";

        const groupEntries = Array.from(groups.entries());

        groupEntries.forEach(function (group, index) {
            const groupName = group[0];
            const items = group[1];

            let action = "";

            if (items.length > 1) {
                action =
                    '<button type="button" class="button group-detail-action" data-group-details hidden>' +
                    "Show all details" +
                    "</button>";
            }

            html +=
                '<section class="show-group" data-group="' + index + '">' +
                '<div class="group-heading">' +
                '<button type="button" class="group-toggle">' +
                '<span class="group-name">' + escapeHTML(groupName) + "</span>" +
                "</button>" +
                action +
                '<span class="count-pill">' + items.length + "</span>" +
                '<span class="chevron">⌄</span>' +
                "</div>" +
                '<div class="record-list" hidden>' +
                items.map(record).join("") +
                "</div>" +
                "</section>";
        });

        if (groupEntries.length) {
            output.innerHTML = html;
        } else {
            output.innerHTML = '<div class="empty-state">No matching recordings.</div>';
        }

        const selectedItems = window.GZYLZ_CART
            ? window.GZYLZ_CART.read()
            : [];

        const selectedIds = new Set(selectedItems.map(function (item) {
            return item.id;
        }));

        output.querySelectorAll("[data-select-record]").forEach(function (checkbox) {
            checkbox.checked = selectedIds.has(checkbox.dataset.selectRecord);
        });
    }

    $(".home-main").addEventListener("click", function (event) {
        const filterButton = event.target.closest("[data-search-filter]");

        if (filterButton) {
            filter = filterButton.dataset.searchFilter;

            document.querySelectorAll("[data-search-filter]").forEach(function (button) {
                button.classList.toggle("active", button === filterButton);
            });

            render();
            return;
        }

        const groupDetailsButton = event.target.closest("[data-group-details]");

        if (groupDetailsButton) {
            const group = groupDetailsButton.closest(".show-group");
            const open = groupDetailsButton.dataset.open !== "true";

            group.querySelectorAll(".record-details").forEach(function (details) {
                details.hidden = !open;

                const summary = details.previousElementSibling;
                summary.querySelector(".record-summary-button")
                summary.classList.toggle("open", open);
            });

            groupDetailsButton.dataset.open = String(open);
            groupDetailsButton.textContent = open
                ? "Hide all details"
                : "Show all details";

            event.stopPropagation();
            return;
        }

        const groupToggle = event.target.closest(".group-toggle");

        if (groupToggle) {
            const group = groupToggle.closest(".show-group");
            const list = group.querySelector(".record-list");
            const open = list.hidden;

            list.hidden = !open;
            group.classList.toggle("open", open);

            const action = group.querySelector("[data-group-details]");

            if (action) {
                action.hidden = !open;
                action.dataset.open = "false";
                action.textContent = "Show all details";
            }

            return;
        }

        const summaryButton = event.target.closest(".record-summary-button");

        if (summaryButton) {
            const details = summaryButton.parentElement.nextElementSibling;
            const open = details.hidden;

            details.hidden = !open;
            summaryButton.parentElement.classList.toggle("open", open);
        }
    });

    document.addEventListener("DOMContentLoaded", async function () {
        try {
            const results = await Promise.all([
                window.GZYLZ_DATA.loadRecords("audio"),
                window.GZYLZ_DATA.loadRecords("video")
            ]);

            audio = results[0];
            video = results[1];

            document.querySelectorAll("[data-audio-count]").forEach(function (element) {
                element.textContent = audio.length;
            });

            document.querySelectorAll("[data-video-count]").forEach(function (element) {
                element.textContent = video.length;
            });

            $("#home-search").addEventListener("input", render);

            document.querySelectorAll("[data-search-filter]").forEach(function (button) {
                button.classList.toggle(
                    "active",
                    button.dataset.searchFilter === "all"
                );
            });

            if (window.GZYLZ_CART) {
                window.GZYLZ_CART.update();
            }
        } catch (error) {
            const output = $("#home-results");

            if (output) {
                output.innerHTML =
                    '<div class="empty-state">Something went wrong…</div>';
            }
        }
    });
})();
