// 1️⃣ Récupérer l'ID de la catégorie depuis l'URL
const params = new URLSearchParams(window.location.search);
const categoryId = params.get("categorie");

const gridNomines = document.getElementById("gridNomines");
const nomCategorie = document.getElementById("nomCategorieChoisi");

// Sécurité minimale
if (!categoryId) {
  gridNomines.innerHTML = "<p>Aucune catégorie sélectionnée.</p>";
  throw new Error("Category ID manquant");
}

// Trouver et recuperer le nom de la categorie choisie depuis le backend
async function searchNameCategorieSelected() {
  try {
    const res = await fetch("https://backend-lkh.onrender.com/api/categories");
    const categories = await res.json();

    categories.forEach(cat => {
      if (categoryId === cat._id){
        nomCategorie.textContent = cat.nom 
      }
    });
  } catch (error) {
    console.error("Erreur chargement catégories:", error);
  }
}

/* --------- Génération d'un visitorId unique --------- */
function getVisitorId() {
  let visitorId = localStorage.getItem("visitorId");

  if (!visitorId) {
    visitorId = crypto.randomUUID(); // ID unique
    localStorage.setItem("visitorId", visitorId);
  }

  return visitorId;
}

const visitorId = getVisitorId();

/* --------- Charger les nominés et settings --------- */
async function loadNomines() {
  try {
    const resNomines = await fetch(`https://backend-lkh.onrender.com/api/nomines/categorie/${categoryId}`);
    const nomines = await resNomines.json();

    const resSetting = await fetch("https://backend-lkh.onrender.com/api/settings");
    const setting = await resSetting.json();

    const voteStatus = await verifierVoteCategorie(categoryId);

    afficherNomines(nomines, setting, voteStatus);
  } catch (err) {
    console.error(err);
    gridNomines.innerHTML = "<p>Erreur de chargement des nominés.</p>";
  }
}

/* --------- Affichage des nominés --------- */
function afficherNomines(nomines, setting, voteStatus) {
  gridNomines.innerHTML = "";

  const now = new Date();
  const voteFerme =
    !setting ||
    !setting.voteActif ||
    (setting.dateDebutVote && now < new Date(setting.dateDebutVote)) ||
    (setting.dateFinVote && now > new Date(setting.dateFinVote));

  const countdownEl = document.getElementById("voteCountdown");

  if (voteFerme) {
    countdownEl.textContent = "⛔ Le vote n'est pas actif actuellement";
  } else {
    if (voteStatus.hasVoted && voteStatus.remainingMs) {
      lancerCompteRebours(voteStatus.remainingMs);
    }
    if (voteStatus.locked) {
      countdownEl.textContent = "🔒 Vous êtes engagé pour ce candidat dans cette catégorie.";
    }
  }

  if (nomines.length === 0) {
    gridNomines.innerHTML = "<p>Aucun nominé.</p>";
    return;
  }

  nomines.forEach(nomine => {
    const card = document.createElement("div");
    card.className = "cardNomine";

    // Vérifier si ce nominé est le candidat verrouillé
    const isLockedCandidate = voteStatus.locked && voteStatus.lockedNomineId === nomine._id;

    let buttonHTML = "";
    if (voteFerme) {
      buttonHTML = `<button class="secondBtn" disabled>Vote fermé</button>`;
    } else if (voteStatus.locked && !isLockedCandidate) {
      buttonHTML = `<button class="secondBtn" disabled>Candidat verrouillé</button>`;
    } else {
      buttonHTML = `<button class="secondBtn vote-btn" data-id="${nomine._id}">Voter</button>`;
    }

    card.innerHTML = `
      <img src="${nomine.photo}" alt="${nomine.nomComplet}">
      <h3>${nomine.nomComplet}</h3>
      <p class="nombreVoteNomine"><span>${nomine.nombreVotes}</span> vote(s)</p>
      ${buttonHTML}
    `;

    gridNomines.appendChild(card);
  });
}

/* --------- Vérifier statut du vote --------- */
async function verifierVoteCategorie(categoryId) {
  const visitorId = getVisitorId();
  const res = await fetch(
    `https://backend-lkh.onrender.com/api/votes/status/${categoryId}/${visitorId}`
  );
  return res.json();
}

/* --------- Gestion du vote --------- */
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("vote-btn")) {
    const nomineId = e.target.dataset.id;
    const visitorId = getVisitorId();

    try {
      const res = await fetch("https://backend-lkh.onrender.com/api/votes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": "believeInLKHprojet2026"
        },
        body: JSON.stringify({ nomineId, visitorId })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message, "error");
        return;
      }

      showMessage("Vote enregistré avec succès ✅", "success");
      setTimeout(() => location.reload(), 1500);

    } catch (err) {
      console.error(err);
      showMessage("Erreur lors du vote ❌", "error");
    }
  }
});

/* --------- Compte à rebours --------- */
function lancerCompteRebours(ms) {
  const countdownEl = document.getElementById("voteCountdown");

  function update() {
    if (ms <= 0) {
      countdownEl.textContent = "Vous pouvez revoter maintenant ✅";
      location.reload();
      return;
    }

    const heures = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms / 1000) % 60);

    countdownEl.textContent =
      `⏳ Vous pourrez revoter dans ${heures}h ${minutes}min ${seconds}s`;

    ms -= 1000;
  }

  update();
  setInterval(update, 1000);
}

/* --------- Feedback visuel --------- */
function showMessage(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `vote-message ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* --------- Initialisation --------- */
loadNomines();
