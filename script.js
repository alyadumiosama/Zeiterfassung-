const tage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
const zeitTabelle = document.getElementById('zeitTabelle');

window.addEventListener('DOMContentLoaded', () => {
  tage.forEach((tag, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tag}</td>
      <td><input type="time" id="von${i}" min="06:00" max="17:00" required></td>
      <td><input type="time" id="bis${i}" min="06:00" max="17:00" required></td>
      <td><span id="stunden${i}">0</span></td>
      <td><span id="sollBis${i}">–</span></td>
    `;
    zeitTabelle.appendChild(tr);

    document.getElementById(`von${i}`).addEventListener('input', berechne);
    document.getElementById(`bis${i}`).addEventListener('input', berechne);
  });

  berechne();
});

function parseZeit(zeitStr) {
  const [h, m] = zeitStr.split(':').map(Number);
  return h * 60 + m;
}

function formatStundenUndMinuten(minuten) {
  const stunden = Math.floor(minuten / 60);
  const restMinuten = minuten % 60;
  return `${stunden} Stunden ${restMinuten} Minuten`;
}

function berechne() {
  let gesamtMinuten = 0;
  let ueberstundenMinuten = 0;
  let warnung = '';

  const MIN_ARBEITSZEIT_PRO_TAG = 7.5 * 60; // 450 Minuten
  const MAX_VERBLEIBENDE_UEBERSTUNDEN = 5 * 60; // 300 Minuten
  const MAX_ARBEITSZEIT_PRO_TAG = 9 * 60; // 540 Minuten

  for (let i = 0; i < tage.length; i++) {
    const von = document.getElementById(`von${i}`).value;
    const bis = document.getElementById(`bis${i}`).value;
    const feld = document.getElementById(`stunden${i}`);
    const sollBisFeld = document.getElementById(`sollBis${i}`);

    if (von) {
      const start = parseZeit(von);
      const sollEnde = start + 450 + 30; // 7.5h + 30 Min Pause = 7:30 reine Zeit
      const stunden = String(Math.floor(sollEnde / 60)).padStart(2, '0');
      const minuten = String(sollEnde % 60).padStart(2, '0');
      sollBisFeld.textContent = `${stunden}:${minuten}`;

      // Warnung: Startzeit außerhalb 06:00-17:00
      if (start < 360 || start > 1020) {
        warnung += `⚠️ Startzeit am ${tage[i]} liegt außerhalb von 06:00 bis 17:00<br>`;
      }
    } else {
      sollBisFeld.textContent = '–';
    }

    if (bis) {
      const end = parseZeit(bis);
      // Warnung: Endzeit außerhalb 06:00-17:00
      if (end < 360 || end > 1020) {
        warnung += `⚠️ Endzeit am ${tage[i]} liegt außerhalb von 06:00 bis 17:00<br>`;
      }
    }

    if (von && bis) {
      const start = parseZeit(von);
      const end = parseZeit(bis);

      if (end <= start) {
        warnung += `⚠️ Endzeit muss nach Startzeit am ${tage[i]} liegen<br>`;
        feld.textContent = '0';
        continue;
      }
      if (start < 360 || end > 1020) {
        feld.textContent = '0';
        continue;
      }

      let dauer = end - start - 30; // 30 Min Pause
      feld.textContent = formatStundenUndMinuten(dauer);
      gesamtMinuten += dauer;

      if (dauer > MIN_ARBEITSZEIT_PRO_TAG) {
        ueberstundenMinuten += (dauer - MIN_ARBEITSZEIT_PRO_TAG);
      }

      // Warnung: Dauer > 9 Stunden
      if (dauer > MAX_ARBEITSZEIT_PRO_TAG) {
        warnung += `⚠️ Arbeitszeit am ${tage[i]} überschreitet 9 Stunden<br>`;
      }
    } else {
      feld.textContent = '0';
    }
  }

  let restÜberstundenMinuten = MAX_VERBLEIBENDE_UEBERSTUNDEN - ueberstundenMinuten;
  if (restÜberstundenMinuten < 0) restÜberstundenMinuten = 0;

  document.getElementById('wochenSumme').textContent = `Gesamt: ${formatStundenUndMinuten(gesamtMinuten)}`;
  document.getElementById('ueberstunden').textContent = `Überstunden (ab 7:30 pro Tag): ${formatStundenUndMinuten(ueberstundenMinuten)}`;
  document.getElementById('restUeberstunden').textContent = `Verbleibende Überstunden: ${formatStundenUndMinuten(restÜberstundenMinuten)}`;
  document.getElementById('warnung').innerHTML = warnung;
}
