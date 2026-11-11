/* =========================================================
   ELISA LE RESTO — Scripts (vanilla JS, aucune dépendance)
   ========================================================= */

/* ---- Réglages rapides ---- */
const CONFIG = {
  // Numéro WhatsApp au format international SANS + ni espaces (ex. "33612345678").
  // Laisser vide pour masquer le bouton WhatsApp de la barre mobile.
  whatsapp: "",
  whatsappMessage: "Bonjour, je souhaite des informations sur Elisa le Resto.",
  // Horaires : jour (0 = dimanche … 6 = samedi) → [ouverture, fermeture] en heures décimales
  hours: { 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [9, 18] },
};

document.addEventListener("DOMContentLoaded", () => {
  /* ---- Images : si la photo JPG est absente, on affiche le visuel de remplacement ---- */
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    const useFallback = () => { if (img.dataset.fallback && !img.src.endsWith(img.dataset.fallback)) img.src = img.dataset.fallback; };
    if (img.complete && img.naturalWidth === 0) useFallback();
    else img.addEventListener("error", useFallback, { once: true });
  });

  /* ---- Menu burger ---- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 960px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---- Ombre de l'en-tête au défilement ---- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Onglets de la carte (accessibles au clavier) ---- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (dir) { e.preventDefault(); selectTab(tabs[(i + dir + tabs.length) % tabs.length], true); }
    });
  });
  // Lien « Commander un traiteur » → ouvre l'onglet traiteur
  document.querySelectorAll("[data-tab-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const tab = document.getElementById("tab-" + link.dataset.tabLink);
      if (tab) selectTab(tab);
    });
  });

  /* ---- Statut « ouvert / fermé » + jour en surbrillance ---- */
  const now = new Date();
  const day = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  const status = document.getElementById("status");
  const today = CONFIG.hours[day];
  if (today && h >= today[0] && h < today[1]) {
    status.textContent = `Ouvert maintenant · jusqu’à ${today[1]}h`;
    status.classList.add("is-open");
  } else {
    let next = 1;
    while (!CONFIG.hours[(day + next) % 7] && next < 7) next++;
    const isLaterToday = today && h < today[0];
    const nextDay = isLaterToday ? day : (day + next) % 7;
    const names = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const when = isLaterToday ? "aujourd’hui" : next === 1 ? "demain" : names[nextDay];
    status.textContent = `Fermé · ouvre ${when} à ${CONFIG.hours[nextDay][0]}h`;
    status.classList.add("is-closed");
  }
  const row = document.querySelector(`.hours tr[data-day="${day}"]`);
  if (row) row.classList.add("is-today");

  /* ---- WhatsApp ---- */
  const wa = document.getElementById("wa-btn");
  if (CONFIG.whatsapp) {
    wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
    wa.hidden = false;
  }

  /* ---- Lien actif dans la navigation ---- */
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  /* ---- Apparition douce au défilement ---- */
  const revealEls = document.querySelectorAll(".section__head, .trio__item, .slate, .about__media, .about__text, .gallery__grid li, .review, .contact__grid > *");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }

  /* ---- Galerie : visionneuse ---- */
  const lightbox = document.getElementById("lightbox");
  const lbImg = lightbox.querySelector("img");
  document.querySelectorAll(".gallery__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.showModal();
    });
  });
  lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });

  /* ---- Formulaire Web3Forms ---- */
  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = form.querySelector('[name="access_key"]').value;
    if (!key || key === "VOTRE_CLE_WEB3FORMS") {
      formStatus.textContent = "Formulaire pas encore configuré : appelez-nous au 03 22 72 62 24.";
      formStatus.className = "form__status is-error";
      return;
    }
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    formStatus.textContent = "Envoi en cours…";
    formStatus.className = "form__status";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      form.reset();
      formStatus.textContent = "Merci ! Votre message a bien été envoyé, nous vous répondons rapidement.";
      formStatus.className = "form__status is-ok";
    } catch {
      formStatus.textContent = "Oups, l’envoi a échoué. Réessayez ou appelez-nous au 03 22 72 62 24.";
      formStatus.className = "form__status is-error";
    } finally {
      btn.disabled = false;
    }
  });

  /* ---- Année du pied de page ---- */
  document.getElementById("year").textContent = now.getFullYear();
});
