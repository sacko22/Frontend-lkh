// Attendre que le DOM soit prêt
document.addEventListener("DOMContentLoaded", () => {
  initRulesAccordion();
  loadCategories();
  loadSettingsAndCountdown();
});

/* --------- Accordéon des règles --------- */
function initRulesAccordion() {
  const toggleBtn = document.getElementById("toggleRules");
  const rules = document.getElementById("rulesContent");

  if (!toggleBtn || !rules) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = rules.style.display === "block";
    rules.style.display = isOpen ? "none" : "block";
    toggleBtn.textContent = isOpen ? "📌 Voir les règles du vote" : "📌 Masquer les règles du vote";
  });
}

/* --------- Chargement des catégories --------- */
function loadCategories() {
  fetch("https://backend-lkh.onrender.com/api/categories")
    .then(res => res.json())
    .then(categories => {
      const container = document.getElementById("categoriesGrid");
      if (!container) return;

      container.innerHTML = "";

      categories.forEach(cat => {
        const div = document.createElement("div");
        div.classList.add("category-card");

        div.innerHTML = `
          <img src="../Images/flyer_categorie/${cat.image}" alt="${cat.nom}">
          <h3>${cat.nom}</h3>
          <button class="btnVote" data-id="${cat._id}">Voir nominés</button>
        `;

        div.querySelector(".btnVote").addEventListener("click", () => {
          window.location.href = `nomines.html?categorie=${cat._id}`;
        });

        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Erreur chargement catégories :", err);
      const container = document.getElementById("categoriesGrid");
      if (container) {
        container.innerHTML = "<p>Impossible de charger les catégories pour le moment.</p>";
      }
    });
}

/* --------- Chargement des paramètres et compte à rebours --------- */
function loadSettingsAndCountdown() {
  fetch("https://backend-lkh.onrender.com/api/settings")
    .then(res => res.json())
    .then(setting => {
      if (!setting) return;

      // Afficher statut vote actif/inactif si disponible
      const statusEl = document.getElementById("voteStatus");
      if (statusEl && typeof setting.voteActif !== "undefined") {
        statusEl.textContent = setting.voteActif
          ? "Le vote est actif."
          : "Le vote est désactivé pour le moment.";
      }

      lancerCompteRebours(setting.dateDebutVote, setting.dateFinVote);

      // Vérifier si le vote est ouvert
      const now = new Date();
      const debut = new Date(setting.dateDebutVote);
      const fin = new Date(setting.dateFinVote);
      const voteCategoriesSection = document.getElementById("voteCategories");

      if (setting.voteActif && now >= debut && now <= fin) {
        // Vote ouvert → afficher la section catégories
        voteCategoriesSection.style.display = "block";
        lancerCompteRebours(setting.dateDebutVote, setting.dateFinVote);
      } else {
        // Vote fermé → masquer la section catégories
        voteCategoriesSection.style.display = "block";
      }

    })
    .catch(err => {
      console.error("Erreur chargement settings :", err);
      const countdownEl = document.getElementById("voteCountdown");
      if (countdownEl) countdownEl.textContent = "❌ Impossible de récupérer les paramètres du vote";
    });
}

/* --------- Compte à rebours --------- */
function lancerCompteRebours(dateDebut, dateFin) {
  const countdownEl = document.getElementById("voteCountdown");
  const statusEl = document.getElementById("voteStatus");

  if (!countdownEl) return;

  // Si dates manquantes
  if (!dateDebut || !dateFin) {
    countdownEl.className = "countdown closed";
    countdownEl.textContent = "❌ Les dates du vote ne sont pas configurées";
    if (statusEl) statusEl.textContent = "Veuillez réessayer plus tard.";
    return;
  }

  function update() {
    const now = new Date().getTime();
    const debut = new Date(dateDebut).getTime();
    const fin = new Date(dateFin).getTime();

    if (isNaN(debut) || isNaN(fin)) {
      countdownEl.className = "countdown closed";
      countdownEl.textContent = "❌ Dates de vote invalides";
      if (statusEl) statusEl.textContent = "Configuration invalide côté serveur.";
      return;
    }

    // Vote pas encore commencé
    if (now < debut) {
      countdownEl.className = "countdown pending";
      const diff = debut - now;
      afficherTemps(diff, "⏳ Le vote commence dans ", countdownEl);
      if (statusEl) statusEl.textContent = "Patientez, le vote n’a pas encore commencé.";
      return;
    }

    // Vote en cours
    if (now >= debut && now <= fin) {
      countdownEl.className = "countdown active";
      const diff = fin - now;
      afficherTemps(diff, "🗳️ Le vote se termine dans ", countdownEl);
      if (statusEl) statusEl.textContent = "Votez maintenant pour vos candidats favoris !";
      return;
    }

    // Vote terminé
    countdownEl.className = "countdown closed";
    countdownEl.textContent = "❌ Le vote est terminé";
    if (statusEl) statusEl.textContent = "Merci infinement d'avoir participé au vote de la première édition";
  }

  update();
  setInterval(update, 1000);
}

function afficherTemps(ms, prefix, targetEl) {
  const totalSecondes = Math.floor(ms / 1000);

  const jours = Math.floor(totalSecondes / (24 * 3600));
  const heures = Math.floor((totalSecondes % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSecondes % 3600) / 60);
  const secondes = totalSecondes % 60;

  let texteTemps = "";
  if (jours > 0) {
    texteTemps += `${jours}j `;
  }
  texteTemps += `${heures}h ${minutes}min ${secondes}s`;

  targetEl.textContent = `${prefix}${texteTemps}`;
}



window.addEventListener("load", () => {
  const duration = 2 * 1000; // 2 secondes
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 70,
      origin: { x: 0 }
    });

    confetti({
      particleCount: 7,
      angle: 120,
      spread: 70,
      origin: { x: 1 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
});

