// Login button click handler
document.getElementById("loginBtn").addEventListener("click", async () => {
  // Get input values
  const benutzername = document.getElementById("benutzername").value.trim();
  const passwort = document.getElementById("passwort").value.trim();
  const fehler = document.getElementById("fehler");

  // Hide error message
  fehler.classList.add("d-none");

  try {
    // Send login request to backend API
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benutzername, passwort }),
    });

    const data = await res.json();
    // Redirect to dashboard on success
    if (res.ok) {
      window.location.href = "/admin/dashboard.html";
    } else {
      // Show error message
      fehler.textContent = data.message;
      fehler.classList.remove("d-none");
    }
  } catch (err) {
    // Show server error message
    fehler.textContent = "Serverfehler – bitte versuche es erneut.";
    fehler.classList.remove("d-none");
  }
});
