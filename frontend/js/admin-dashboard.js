// Store all requests
let alleAnfragen = [];

// Load requests from API
async function anfragenLaden() {
  try {
    const res = await fetch("/api/admin/anfragen");
    // Redirect to login if not authenticated
    if (res.status === 401) {
      window.location.href = "/admin/login.html";
      return;
    }

    alleAnfragen = await res.json();
    tabelleAnzeigen(alleAnfragen);
  } catch (err) {
    console.error("Fehler:", err);
  }
}
// Render requests in table
function tabelleAnzeigen(daten) {
  const tbody = document.getElementById("tabelleBody");
  // Show message if no requests
  if (daten.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center">Keine Anfragen vorhanden.</td></tr>';
    return;
  }
  // Build table rows
  tbody.innerHTML = daten
    .map(
      (a) => `
    <tr>
      <td>${new Date(a.erstellt_am).toLocaleDateString("de-DE")}</td>
      <td>${a.name}</td>
      <td>${a.email}</td>
      <td>${a.telefon || "-"}</td>
      <td>${a.leistung || "-"}</td>
      <td>${a.nachricht}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="loeschen(${a.id})">Löschen</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// Search filter
document.getElementById("suche").addEventListener("input", (e) => {
  const suchbegriff = e.target.value.toLowerCase();
  const gefiltert = alleAnfragen.filter(
    (a) =>
      a.name.toLowerCase().includes(suchbegriff) ||
      a.email.toLowerCase().includes(suchbegriff),
  );
  tabelleAnzeigen(gefiltert);
});

// Delete request
async function loeschen(id) {
  if (!confirm("Anfrage wirklich löschen?")) return;

  try {
    const res = await fetch(`/api/admin/anfragen/${id}`, {
      method: "DELETE",
    });
    // Reload requests after deletion
    if (res.ok) {
      anfragenLaden();
    }
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
  }
}

// Logout handler
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin/login.html";
});

// Initialize dashboard
anfragenLaden();
