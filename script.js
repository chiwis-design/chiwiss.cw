
const inputData = document.getElementById("inputData");
const resultBody = document.getElementById("resultBody");
const statusText = document.getElementById("status");

let transactions = [];

// MEMBACA DATA
function parseTransactions(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const results = [];

  for (let i = 0; i < lines.length; i++) {

    const match = lines[i].match(/\b(withdraw|deposit)\b/i);
    if (!match) continue;

    const type = match[0];
    const id = lines[i - 1] || "";

    // AMBIL NOMINAL
    let amount = "";

    for (let j = i; j < Math.min(i + 3, lines.length); j++) {
      const clean = lines[j].replace(
        /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g,
        ""
      );

      const numbers = clean.match(
        /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?|\b\d{4,}(?:\.\d+)?/g
      );

      if (numbers?.length) {
        amount = numbers[0].replace(/,/g, "");
        break;
      }
    }

    // AMBIL NAMA REKENING
    let name = "";

    for (let j = i + 1; j < Math.min(i + 7, lines.length); j++) {
      if (lines[j].includes(",")) {
        const parts = lines[j].split(",");
        name = parts[parts.length - 1].trim();
        break;
      }
    }

    if (!id || !name || !amount) continue;

    let nominal = Number(amount);

    if (type.toLowerCase() === "withdraw") {
      nominal = -Math.abs(nominal);
    }

    results.push({
      name,
      id,
      type,
      nominal: String(nominal)
    });
  }

  return results;
}

// TAMPILKAN TABEL
function renderTable() {
  resultBody.innerHTML = "";

  if (!transactions.length) {
    resultBody.innerHTML = `
      <tr>
        <td colspan="4">Belum ada data transaksi</td>
      </tr>
    `;

    statusText.textContent = "♡ Belum ada transaksi terbaca";
    return;
  }

  transactions.forEach(item => {
    const tr = document.createElement("tr");

    [
      item.name,
      item.id,
      item.type,
      item.nominal
    ].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    resultBody.appendChild(tr);
  });

  statusText.textContent =
    `♡ Berhasil membaca ${transactions.length} transaksi!`;
}

// PROSES OTOMATIS
function processData() {
  transactions = parseTransactions(inputData.value);
  renderTable();
}

inputData.addEventListener("input", processData);

document.getElementById("processBtn").addEventListener(
  "click",
  processData
);

// RESET
document.getElementById("resetBtn").addEventListener(
  "click",
  () => {
    inputData.value = "";
    transactions = [];
    renderTable();
    statusText.textContent = "♡ Data berhasil direset";
  }
);

// COPY DATA
async function copyData(text, message) {
  if (!text) {
    statusText.textContent = "♡ Tidak ada data untuk disalin";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    statusText.textContent = message;
  } catch {
    statusText.textContent = "♡ Gagal menyalin data";
  }
}

// COPY NAMA & ID
document.getElementById("copyNameId").addEventListener(
  "click",
  () => {
    const text = transactions
      .map(item => `${item.name}\t${item.id}`)
      .join("\n");

    copyData(text, "♡ Nama & ID berhasil disalin!");
  }
);

// COPY NOMINAL
document.getElementById("copyNominal").addEventListener(
  "click",
  () => {
    const text = transactions
      .map(item => item.nominal)
      .join("\n");

    copyData(text, "♡ Semua nominal berhasil disalin!");
  }
);
