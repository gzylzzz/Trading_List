(function () {
    const $ = function (selector) {
        return document.querySelector(selector);
    };

    const esc = function (value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    };

    const val = function (record, ...names) {
        return window.GZYLZ_DATA.get(record, ...names);
    };

    const has = function (value) {
        return String(value ?? "").trim() !== "";
    };

    const isTrue = function (value) {
        return String(value ?? "").trim().toLowerCase() === "true";
    };

    const giftClass = function (value) {
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
    };

    const inline = function (value) {
        return esc(value)
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(
                /\{\{(#[0-9a-fA-F]{3,8})\}\}([\s\S]*?)\{\{\/color\}\}/g,
                '<span style="color:$1">$2</span>'
            )
            .replace(/\r\n?/g, "\n")
            .replace(/\n/g, "<br>");
    };

    const rich = function (value) {
        return String(value ?? "")
            .replace(/\r\n?/g, "\n")
            .split(/\n{2,}/)
            .map(function (paragraph) {
                return "<p>" + inline(paragraph) + "</p>";
            })
            .join("");
    };

    function pill(text, className = "") {
        if (!has(text)) {
            return "";
        }

        return '<span class="pill ' + className + '">' +
            inline(text) +
            "</span>";
    }

    function detail(label, value, className = "") {
        if (!has(value)) {
            return "";
        }

        return '<div class="detail-line ' + className + '">' +
            '<span class="detail-label">' + label + ':</span>' +
            '<div class="detail-value">' + rich(value) + "</div>" +
            "</div>";
    }

    function record(recordData) {
        const show = val(recordData, "show");
        const production = val(recordData, "production");
        const date = val(recordData, "date (yyyy-mm-dd)", "date");
        const master = val(recordData, "master");
        const cast = val(recordData, "cast");
        const notes = val(recordData, "notes");
        const myNotes = val(recordData, "my notes");
        const type = val(recordData, "type");
        const tracking = val(recordData, "tracked/untracked");
        const size = val(recordData, "size");
        const neverGift = val(recordData, "never gift");
        const nft = val(recordData, "nft except through master");
        const concert = val(recordData, "concert");
        const uncertain = val(recordData, "uncertain");
        const limitedTrade = val(recordData, "limited trade 2:1");
        const onlyGift = val(recordData, "only gift");

        const id = recordData._id;
        const disabled = isTrue(nft);

        const line = [show, date, master, size]
            .filter(has)
            .join(" | ");

        const checkbox =
            '<input class="record-check" type="checkbox"' +
            '' +
            ' data-select-record="' + id + '"' +
            ' data-kind="Audio"' +
            ' data-line="' + esc(line) + '"' +
            ' data-show="' + esc(show) + '"' +
            ' data-date="' + esc(date) + '"' +
            ' data-master="' + esc(master) + '"' +
            ' data-size="' + esc(size) + '"' +
            (disabled ? ' disabled title="NFT EXCEPT THROUGH MASTER"' : "") +
            ">";

        const summary =
            '<div class="record-summary">' +
            checkbox +
            '<button type="button" class="record-summary-button">' +
            '<span class="record-summary-main">' +
            '<span class="record-show">' +
            inline(show || "Untitled recording") +
            "</span>" +
            '<span class="record-submeta">' +
            [
                [production, date].filter(has).map(inline).join(" • "),
                has(master) ? inline(master) : ""
            ].filter(has).join(" | ") +
            "</span>" +
            "</span>" +
            '<span class="chevron">⌄</span>' +
            '</button>' +
            "</div>";

        const details =
            '<div class="record-details" hidden>' +
            detail("Cast", cast) +
            detail("Notes", notes) +
            detail("My Notes", myNotes, "my-notes") +
            '<div class="record-pills">' +
            pill(type, "pill-type") +
            pill(size) +
            pill(tracking, "pill-tracking") +
            (isTrue(neverGift) ? pill("Never Gift", "pill-never") : "") +
            (isTrue(limitedTrade) ? pill("Limited trade 2:1", "pill-limited") : "") +
            (isTrue(onlyGift) ? pill("Only Gift", "pill-only-gift") : "") +
            (isTrue(nft) ? pill("NFT except through master", "pill-nft") : "") +
            (isTrue(concert) ? pill("Concert", "pill-concert") : "") +
            (isTrue(uncertain) ? pill("Unsure date info", "pill-uncertain") : "") +
            "</div>" +
            "</div>";

        return '<article class="record">' +
            summary +
            details +
            "</article>";
    }

    function render(rows) {
        const box = $("#audio-groups");
        const count = $("#audio-count");

        count.textContent = rows.length;

        const groups = new Map();

        rows.forEach(function (recordData, index) {
            const title = val(recordData, "title");

            let groupName = title;

            if (!has(groupName)) {
                groupName = "Other recordings " + (index + 1);
            }

            if (!groups.has(groupName)) {
                groups.set(groupName, []);
            }

            groups.get(groupName).push(recordData);
        });

        if (groups.size === 0) {
            box.innerHTML = '<div class="empty-state">0 audio</div>';
            return;
        }

        let html = "";

        Array.from(groups.entries()).forEach(function (group, index) {
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
                '<button class="group-toggle" type="button">' +
                '<span class="group-name">' + esc(groupName) + "</span>" +
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

        box.innerHTML = html;

        if (window.GZYLZ_CART) {
            const selectedItems = window.GZYLZ_CART.read();
            const selectedIds = new Set(
                selectedItems.map(function (item) {
                    return item.id;
                })
            );

            box.querySelectorAll("[data-select-record]").forEach(function (checkbox) {
                checkbox.checked = selectedIds.has(checkbox.dataset.selectRecord);
            });

            window.GZYLZ_CART.update();
        }
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

                summary.classList.toggle("open", !!withDetails);
            });
        }
    }

    document.querySelector(".page-main").addEventListener("click", function (event) {
        const localButton = event.target.closest("[data-group-details]");

        if (localButton) {
            const group = localButton.closest(".show-group");
            const open = localButton.dataset.open !== "true";

            group.querySelectorAll(".record-details").forEach(function (details) {
                details.hidden = !open;

                const summary = details.previousElementSibling;

                summary.classList.toggle("open", open);
            });

            localButton.dataset.open = String(open);

            localButton.textContent = open
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

        const summary = event.target.closest(".record-summary-button");

        if (summary) {
            const details = summary.parentElement.nextElementSibling;
            const open = details.hidden;

            details.hidden = !open;

            summary.parentElement.classList.toggle("open", open);
        }
    });

    async function init() {
        try {
            const rows = await window.GZYLZ_DATA.loadRecords("audio");

            render(rows);

            if (window.GZYLZ_CART) {
                window.GZYLZ_CART.update();
            }
        } catch (error) {
            $("#audio-groups").innerHTML =
                '<div class="empty-state">Something went wrong…</div>';
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();