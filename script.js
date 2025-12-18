document.addEventListener("DOMContentLoaded", () => {
  // ===== Year in footer =====
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ===== Smooth scroll buttons =====
  const orderButton = document.getElementById("orderButton");
  const giftButton = document.getElementById("giftButton");
  const orderSection = document.getElementById("order");
  const giftSection = document.getElementById("gift");

  if (orderButton && orderSection) {
    orderButton.addEventListener("click", () => {
      orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (giftButton && giftSection) {
    giftButton.addEventListener("click", () => {
      giftSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // ===== Email + templates =====
  const EMAIL = "polovinkanasta@gmail.com";

  function buildMailto(subject, body) {
    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    return `mailto:${EMAIL}?subject=${s}&body=${b}`;
  }

  const orderTpl = document.getElementById("orderTemplate");
  const emailOrderBtn = document.getElementById("emailOrderBtn");
  if (emailOrderBtn && orderTpl) {
    emailOrderBtn.setAttribute(
      "href",
      buildMailto("Хочу ASMR видео", orderTpl.textContent.trim())
    );
  }

  const giftTpl = document.getElementById("giftTemplate");
  const emailGiftBtn = document.getElementById("emailGiftBtn");
  if (emailGiftBtn && giftTpl) {
    emailGiftBtn.setAttribute(
      "href",
      buildMailto("Подарок", giftTpl.textContent.trim())
    );
  }

  // ===== Copy-to-clipboard =====
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const selector = btn.getAttribute("data-copy");
      const el = selector ? document.querySelector(selector) : null;
      if (!el) return;

      const text = (el.textContent || "").trim();
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        showCopied(btn);
      } catch (err) {
        // fallback
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
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

  // ===== ASMR AUDIO UX =====
  const bgAudio = document.getElementById("bgAudio");
  const audioToggle = document.getElementById("audioToggle");

  if (!bgAudio || !audioToggle) return;

  let isOn = false;
  let fadeTimer = null;

  const TARGET_VOLUME = 0.12; // тихо
  const FADE_MS = 1200;
  const PULSE_MS = 8000;

  // Always start muted (autoplay policies)
  bgAudio.muted = true;
  bgAudio.volume = 0;

  // Hint under button
  const hint = document.createElement("div");
  hint.className = "audio-hint";
  hint.textContent = "Нажми — включу атмосферу (тихо)";
  audioToggle.insertAdjacentElement("afterend", hint);

  // Pulse for first seconds
  audioToggle.classList.add("audio-pulse");
  const pulseTimeout = window.setTimeout(() => {
    audioToggle.classList.remove("audio-pulse");
  }, PULSE_MS);

  function stopPulse() {
    window.clearTimeout(pulseTimeout);
    audioToggle.classList.remove("audio-pulse");
  }

  function setHint(text) {
    hint.textContent = text;
  }

  function clearFade() {
    if (fadeTimer) {
      window.clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }

  function fadeTo(audio, toVolume, durationMs) {
    clearFade();

    const from = audio.volume || 0;
    const diff = toVolume - from;
    const stepMs = 30;
    const steps = Math.max(1, Math.floor(durationMs / stepMs));
    let i = 0;

    fadeTimer = window.setInterval(() => {
      i += 1;
      const t = i / steps;
      audio.volume = Math.max(0, Math.min(1, from + diff * t));

      if (i >= steps) {
        clearFade();
        audio.volume = toVolume;
      }
    }, stepMs);
  }

  async function turnOn() {
    try {
      // user gesture click -> allowed to start playback
      bgAudio.muted = false;

      // If not started yet, start it
      if (bgAudio.paused) {
        await bgAudio.play();
      }

      fadeTo(bgAudio, TARGET_VOLUME, FADE_MS);

      isOn = true;
      audioToggle.classList.add("is-on");
      audioToggle.textContent = "🔇 Выключить звук";
      setHint("Звук очень тихий. Можно выключить в любой момент.");
      stopPulse();
    } catch (e) {
      // If browser blocked for some reason, keep hint helpful
      bgAudio.muted = true;
      bgAudio.volume = 0;
      isOn = false;
      audioToggle.classList.remove("is-on");
      setHint("Если звук не включился — попробуй нажать ещё раз.");
      console.warn("Audio play blocked:", e);
    }
  }

  function turnOff() {
    // Smoothly fade out then mute
    fadeTo(bgAudio, 0, 300);
    window.setTimeout(() => {
      bgAudio.muted = true;
      bgAudio.volume = 0;
    }, 320);

    isOn = false;
    audioToggle.classList.remove("is-on");
    audioToggle.textContent = "🔊 Атмосфера";
    setHint("Нажми — включу атмосферу (тихо)");
  }

  audioToggle.addEventListener("click", async () => {
    if (!isOn) await turnOn();
    else turnOff();
  });

  // Optional: if user switches tab, don't scream (keep tiny)
  document.addEventListener("visibilitychange", () => {
    if (!bgAudio) return;
    if (document.hidden && isOn) {
      bgAudio.volume = Math.min(bgAudio.volume, TARGET_VOLUME);
    }
  });
});
