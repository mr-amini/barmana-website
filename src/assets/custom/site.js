/* Customize behavior here. The downloaded theme retains its animations and menus. */
// Static hosting has no WordPress form backend. Do not send visitor details to the demo.
document.addEventListener(
  "submit",
  (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    let status = form.querySelector(".local-form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "local-form-status";
      status.setAttribute("role", "status");
      form.append(status);
    }
    status.textContent =
      "This form is not connected yet. Please contact us by email.";
  },
  true,
);
