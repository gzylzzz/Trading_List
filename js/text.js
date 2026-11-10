(function () {
    let content = {
        status: "",
        rules: "",
        wants: "",
        contact: "",
        readMe: "",
        footer: ""
    };

    function clean(value) {
        return String(value ?? "").trim();
    }

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

    function format(value, keepLineBreaks) {
        let result = escapeHTML(value)
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(
                /\{\{(#[0-9a-fA-F]{3,8})\}\}([\s\S]*?)\{\{\/color\}\}/g,
                '<span style="color:$1">$2</span>'
            );

        if (keepLineBreaks !== false) {
            result = result.replace(/\r?\n/g, "<br>");
        }

        return result;
    }

    function cell(row, key) {
        return clean(row[key]);
    }

    async function load() {
        try {
            const response = await fetch(window.GZYLZ_CONFIG.textFile);

            if (!response.ok) {
                throw new Error("Could not load text.csv");
            }

            const rows = window.GZYLZ_DATA.parseCSV(await response.text());

            if (rows.length < 2) {
                throw new Error("The text file has no content row.");
            }

            const headers = rows[0].map(function (value) {
                return String(value || "")
                    .replace(/^\uFEFF/, "")
                    .replace(/\r/g, "")
                    .trim()
                    .toLowerCase();
            });

            const data = [];

            rows.slice(1).forEach(function (cells) {
                const row = {};

                headers.forEach(function (header, index) {
                    if (header) {
                        row[header] = cells[index] ?? "";
                    }
                });

                data.push(row);
            });

            const first = data[0] || {};

            function collect() {
                const keys = Array.from(arguments);
                const values = [];

                data.forEach(function (row) {
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];

                        if (Object.prototype.hasOwnProperty.call(row, key)) {
                            const value = cell(row, key);

                            if (value) {
                                values.push(value);
                            }

                            break;
                        }
                    }
                });

                return values;
            }

            content = {
                status: collect("statues", "status").join("\n\n"),
                rules: collect("rules").join("\n\n"),
                wants: collect("wants").join("\n\n"),
                contact: collect("contact").join("\n"),
                readMe: cell(first, "read me") || cell(first, "home"),
                footer: collect("footer").join("\n\n")
            };

            const status = document.getElementById("status-content");
            const rules = document.getElementById("rules-content");
            const wants = document.getElementById("wants-content");

            if (status) {
                status.innerHTML = format(content.status);
            }

            if (rules) {
                rules.innerHTML = format(content.rules);
            }

            if (wants) {
                const cards = [];

                data.forEach(function (row) {
                    const body = cell(row, "wants");

                    if (!body) {
                        return;
                    }

                    const title = cell(row, "wants title") || cell(row, "want title");
                    let card = '<section class="wants-card">';

                    if (title) {
                        card += "<h2>" + format(title) + "</h2>";
                    }

                    card += '<div class="wants-card-content">' +
                        format(body) +
                        "</div></section>";

                    cards.push(card);
                });

                if (cards.length) {
                    wants.innerHTML = cards.join("");
                } else {
                    wants.innerHTML =
                        '<div class="empty-state">No wants added yet.</div>';
                }
            }

            const readMe = document.getElementById("readme-content");

            if (readMe) {
                readMe.innerHTML = format(content.readMe);
            }

            if (!content.readMe) {
                const card = document.getElementById("readme");

                if (card) {
                    card.hidden = true;
                }
            }

            const footer = document.getElementById("site-footer");

            if (footer) {
                footer.innerHTML = content.footer
                    ? format(content.footer)
                    : "gzylz";
            }

            const contact = document.getElementById("contact-content-copy");

            if (contact) {
                contact.innerHTML = format(content.contact, false);
            }

            if (window.CART) {
                window.CART.update();
            }
        } catch (error) {
            console.error("Unable to load text file:", error);
        }

        return content;
    }

    window.GZYLZ_TEXT = {
        load: load,
        getContactHTML: function () {
            return format(content.contact, false);
        }
    };

    document.addEventListener("DOMContentLoaded", load);
})();
