const categorySelect = document.getElementById("categorySelect");

// Charger les catégories depuis le backend
async function loadCategories() {
  try {
    const res = await fetch("https://backend-lkh.onrender.com/api/categories");
    const categories = await res.json();

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat._id;
      option.textContent = cat.nom; // ou cat.name selon ton schema
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur chargement catégories:", error);
  }
}

// Appel au chargement de la page
loadCategories();


const form = document.getElementById("nomineForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
    }

  try {
    const res = await fetch("https://backend-lkh.onrender.com/api/nomines", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      message.textContent = "Nominé enregistré avec succès ✅";
      form.reset();
    } else {
      message.textContent = data.message || "Erreur lors de l'enregistrement ❌";
    }
  } catch (error) {
    message.textContent = "Erreur serveur ❌";
  }
});


