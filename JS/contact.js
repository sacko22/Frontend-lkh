const form = document.getElementById("contactForm");
const msg = document.getElementById("contactMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nom: form.nom.value,
    prenom: form.prenom.value,
    email: form.email.value,
    message: form.message.value
  };

  msg.textContent = "Envoi en cours...";

  try {
    const res = await fetch("https://backend-lkh.onrender.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      msg.textContent = "Message envoyé avec succès ✅";
      form.reset();
    } else {
      msg.textContent = result.message || "Erreur lors de l’envoi ❌";
    }
  } catch (error) {
    msg.textContent = "Erreur serveur ❌";
  }
});
