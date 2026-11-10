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

    function val(recordData, ...names) {
        return window.GZYLZ_DATA.get(recordData, ...names);
    }

    function has(value) {
        return String(value ?? "").trim() !== "";
    }

    function isTrue(value) {
        return String(value ?? "").trim().toLowerCase() === "true";
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

    function inline(value) {
        return escapeHTML(value)
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(
                /\{\{(#[0-9a-fA-F]{3,8})\}\}([\s\S]*?)\{\{\/color\}\}/g,
                '<span style="color:$1">$2</span>'
            )
            .replace(/\r\n?/g, "\n")
            .replace(/\n/g, "<br>");
    }

    function rich(value) {
        return String(value ?? "")
            .replace(/\r\n?/g, "\n")
            .split(/\n{2,}/)
            .map(function (paragraph) {
                return "<p>" + inline(paragraph) + "</p>";
            })
            .join("");
    }

    function pill(value, className = "") {
        if (!has(value)) {
            return "";
        }

        return '<span class="pill ' + className + '">' +
            inline(value) +
            "</span>";
    }

    function detail(label, value) {
        if (!has(value)) {
            return "";
        }

        return '<div class="detail-line">' +
            '<span class="detail-label">' + label + ':</span>' +
            '<div class="detail-value">' + rich(value) + "</div>" +
            "</div>";
    }

    function record(recordData) {
        const show = val(recordData, "show");
        const production = val(recordData, "production");
        const date = val(recordData, "date");
        const master = val(recordData, "master");
        const cast = val(recordData, "cast");
        const notes = val(recordData, "notes");
        const type = val(recordData, "file type");
        const size = val(recordData, "size");
        const neverGift = val(recordData, "never gift");
        const nft = val(recordData, "nft except through master");
        const highlights = val(recordData, "highlights");
        const concert = val(recordData, "concert");
        const subtitles = val(recordData, "includes subtitles");
        const language = val(recordData, "language");
        const limitedTrade = val(recordData, "limited trade 2:1");
        const limitedTrade3 = val(recordData, "limited trade 3:1");
        const onlyGift = val(recordData, "only gift");

        const id = recordData._id;
        const disabled = isTrue(nft);
        const line = [show, date, master, size].filter(has).join(" | ");

        let html =
            '<article class="record">' +
            '<div class="record-summary">' +
            '<input class="record-check" type="checkbox"' +
            '' +
            ' data-select-record="' + id + '"' +
            ' data-kind="Video"' +
            ' data-line="' + escapeHTML(line) + '"' +
            ' data-show="' + escapeHTML(show) + '"' +
            ' data-date="' + escapeHTML(date) + '"' +
            ' data-master="' + escapeHTML(master) + '"' +
            ' data-size="' + escapeHTML(size) + '"' +
            (disabled ? ' disabled title="NFT EXCEPT THROUGH MASTER"' : "") +
            ">" +
            '<button type="button" class="record-summary-button">' +
            '<span class="record-summary-main">' +
            '<span class="record-show">' + inline(show || "Untitled recording") + "</span>" +
            '<span class="record-submeta">' +
            [
                [production, date].filter(has).map(inline).join(" • "),
                has(master) ? inline(master) : ""
            ].filter(has).join(" | ") +
            "</span>" +
            "</span>" +
            '<span class="chevron">⌄</span>' +
            "</button>" +
            "</div>" +
            '<div class="record-details" hidden>';

        html += detail("Cast", cast);
        html += detail("Notes", notes);
        html += detail("Highlights", highlights);
        html += detail("Language", language);


        html +=
            '<div class="record-pills">' +
            pill(type, "pill-type") +
            pill(size) +
            (isTrue(neverGift) ? pill("Never Gift", "pill-never") : "") +
            (isTrue(limitedTrade) ? pill("Limited trade 2:1", "pill-limited") : "") +
            (isTrue(limitedTrade3) ? pill("Limited trade 3:1", "pill-limited") : "") +
            (isTrue(onlyGift) ? pill("Only Gift", "pill-only-gift") : "") +
            (isTrue(nft) ? pill("NFT except through master", "pill-nft") : "") +
            (isTrue(concert) ? pill("Concert", "pill-concert") : "") +
            (isTrue(subtitles) ? pill("Includes subtitles") : "") +
            "</div>" +
            "</div>" +
            "</article>";

        return html;
    }

    function render(rows) {
        const box = $("#video-records");
        const count = $("#video-count");

        count.textContent = rows.length;

        const groups = new Map();

        rows.forEach(function (recordData, index) {
            const title = val(recordData, "tital", "title");
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
            box.innerHTML = html;
        } else {
            box.innerHTML = '<div class="empty-state">0 video</div>';
        }

        const selectedItems = window.CART.read();
        const selectedIds = new Set(selectedItems.map(function (item) {
            return item.id;
        }));

        box.querySelectorAll("[data-select-record]").forEach(function (checkbox) {
            checkbox.checked = selectedIds.has(checkbox.dataset.selectRecord);
        });

        window.CART.update();
    }

    function setGroup(group, open, withDetails) {
        const list = group.querySelector(".record-list");
        const toggle = group.querySelector(".group-toggle");
        const action = group.querySelector("[data-group-details]");

        list.hidden = !open;
        group.classList.toggle("open", open);

        if (action) {
            action.hidden = !open;
            action.dataset.open = String(!!withDetails);
            action.textContent = withDetails
                ? "Hide all details"
                : "Show all details";
        }

        if (withDetails !== undefined) {
            group.querySelectorAll(".record-details").forEach(function (details) {
                details.hidden = !withDetails;

                const summary = details.previousElementSibling;
                summary.querySelector(".record-summary-button")
                summary.classList.toggle("open", withDetails);
            });
        }
    }

    $(".page-main").addEventListener("click", function (event) {
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

        const allDetailsButton = event.target.closest("[data-expand-details]");

        if (allDetailsButton) {
            const open = allDetailsButton.dataset.open !== "true";

            document.querySelectorAll(".show-group").forEach(function (group) {
                setGroup(group, true, open);
            });

            allDetailsButton.dataset.open = String(open);
            allDetailsButton.textContent = open
                ? "Hide all details"
                : "Show all details";

            return;
        }

        const expandButton = event.target.closest("[data-expand-all]");

        if (expandButton) {
            const open = expandButton.dataset.expandAll === "true";

            document.querySelectorAll(".show-group").forEach(function (group) {
                setGroup(group, open, undefined);
            });

            expandButton.textContent = open
                ? "Collapse groups"
                : "Expand groups";
            expandButton.dataset.expandAll = String(!open);

            return;
        }

        const groupToggle = event.target.closest(".group-toggle");

        if (groupToggle) {
            const group = groupToggle.closest(".show-group");
            const list = group.querySelector(".record-list");
            const open = list.hidden;

            setGroup(group, open, undefined);
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

    async function init() {
        try {
            const rows = await window.GZYLZ_DATA.loadRecords("video");
            render(rows);

            window.CART.update();
        } catch (error) {
            $("#video-records").innerHTML =
                '<div class="empty-state">Something went wrong…</div>';
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
