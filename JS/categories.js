
fetch("https://backend-lkh.onrender.com/api/categories")
  .then(res => res.json())
  .then(categories => {
    const container = document.getElementById("categories-container");

    categories.forEach(cat => {
      const div = document.createElement("div");
      div.classList.add("imgCategorie");

      div.innerHTML = `
        <img src="../Images/flyer_categorie/${cat.image}" alt="${cat.nom}">
      `;

      container.appendChild(div);
    });
  })
  .catch(err => {
    console.error("Erreur chargement catégories :", err);
  });

