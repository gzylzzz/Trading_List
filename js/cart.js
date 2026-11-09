(function () {
    const KEY = window.GZYLZ_CONFIG.cartStorageKey;

    function read() {
        try {
            return JSON.parse(localStorage.getItem(KEY) || "[]");
        } catch {
            return [];
        }
    }

    function write(items) {
        localStorage.setItem(KEY, JSON.stringify(items));
        update();
    }

    function safe(s) {
        return String(s || "").replace(/[&<>"']/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c]));
    }

    function update() {
        const items = read();

        document.querySelectorAll("[data-cart-count]").forEach(e => {
            e.textContent = items.length;
        });

        document.querySelectorAll("[data-floating-copy]").forEach(e => {
            e.hidden = items.length === 0;
        });

        const selected = new Set(items.map(x => x.id));

        document.querySelectorAll("[data-select-record]").forEach(cb => {
            cb.checked = selected.has(cb.dataset.selectRecord);
        });

        const contact = document.getElementById("contact-content-copy");

        if (contact) {
            contact.innerHTML = window.GZYLZ_TEXT
                ? window.GZYLZ_TEXT.getContactHTML()
                : "";
        }

        const box = document.getElementById("cart-content");

        if (!box) return;

        if (!items.length) {
            box.innerHTML = '<p class="empty-state">empty</p>';
            return;
        }

        box.innerHTML = ["Video", "Audio"].map(kind => {
            const group = items.filter(x => x.kind === kind);

            if (!group.length) return "";

            return '<section class="cart-section"><h3>[' + kind + ']</h3>' +
                group.map(x =>
                    '<div class="cart-item"><span>' +
                    safe(x.line) +
                    '</span><button type="button" data-remove="' +
                    safe(x.id) +
                    '" aria-label="Remove item">Remove</button></div>'
                ).join("") +
                '</section>';
        }).join("");
    }

    function open() {
        const d = document.getElementById("cart-dialog");

        if (d) {
            update();
            d.showModal();
        }
    }

    document.querySelectorAll("[data-cart-open]").forEach(button => {
        button.addEventListener("click", open);
    });

    const dialog = document.getElementById("cart-dialog");

    dialog.addEventListener("click", e => {
        if (e.target.closest("[data-cart-close]")) {
            dialog.close();
        }

        if (e.target.closest("[data-cart-clear]")) {
            write([]);

            const status = document.getElementById("copy-status");

            if (status) status.textContent = "";
        }

        const remove = e.target.closest("[data-remove]");

        if (remove) {
            write(read().filter(x => x.id !== remove.dataset.remove));
        }

        if (e.target.closest("[data-cart-copy]")) {
            const items = read();

            const list = ["Audio", "Video"].map(k => {
                const group = items.filter(x => x.kind === k);

                if (!group.length) return "";

                return "[" + k + "]\n" + group.map(x => {
                    const parts = x.show !== undefined
                        ? [x.show, x.date, x.master, x.size]
                        : String(x.line || "").split(" | ");

                    const show = parts[0] || "";
                    const details = parts.slice(1).filter(Boolean).join(" | ");

                    return "• " + show + (details ? "\n" + details : "");
                }).join("\n\n");
            }).filter(Boolean).join("\n\n");

            const output = list;
            const status = document.getElementById("copy-status");

            if (!output) {
                if (status) status.textContent = "empty";
                return;
            }

            navigator.clipboard.writeText(output).then(() => {
                if (status) status.textContent = "Copied!";
            }).catch(() => {
                if (status) status.textContent = "Copy is unavailable in this browser.";
            });
        }
    });

    const recordList = document.querySelector("#home-results, #audio-groups, #video-records");

    recordList.addEventListener("change", e => {
        const cb = e.target.closest("[data-select-record]");

        if (!cb) return;

        const items = read();
        const id = cb.dataset.selectRecord;

        if (cb.checked) {
            if (!items.some(x => x.id === id)) {
                items.push({
                    id,
                    kind: cb.dataset.kind,
                    line: cb.dataset.line,
                    show: cb.dataset.show,
                    date: cb.dataset.date,
                    master: cb.dataset.master,
                    size: cb.dataset.size
                });
            }
        } else {
            const i = items.findIndex(x => x.id === id);

            if (i >= 0) {
                items.splice(i, 1);
            }
        }

        write(items);
    });

    document.addEventListener("DOMContentLoaded", () => {
        const selected = new Set(read().map(x => x.id));

        document.querySelectorAll("[data-select-record]").forEach(cb => {
            cb.checked = selected.has(cb.dataset.selectRecord);
        });

        update();
    });

    window.GZYLZ_CART = { read, update };
})();