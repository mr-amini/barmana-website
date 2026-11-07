/* Barmana company pages: no analytics, remote submission or personal-data storage. */
const fa = document.documentElement.lang === "fa";
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#company-nav");
function closeMenu() {
  nav?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
}
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    menuButton?.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});
nav?.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});
matchMedia("(min-width:1101px)").addEventListener("change", closeMenu);
const search = document.querySelector("#faq-search");
if (search) {
  const items = [...document.querySelectorAll(".faq-item")];
  const filters = [...document.querySelectorAll(".filter")];
  let category = "all";
  const normalize = (s) =>
    s
      .toLowerCase()
      .replaceAll("ي", "ی")
      .replaceAll("ك", "ک")
      .replaceAll("\u200c", " ");
  function filter() {
    const q = normalize(search.value.trim());
    let count = 0;
    items.forEach((item) => {
      const show =
        (category === "all" || item.dataset.category === category) &&
        normalize(item.textContent).includes(q);
      item.hidden = !show;
      if (show) count++;
    });
    document.querySelector("#faq-count").textContent = fa
      ? `${count.toLocaleString("fa-IR")} پاسخ`
      : `${count} answers`;
    document.querySelector("#faq-empty").hidden = count !== 0;
  }
  search.addEventListener("input", filter);
  filters.forEach((b) =>
    b.addEventListener("click", () => {
      category = b.dataset.category;
      filters.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      filter();
    }),
  );
  document.querySelector("#faq-reset").addEventListener("click", () => {
    search.value = "";
    category = "all";
    filters.forEach((x) =>
      x.setAttribute("aria-pressed", String(x.dataset.category === "all")),
    );
    filter();
    search.focus();
  });
  filter();
}
document.querySelectorAll("form[data-enquiry]").forEach((form) => {
  const review = form.querySelector(".form-review");
  const list = review.querySelector("dl");
  const status = form.querySelector(".form-status");
  let draft = "";
  form.addEventListener("input", () => {
    review.hidden = true;
    draft = "";
    status.textContent = "";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    list.replaceChildren();
    const lines = [
      fa ? "درخواست بارمانا — ارسال نشده" : "Barmana enquiry — not submitted",
      "",
    ];
    [...form.elements]
      .filter(
        (el) =>
          el.name && !el.disabled && !["submit", "button"].includes(el.type),
      )
      .forEach((el) => {
        const label = el.labels?.[0]?.textContent.trim() || el.name;
        const value =
          el.tagName === "SELECT"
            ? el.selectedOptions[0]?.textContent
            : el.value.trim();
        if (!value) return;
        const row = document.createElement("div");
        row.className = "review-row";
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value;
        row.append(dt, dd);
        list.append(row);
        lines.push(`${label}: ${value}`);
      });
    draft = lines.join("\n");
    review.hidden = false;
    review.querySelector("h3").focus();
    review.scrollIntoView({
      block: "start",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  });
  review.querySelector("[data-edit]").addEventListener("click", () => {
    review.hidden = true;
    form.querySelector("input,select,textarea").focus();
  });
  review.querySelector("[data-download]").addEventListener("click", () => {
    if (!draft) return;
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + draft], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `barmana-${form.dataset.enquiry}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = fa
      ? "فایل درخواست آماده شد. هنوز چیزی برای شرکت ارسال نشده است."
      : "Your request file is ready. Nothing has been sent to the company.";
  });
});
