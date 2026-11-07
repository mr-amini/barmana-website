(() => {
  if (
    !("IntersectionObserver" in window) ||
    !matchMedia("(prefers-reduced-motion: no-preference)").matches
  )
    return;

  const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;

      target.style.setProperty("--team-delay", `${Math.min(delay, 160)}ms`);
      target.classList.replace("team-card-pending", "team-card-entering");
      observer.unobserve(target);
      delay += 40;
    }
  });

  document.querySelectorAll(".team-card").forEach((card) => {
    card.classList.add("team-card-pending");
    observer.observe(card);
  });
})();
