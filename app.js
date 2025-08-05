
let hotelData = JSON.parse(localStorage.getItem('reserveringen')) || {};
let kamerPrijzen = JSON.parse(localStorage.getItem('kamerPrijzen')) || {
  "Standaard": { prijs: 100, beschrijving: "Comfortabele kamer met een mooi uitzicht" },
  "Deluxe": { prijs: 150, beschrijving: "Ruime kamer met balkon en luxe badkamer" },
  "Suite": { prijs: 200, beschrijving: "Suite met aparte woonkamer en grote badkamer" },
  "Penthouse": { prijs: 300, beschrijving: "Penthouse met panoramisch uitzicht over de stad" }
};
let currentRes = null;
let currentHotel = null;

window.addEventListener('DOMContentLoaded', () => {
  currentHotel = 'beach';
  document.body.classList.add(currentHotel);
  const logo = document.getElementById('hotelLogo');
  const name = document.getElementById('hotelName');
  logo.src = `logos/logo_${currentHotel}.png`;
  if (currentHotel === 'zonnestraal') name.textContent = 'Hotel Zonnestraal';
  if (currentHotel === 'palace') name.textContent = 'Grand Palace';
  if (currentHotel === 'beach') name.textContent = 'Beach Resort';
  // locatie-keuze verwijderd
  document.getElementById('systeem').classList.remove('hidden');
});

document.getElementById('newResBtn').addEventListener('click', () => {
  const newRes = generateBlankReservation();
  currentRes = newRes;
  fillDetails(newRes);
  document.getElementById('detailsForm').classList.remove('hidden');
});

document.getElementById('zoekForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const term = document.getElementById('zoekTerm').value.trim();
  if (!term) return;
  let res = hotelData[term] || Object.values(hotelData).find(r => r.reserveringsnummer === term || r.naam.toLowerCase() === term.toLowerCase());
  if (!res) {
    res = generateReservation(term);
    hotelData[term] = res;
    saveData();
  }
  currentRes = res;
  fillDetails(res);
  document.getElementById('detailsForm').classList.remove('hidden');
});

document.getElementById('checkinBtn').addEventListener('click', () => {
  if (currentRes) {
    currentRes.status = 'Ingecheckt';
    saveData();
    fillDetails(currentRes);
    document.getElementById('overviewBtn').click();
    window.scrollTo(0,0);
    document.getElementById('overviewBtn').click();
    window.scrollTo(0,0);
  }
});

document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (currentRes) {
    currentRes.status = 'Uitgecheckt';
    saveData();
    fillDetails(currentRes);
    document.getElementById('overviewBtn').click();
    window.scrollTo(0,0);
  }
});

document.getElementById('detailsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (currentRes) {
    currentRes.naam = document.getElementById('naam').value;
    currentRes.gasten = parseInt(document.getElementById('gasten').value) || "";
    currentRes.nachten = parseInt(document.getElementById('nachten').value) || "";
    currentRes.kamer = document.getElementById('kamer').value;
    currentRes.etage = parseInt(document.getElementById('etage').value) || "";
    currentRes.idNummer = document.getElementById('idNummer').value;
    currentRes.ccNummer = document.getElementById('ccNummer').value;
    currentRes.kamerpas = document.getElementById('kamerpas').value;
    updateBedrag();
    saveData();
  }
});

document.getElementById('nachten').addEventListener('input', () => {
  if (currentRes) {
    currentRes.nachten = parseInt(document.getElementById('nachten').value) || "";
    updateBedrag();
  }
});

document.getElementById('selectKamerBtn').addEventListener('click', () => {
  openKamerSelectie();
});

document.getElementById('closeKamerSelect').addEventListener('click', () => {
  document.getElementById('kamerSelectModal').classList.add('hidden');
});

document.getElementById('upgradeBtn').addEventListener('click', () => {
  openKamerSelectie();
});

function openKamerSelectie() {
  const table = document.getElementById('kamerSelectTable');
  table.innerHTML = '<tr><th>Kamer</th><th>Beschrijving</th><th>Prijs</th></tr>';
  Object.keys(kamerPrijzen).forEach(type => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${type}</td><td>${kamerPrijzen[type].beschrijving}</td><td>€ ${kamerPrijzen[type].prijs},-</td>`;
    row.addEventListener('click', () => {
      document.getElementById('kamer').value = type;
      currentRes.kamer = type;
      updateBedrag();
      document.getElementById('kamerSelectModal').classList.add('hidden');
    });
    table.appendChild(row);
  });
  document.getElementById('kamerSelectModal').classList.remove('hidden');
}

document.getElementById('adminBtn').addEventListener('click', () => {
  const table = document.getElementById('adminTable');
  table.innerHTML = '<tr><th>Kamer</th><th>Prijs</th><th>Beschrijving</th></tr>';
  Object.keys(kamerPrijzen).forEach(type => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${type}</td>
      <td><input type="number" id="prijs_${type}" value="${kamerPrijzen[type].prijs}"></td>
      <td><input type="text" id="beschrijving_${type}" value="${kamerPrijzen[type].beschrijving}"></td>`;
    table.appendChild(row);
  });
  document.getElementById('adminModal').classList.remove('hidden');
});

document.getElementById('saveAdmin').addEventListener('click', () => {
  Object.keys(kamerPrijzen).forEach(type => {
    kamerPrijzen[type].prijs = parseInt(document.getElementById(`prijs_${type}`).value);
    kamerPrijzen[type].beschrijving = document.getElementById(`beschrijving_${type}`).value;
  });
  localStorage.setItem('kamerPrijzen', JSON.stringify(kamerPrijzen));
  document.getElementById('adminModal').classList.add('hidden');
});

document.getElementById('closeAdmin').addEventListener('click', () => {
  document.getElementById('adminModal').classList.add('hidden');
});

document.getElementById('overviewBtn').addEventListener('click', () => {
  const rightCol = document.querySelector('.right-col');
  let html = '<h2>Alle reserveringen</h2>';
  if (Object.keys(hotelData).length === 0) {
    html += '<p>Geen reserveringen gevonden.</p>';
  } else {
    html += '<table border="1" cellpadding="5" cellspacing="0"><tr><th>Reserveringsnummer</th><th>Naam</th><th>Kamer</th><th>Etage</th><th>Aankomst</th><th>Nachten</th><th>Bedrag</th><th>Status</th></tr>';
    Object.values(hotelData).forEach(res => {
      const prijs = kamerPrijzen[res.kamer] ? kamerPrijzen[res.kamer].prijs : 0;
      const bedrag = res.nachten && prijs ? prijs * res.nachten : 0;
      html += `<tr>
        <td>${res.reserveringsnummer}</td>
        <td>${res.naam}</td>
        <td>${res.kamerpas}</td>
        <td>${res.etage || ''}</td>
        <td>${res.aankomst || ''}</td>
        <td>${res.nachten || ''}</td>
        <td>€ ${bedrag},-</td>
        <td>${res.status}</td>
      </tr>`;
    });
    html += '</table>';
  }
  document.getElementById('rightContent').innerHTML = html;
});

function fillDetails(res) {
  document.getElementById('resNumDisplay').textContent = "Reserveringsnummer: " + res.reserveringsnummer;
  document.getElementById('naam').value = res.naam;
  document.getElementById('gasten').value = res.gasten;
  document.getElementById('nachten').value = res.nachten;
  document.getElementById('kamer').value = res.kamer;
  document.getElementById('etage').value = res.etage || '';
  document.getElementById('idNummer').value = res.idNummer || '';
  document.getElementById('ccNummer').value = res.ccNummer || '';
  document.getElementById('kamerpas').value = res.kamerpas || '';
  document.getElementById('status').textContent = res.status;
  updateBedrag();
}

function updateBedrag() {
  const kamerType = document.getElementById('kamer').value;
  const nachten = parseInt(document.getElementById('nachten').value);
  const prijs = kamerPrijzen[kamerType] ? kamerPrijzen[kamerType].prijs : 0;
  const bedrag = (nachten && prijs) ? prijs * nachten : 0;
  document.getElementById('bedragDisplay').textContent = "Bedrag: € " + bedrag + ",-";
}

function saveData() {
  hotelData[currentRes.reserveringsnummer] = currentRes;
  localStorage.setItem('reserveringen', JSON.stringify(hotelData));
}

function generateReservationNumber() {
  const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                  String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `HTL-${letters}${numbers}`;
}

function randomName() {
  const firstNames = ["John", "Maria", "Liam", "Emma", "Noah", "Sofia", "Mia", "Lucas"];
  const lastNames = ["Smith", "Garcia", "Chen", "Janssen", "Dubois", "Kowalski"];
  return firstNames[Math.floor(Math.random() * firstNames.length)] + " " +
         lastNames[Math.floor(Math.random() * lastNames.length)];
}

function randomPassport() {
  return "NL" + Math.floor(1000000 + Math.random() * 9000000);
}

function randomCC() {
  let cc = "";
  for (let i = 0; i < 4; i++) {
    cc += Math.floor(1000 + Math.random() * 9000) + (i < 3 ? " " : "");
  }
  return cc;
}

function randomRoom(etage) {
  return `${etage}${("0" + Math.floor(Math.random() * 20 + 1)).slice(-2)}`;
}

function randomArrivalDate() {
  const today = new Date();
  today.setDate(today.getDate() + Math.floor(Math.random() * 14));
  return today.toISOString().split('T')[0];
}

function generateReservation(num) {
  const kamers = Object.keys(kamerPrijzen);
  const etage = Math.floor(Math.random() * 10) + 1;
  return {
    reserveringsnummer: num,
    naam: randomName(),
    gasten: Math.floor(Math.random() * 6) + 1,
    nachten: Math.floor(Math.random() * 14) + 1,
    kamer: kamers[Math.floor(Math.random() * kamers.length)],
    etage: etage,
    idNummer: randomPassport(),
    ccNummer: randomCC(),
    kamerpas: randomRoom(etage),
    aankomst: randomArrivalDate(),
    status: "Gereserveerd"
  };
}

function generateBlankReservation() {
  const resNum = generateReservationNumber();
  return {
    reserveringsnummer: resNum,
    naam: "",
    gasten: "",
    nachten: "",
    kamer: "",
    etage: "",
    idNummer: "",
    ccNummer: "",
    kamerpas: "",
    aankomst: "",
    status: "Gereserveerd"
  };
}


// ===== Export functionaliteit =====
document.getElementById('exportDataBtn').addEventListener('click', () => {
  const data = {
    reserveringen: hotelData,
    kamerPrijzen: kamerPrijzen
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const today = new Date().toISOString().split('T')[0];
  const filename = `hoteldata-${today}.json`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ===== Import functionaliteit =====
document.getElementById('importDataBtn').addEventListener('click', () => {
  document.getElementById('importDataInput').click();
});

document.getElementById('importDataInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData.reserveringen) {
        hotelData = importedData.reserveringen;
        localStorage.setItem('reserveringen', JSON.stringify(hotelData));
      }
      if (importedData.kamerPrijzen) {
        kamerPrijzen = importedData.kamerPrijzen;
        localStorage.setItem('kamerPrijzen', JSON.stringify(kamerPrijzen));
      }
      document.getElementById('adminModal').classList.add('hidden');
      document.getElementById('overviewBtn').click();
    window.scrollTo(0,0);
    } catch (error) {
      console.error('Fout bij importeren:', error);
    }
  };
  reader.readAsText(file);
});
