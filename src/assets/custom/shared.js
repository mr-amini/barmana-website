(() => {
  const groups = [...document.querySelectorAll(".bm-dropdown")];
  const close = (group) => {
    group.classList.remove("is-open");
    group.querySelector("button").setAttribute("aria-expanded", "false");
  };
  const open = (group) => {
    groups.filter((x) => x !== group).forEach(close);
    group.classList.add("is-open");
    group.querySelector("button").setAttribute("aria-expanded", "true");
  };
  groups.forEach((group) => {
    const button = group.querySelector("button");
    button.addEventListener("click", (e) => {
      if (
        e.detail > 0 &&
        matchMedia("(hover: hover)").matches &&
        group.matches(":hover")
      ) {
        open(group);
        return;
      }
      group.classList.contains("is-open") ? close(group) : open(group);
    });
    group.addEventListener("mouseenter", (e) => {
      if (matchMedia("(hover: hover)").matches) open(group);
    });
    group.addEventListener("mouseleave", () => close(group));
    group.addEventListener("focusout", (e) => {
      if (!group.contains(e.relatedTarget)) close(group);
    });
    group.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close(group);
        button.focus();
      }
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".bm-dropdown")) groups.forEach(close);
  });
  document.querySelectorAll(".bm-language select").forEach((s) =>
    s.addEventListener("change", () => {
      if (s.value) location.href = s.value;
    }),
  );
})();
if (
  document.documentElement.lang === "fa" &&
  !document.body.classList.contains("company-page")
) {
  const dict = {
    "Nice to meet you *": "نام و نام خانوادگی *",
    "Nice to meet you": "نام و نام خانوادگی",
    "Email address": "ایمیل",
    Optional: "اختیاری",
    Subject: "موضوع",
    Origin: "مبدأ",
    Destination: "مقصد",
    "Seaport, city or country": "بندر، شهر یا کشور",
    "Cargo Details": "جزئیات محموله",
    Submit: "ارسال",
    Previous: "قبلی",
    Next: "بعدی",
    "View slide 1": "نمایش اسلاید ۱",
    "View slide 2": "نمایش اسلاید ۲",
    "View slide 3": "نمایش اسلاید ۳",
    "I am bound by the terms of the Service I accept Privacy Policy":
      "شرایط استفاده و حریم خصوصی را می‌پذیرم",
  };
  function localize() {
    document.querySelectorAll("main, footer, .lqd-gdpr").forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        if (["SCRIPT", "STYLE"].includes(n.parentElement.tagName)) continue;
        const v = n.nodeValue.trim();
        if (dict[v]) n.nodeValue = n.nodeValue.replace(v, dict[v]);
      }
      root
        .querySelectorAll("[placeholder],[aria-label],[title]")
        .forEach((el) =>
          ["placeholder", "aria-label", "title"].forEach((a) => {
            const v = el.getAttribute(a);
            if (dict[v]) el.setAttribute(a, dict[v]);
          }),
        );
    });
  }
  new MutationObserver(localize).observe(document.body, {
    childList: true,
    subtree: true,
  });
  localize();
}
(() => {
  const header = document.querySelector(".bm-header");
  if (!header) return;
  const update = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 60);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

(() => {
  const button = document.querySelector(".bm-mobile-toggle"),
    nav = document.querySelector(".bm-inline-nav");
  if (!button || !nav) return;
  const close = () => {
    nav.classList.remove("mobile-open");
    button.setAttribute("aria-expanded", "false");
  };
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("mobile-open", open);
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      button.getAttribute("aria-expanded") === "true" &&
      !document.querySelector(".bm-dropdown.is-open")
    ) {
      close();
      button.focus();
    }
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });
  matchMedia("(min-width: 761px)").addEventListener("change", close);
})();

if (matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  document
    .querySelectorAll(".elementor-element-2cb8f36 figure")
    .forEach((figure) => {
      const hook = figure.querySelector('img[src$="/barmana-container.webp"]');
      if (!hook) return;
      const container = hook.cloneNode();
      container.alt = "";
      container.setAttribute("aria-hidden", "true");
      container.classList.add("container-swing");
      hook.classList.add("container-hook");
      figure.classList.add("container-rig");
      figure.append(container);

      let clickSwing;
      figure.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        const bounds = figure.getBoundingClientRect();
        const position = Math.max(
          -1,
          Math.min(1, (2 * (event.clientX - bounds.left)) / bounds.width - 1),
        );
        figure.style.setProperty("--container-tilt", `${position * 2.25}deg`);
      });
      figure.addEventListener("pointerleave", () => {
        figure.style.removeProperty("--container-tilt");
      });

      figure.addEventListener("click", (event) => {
        const bounds = figure.getBoundingClientRect();
        const direction =
          event.clientX >= bounds.left + bounds.width / 2 ? 1 : -1;
        const current = getComputedStyle(container).rotate;
        clickSwing?.cancel();
        const resting =
          figure.style.getPropertyValue("--container-tilt") || "0deg";
        clickSwing = container.animate(
          [
            {
              rotate: current === "none" ? "0deg" : current,
              offset: 0,
              easing: "cubic-bezier(.2,.65,.3,1)",
            },
            {
              rotate: `${direction * 5.5}deg`,
              offset: 0.46,
              easing: "cubic-bezier(.4,0,.2,1)",
            },
            { rotate: resting, offset: 1 },
          ],
          { duration: 950 },
        );
      });
    });
}

document
  .querySelectorAll(".elementor-element-2cb8f36 figure")
  .forEach((figure) => {
    if (!figure.querySelector('img[src$="/barmana-container.webp"]')) return;

    const stage = figure.parentElement;
    stage.classList.add("container-scroll-stage");
    const tagline = document.createElement("p");
    tagline.className = "container-tagline";
    const isPersian = document.documentElement.lang === "fa";
    tagline.lang = isPersian ? "fa" : "en";
    tagline.dir = isPersian ? "rtl" : "ltr";
    tagline.textContent = isPersian
      ? "هنر هماهنگی در هر مسیر"
      : "Logistics, finely orchestrated";
    stage.append(tagline);

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let previousTime = null;
    let progress = 0;

    function render(time) {
      frame = 0;
      const viewport = window.innerHeight;
      const bounds = stage.getBoundingClientRect();
      const target = Math.max(
        0,
        Math.min(
          1,
          window.scrollY / 280,
          (0.98 * viewport - bounds.top) / (0.75 * viewport),
        ),
      );
      const elapsed =
        previousTime === null ? 16 : Math.min(time - previousTime, 32);
      const difference = target - progress;
      progress =
        Math.abs(difference) < 0.001
          ? target
          : progress + difference * (1 - Math.exp(-elapsed / 145));
      previousTime = time;
      stage.style.setProperty(
        "--rig-lift",
        `${-progress * Math.min(108, bounds.width * 0.15)}px`,
      );
      stage.classList.toggle(
        "is-tagline-visible",
        window.scrollY > 0 && figure.getBoundingClientRect().bottom <= viewport,
      );
      if (progress !== target) schedule();
      else previousTime = null;
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
  });

document
  .querySelectorAll('img[src$="/testimonial-portrait-1.jpg"]')
  .forEach((firstPortrait) => {
    const row = firstPortrait.closest(".lqd-group-carousel")?.parentElement;
    const dots = row?.querySelector(".lqd-carousel-dots");
    if (!dots) return;

    const portraits = [
      ...row.querySelectorAll('img[src*="/testimonial-portrait-"]'),
    ];
    const sources = portraits.map((portrait) => portrait.getAttribute("src"));
    function syncPortrait() {
      const buttons = [...dots.querySelectorAll(".lqd-carousel-dot")];
      const index = buttons.findIndex(
        (button) => button.getAttribute("aria-current") === "step",
      );
      const source = sources[index];
      if (!source) return;
      portraits.forEach((portrait) => {
        if (portrait.getAttribute("src") !== source)
          portrait.setAttribute("src", source);
      });
    }

    new MutationObserver(syncPortrait).observe(dots, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-current"],
    });
    syncPortrait();
  });
