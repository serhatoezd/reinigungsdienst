document.getElementById("loginBtn").addEventListener("click", async () => {
  const benutzername = document.getElementById("benutzername").value.trim();
  const passwort = document.getElementById("passwort").value.trim();
  const fehler = document.getElementById("fehler");

  fehler.classList.add("d-none");

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benutzername, passwort }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = "/admin/dashboard.html";
    } else {
      fehler.textContent = data.message;
      fehler.classList.remove("d-none");
    }
  } catch (err) {
    fehler.textContent = "Serverfehler – bitte versuche es erneut.";
    fehler.classList.remove("d-none");
  }
});
