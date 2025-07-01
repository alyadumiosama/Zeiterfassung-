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

      const MIN_ARBEITSZEIT_PRO_TAG = 7.5 * 60; // 450 Minuten Pause abgezogen
      const MAX_VERBLEIBENDE_UEBERSTUNDEN = 5 * 60;

      for (let i = 0; i < tage.length; i++) {
        const von = document.getElementById(`von${i}`).value;
        const bis = document.getElementById(`bis${i}`).value;
        const feld = document.getElementById(`stunden${i}`);
        const sollBisFeld = document.getElementById(`sollBis${i}`);

        if (von) {
          const start = parseZeit(von);
          const sollEnde = start + 450 + 30; // 7.5h inkl. 30 Min Pause (um auf 7:30 reine Zeit zu kommen)
          const stunden = String(Math.floor(sollEnde / 60)).padStart(2, '0');
          const minuten = String(sollEnde % 60).padStart(2, '0');
          sollBisFeld.textContent = `${stunden}:${minuten}`;
        } else {
          sollBisFeld.textContent = '–';
        }

        if (von && bis) {
          const start = parseZeit(von);
          const end = parseZeit(bis);

          if (start < 360 || end > 1020 || end <= start) {
            warnung += `⚠️ Ungültige Zeit am ${tage[i]}<br>`;
            feld.textContent = '0';
            continue;
          }

          let dauer = end - start - 30;
          feld.textContent = formatStundenUndMinuten(dauer);
          gesamtMinuten += dauer;

          if (dauer > MIN_ARBEITSZEIT_PRO_TAG) {
            ueberstundenMinuten += (dauer - MIN_ARBEITSZEIT_PRO_TAG);
          }
        } else {
          feld.textContent = '0';
        }
      }

      let restÜberstundenMinuten = MAX_VERBLEIBENDE_UEBERSTUNDEN - ueberstundenMinuten;
      if(restÜberstundenMinuten < 0) restÜberstundenMinuten = 0;

      document.getElementById('wochenSumme').textContent = `Gesamt: ${formatStundenUndMinuten(gesamtMinuten)}`;
      document.getElementById('ueberstunden').textContent = `Überstunden (ab 7:30 pro Tag): ${formatStundenUndMinuten(ueberstundenMinuten)}`;
      document.getElementById('restUeberstunden').textContent = `Verbleibende Überstunden: ${formatStundenUndMinuten(restÜberstundenMinuten)}`;
      document.getElementById('warnung').innerHTML = warnung;
    }