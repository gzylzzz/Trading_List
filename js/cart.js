(function () {
    const KEY = window.GZYLZ_CONFIG.cartStorageKey;

    function read() {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    }

    function write(items) {
        localStorage.setItem(KEY, JSON.stringify(items));
        update();
    }

    function escapeHTML(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function update() {
        const items = read();

        document.querySelectorAll("[data-cart-count]").forEach(function (element) {
            element.textContent = items.length;
        });

        document.querySelectorAll("[data-floating-copy]").forEach(function (element) {
            element.hidden = items.length === 0;
        });

        const selectedIds = new Set(items.map(function (item) {
            return item.id;
        }));

        document.querySelectorAll("[data-select-record]").forEach(function (checkbox) {
            checkbox.checked = selectedIds.has(checkbox.dataset.selectRecord);
        });

        const contact = document.getElementById("contact-content-copy");
        contact.innerHTML = window.GZYLZ_TEXT.getContactHTML();

        const box = document.getElementById("cart-content");

        if (items.length === 0) {
            box.innerHTML = '<p class="empty-state">empty</p>';
            return;
        }

        const kinds = ["Video", "Audio"];
        let html = "";

        kinds.forEach(function (kind) {
            const group = items.filter(function (item) {
                return item.kind === kind;
            });

            if (group.length === 0) {
                return;
            }

            html += '<section class="cart-section"><h3>[' + kind + ']</h3>';

            group.forEach(function (item) {
                html +=
                    '<div class="cart-item"><span>' +
                    escapeHTML(item.line) +
                    '</span><button type="button" data-remove="' +
                    escapeHTML(item.id) +
                    '">Remove</button></div>';
            });

            html += "</section>";
        });

        box.innerHTML = html;
    }

    function openCart() {
        const dialog = document.getElementById("cart-dialog");

        update();
        dialog.showModal();
    }

    document.querySelectorAll("[data-cart-open]").forEach(function (button) {
        button.addEventListener("click", openCart);
    });

    const dialog = document.getElementById("cart-dialog");

    dialog.addEventListener("click", function (event) {
        if (event.target.closest("[data-cart-close]")) {
            dialog.close();
            return;
        }

        if (event.target.closest("[data-cart-clear]")) {
            write([]);
            document.getElementById("copy-status").textContent = "";
            return;
        }

        const removeButton = event.target.closest("[data-remove]");

        if (removeButton) {
            const items = read().filter(function (item) {
                return item.id !== removeButton.dataset.remove;
            });

            write(items);
            return;
        }

        if (event.target.closest("[data-cart-copy]")) {
                const items = read();
                const kinds = ["Audio", "Video"];
                const sections = [];

                kinds.forEach(function (kind) {
                    const group = items.filter(function (item) {
                        return item.kind === kind;
                    });

                    if (group.length === 0) {
                        return;
                    }

                    const lines = group.map(function (item) {
                        let parts;

                        if (item.show !== undefined) {
                            parts = [
                                item.show,
                                item.date,
                                item.master,
                                item.size
                            ];
                        } else {
                            parts = String(item.line || "").split(" | ");
                        }

                        const show = parts[0] || "";
                        const details = parts.slice(1).filter(Boolean).join(" | ");

                        return "• " + show + (details ? "\n" + details : "");
                    });

                    sections.push("[" + kind + "]\n" + lines.join("\n\n"));
                });

                const output = sections.join("\n\n");
                const status = document.getElementById("copy-status");

                if (!output) {
                    status.textContent = "empty";
                    return;
                }

                navigator.clipboard.writeText(output).then(function () {
                    status.textContent = "Copied!";
                }).catch(function () {
                    status.textContent = "Copy is unavailable in this browser.";
                });
            }
    });

    const recordList = document.querySelector(
        "#home-results, #audio-groups, #video-records"
    );

    recordList.addEventListener("change", function (event) {
            const checkbox = event.target.closest("[data-select-record]");

            if (!checkbox) {
                return;
            }

            const items = read();
            const id = checkbox.dataset.selectRecord;

            if (checkbox.checked) {
                items.push({
                    id: id,
                    kind: checkbox.dataset.kind,
                    line: checkbox.dataset.line,
                    show: checkbox.dataset.show,
                    date: checkbox.dataset.date,
                    master: checkbox.dataset.master,
                    size: checkbox.dataset.size
                });
            } else {
                const index = items.findIndex(function (item) {
                    return item.id === id;
                });

                if (index !== -1) {
                    items.splice(index, 1);
                }
            }

            write(items);
    });

    document.addEventListener("DOMContentLoaded", update);

    window.CART = {
        read: read,
        update: update
    };
})();
