document.addEventListener("DOMContentLoaded", () => {
  // Год в футере
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Скроллы
  const orderButton = document.getElementById("orderButton");
  const giftButton = document.getElementById("giftButton");
  const orderSection = document.getElementById("order");
  const giftSection = document.getElementById("gift");

  if (orderButton && orderSection) {
    orderButton.addEventListener("click", () => {
      orderSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (giftButton && giftSection) {
    giftButton.addEventListener("click", () => {
      giftSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Email
  const EMAIL = "polovinkanasta@gmail.com";

  const emailText = document.getElementById("emailText");
  if (emailText) emailText.textContent = EMAIL;

  function buildMailto(subject, body) {
    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    return `mailto:${EMAIL}?subject=${s}&body=${b}`;
  }

  // Заказ
  const orderTpl = document.getElementById("orderTemplate");
  const emailOrderBtn = document.getElementById("emailOrderBtn");
  if (emailOrderBtn && orderTpl) {
    emailOrderBtn.setAttribute(
      "href",
      buildMailto("Хочу ASMR видео", orderTpl.textContent.trim())
    );
  }

  // Подарок
  const giftTpl = document.getElementById("giftTemplate");
  const emailGiftBtn = document.getElementById("emailGiftBtn");
  if (emailGiftBtn && giftTpl) {
    emailGiftBtn.setAttribute(
      "href",
      buildMailto("Подарок", giftTpl.textContent.trim())
    );
  }

  // Copy-to-clipboard buttons
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const selector = btn.getAttribute("data-copy");
      const el = document.querySelector(selector);
      if (!el) return;

      const text = el.textContent.trim();

      try {
        await navigator.clipboard.writeText(text);
        showCopied(btn);
      } catch (err) {
        // fallback
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showCopied(btn);
      }
    });
  });

  function showCopied(btn) {
    const oldText = btn.textContent;
    btn.classList.add("is-copied");
    btn.textContent = "Скопировано";

    window.setTimeout(() => {
      btn.classList.remove("is-copied");
      btn.textContent = oldText;
    }, 1400);
  }
});
