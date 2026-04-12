document.getElementById("kontaktForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    telefon: document.getElementById("telefon").value,
    email: document.getElementById("email").value,
    leistung: document.getElementById("leistung").value,
    nachricht: document.getElementById("nachricht").value,
  };

  try {
    const response = await fetch("/api/kontakt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Serverfehler");
    }

    document.getElementById("kontaktForm").reset();

    const successMsg = document.createElement("div");
    successMsg.className = "alert alert-success mt-3";
    successMsg.textContent = "Ihre Nachricht wurde erfolgreich gesendet!";
    document.getElementById("kontaktForm").appendChild(successMsg);

    setTimeout(() => successMsg.remove(), 3000);
  } catch (err) {
    const errorMsg = document.createElement("div");
    errorMsg.className = "alert alert-danger mt-3";
    errorMsg.textContent = "Fehler beim Senden! Bitte versuchen Sie es erneut.";
    document.getElementById("kontaktForm").appendChild(errorMsg);
    setTimeout(() => errorMsg.remove(), 3000);
  }
});
