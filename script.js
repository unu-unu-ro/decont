// Cache-uim referințele DOM pentru elementele utilizate frecvent
const elements = {
  // Câmpuri de intrare
  name: document.getElementById("name"),
  date: document.getElementById("date"),
  purpose: document.getElementById("purpose"),
  paymentMethod: document.getElementById("paymentMethod"),
  iban: document.getElementById("iban"),
  explanation: document.getElementById("explanation"),
  amount: document.getElementById("amount"),

  // Elemente pentru preview
  previewName: document.getElementById("previewName"),
  previewDate: document.getElementById("previewDate"),
  previewPurpose: document.getElementById("previewPurpose"),
  previewPaymentMethod: document.getElementById("previewPaymentMethod"),
  previewIban: document.getElementById("previewIban"),

  // Elemente IBAN
  ibanresult: document.getElementById("ibanresult"),
  ibanholder: document.getElementById("ibanholder"),
  ibanlabel: document.getElementById("ibanlabel"),

  // Alte elemente
  dataTableBody: document.querySelector("#dataTable tbody"),
  signature: document.getElementById("signature"),
  signatureName: document.getElementById("signatureName"),
  canvas: document.getElementById("signatureCanvas"),
};

// Funcție pentru formatarea datei în format DD/MM/YYYY folosind moment.js
function formatDateDDMMYYYY(date) {
  return moment(date).format("DD/MM/YYYY");
}

// Funcție pentru a manipula vizibilitatea elementelor IBAN
function toggleIbanVisibility(visible) {
  const display = visible ? "block" : "none";
  elements.ibanholder.style.display = display;
  elements.iban.style.display = display;
  elements.ibanlabel.style.display = display;
  elements.ibanresult.style.display = display;

  if (!visible) {
    elements.previewIban.textContent = "";
  }
}

// Funcție pentru validarea IBAN-ului românesc
function isValidRomanianIBAN(iban) {
  const cleaned = iban.toUpperCase().replace(/\s+/g, "");
  const regex = /^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/;
  return regex.test(cleaned);
}

// Funcție pentru actualizarea validării IBAN
function updateIbanValidation(value) {
  const valid = isValidRomanianIBAN(value);

  if (valid) {
    elements.iban.classList.add("valid");
    elements.iban.classList.remove("invalid");
    elements.ibanresult.textContent = "✅ IBAN valid!";
    elements.ibanresult.style.color = "green";
  } else {
    elements.iban.classList.add("invalid");
    elements.iban.classList.remove("valid");
    elements.ibanresult.textContent = "❌ IBAN invalid!";
    elements.ibanresult.style.color = "red";
  }
}

// Salvează modalitatea de încasare în localStorage și actualizează live preview
function updateLivePreview() {
  const nameValue = elements.name.value;
  const dateValue = elements.date.value;
  const purposeValue = elements.purpose.value;
  const iban = elements.iban.value;
  const paymentMethodValue = elements.paymentMethod.value;

  // Salvează datele în localStorage
  localStorage.setItem("savedName", nameValue);
  localStorage.setItem("savedPaymentMethod", paymentMethodValue);
  localStorage.setItem("savedIban", iban);

  elements.previewName.textContent = nameValue;
  elements.previewDate.textContent = dateValue;
  elements.previewPurpose.textContent = purposeValue;
  elements.previewPaymentMethod.textContent = paymentMethodValue;

  if (paymentMethodValue === "Transfer bancar") {
    elements.previewIban.textContent = iban;
    toggleIbanVisibility(true);
  } else {
    toggleIbanVisibility(false);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("savedName");
  const savedPaymentMethod = localStorage.getItem("savedPaymentMethod");
  const savedIban = localStorage.getItem("savedIban");

  if (savedName) {
    elements.name.value = savedName;
    elements.previewName.textContent = savedName;
  }

  if (savedPaymentMethod) {
    elements.paymentMethod.value = savedPaymentMethod;
    elements.previewPaymentMethod.textContent = savedPaymentMethod;
  }

  if (savedIban) {
    elements.iban.value = savedIban;

    // Verifică validitatea IBAN-ului salvat și actualizează starea validatorului
    updateIbanValidation(savedIban);
  }

  // Asigură-te că starea IBAN-ului este corectă în funcție de modalitatea de plată
  const paymentMethodValue = elements.paymentMethod.value;
  if (paymentMethodValue === "Transfer bancar") {
    elements.previewIban.textContent = savedIban || "";
    toggleIbanVisibility(true);
  } else {
    toggleIbanVisibility(false);
  }

  // data
  const currentDate = new Date();
  elements.date.value = currentDate.toISOString().split("T")[0];

  // Format data în DD/MM/YYYY pentru live preview
  const previewFormattedDate = formatDateDDMMYYYY(currentDate);
  elements.previewDate.textContent = previewFormattedDate;
});

// Asigură-te că data din input este transformată corect pentru live preview
elements.date.addEventListener("input", function () {
  // Folosește moment.js pentru a formata data
  if (this.value) {
    elements.previewDate.textContent = moment(this.value).format("DD/MM/YYYY");
  }
});

// Adaugă funcționalitate pentru a adăuga date în tabel și actualizare live
const addToTableButton = document.getElementById("addToTable");

// Adaugă funcționalitate pentru calcularea totalului
// Modifică funcția calculateTotal pentru a menține totalul ca ultima linie
function calculateTotal() {
  const rows = Array.from(elements.dataTableBody.querySelectorAll("tr"));
  let total = 0;

  // Exclude rândul de total din calcul
  rows.forEach((row) => {
    if (row.id !== "totalRow") {
      const amountCell = row.querySelector("td:last-child");
      if (amountCell) {
        total += parseFloat(amountCell.textContent) || 0;
      }
    }
  });

  // Mută rândul de total la final, dacă există
  let totalRow = document.getElementById("totalRow");
  if (!totalRow) {
    totalRow = document.createElement("tr");
    totalRow.id = "totalRow";
    totalRow.innerHTML = `
      <td colspan="2" style="font-weight: bold;">TOTAL</td>
      <td style="font-weight: bold;" id="totalAmount">0</td>
    `;
    elements.dataTableBody.appendChild(totalRow);
  } else {
    elements.dataTableBody.appendChild(totalRow); // Asigură-te că este ultima linie
  }

  document.getElementById("totalAmount").textContent = total.toFixed(2);
}

// Modifică evenimentul de adăugare în tabel pentru a recalcula totalul
addToTableButton.addEventListener("click", () => {
  const documentValue = document.getElementById("document").value;
  const explanationValue = elements.explanation.value;
  const amountValue = elements.amount.value;

  if (documentValue && amountValue) {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td>${documentValue}</td>
      <td>${explanationValue}</td>
      <td>${parseFloat(amountValue).toFixed(2)}</td>
    `;

    elements.dataTableBody.appendChild(newRow);

    // Resetează câmpurile după adăugare
    elements.explanation.value = "";
    elements.amount.value = "";

    // Recalculează totalul
    calculateTotal();
  } else {
    alert("Documentul si valoarea sunt obligatorii!");
  }
});

// Funcționalitate pentru semnătură pe canvas
const ctx = elements.canvas.getContext("2d");
let isDrawing = false;

const scale = window.devicePixelRatio || 1;
elements.canvas.width = elements.canvas.offsetWidth * scale;
elements.canvas.height = elements.canvas.offsetHeight * scale;
ctx.scale(scale, scale);

// Adjust cursor position for drawing on the canvas
elements.canvas.addEventListener("mousedown", (e) => {
  const rect = elements.canvas.getBoundingClientRect();
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

elements.canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const rect = elements.canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }
});

elements.canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

elements.canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

// Add touch support for mobile devices
elements.canvas.addEventListener("touchstart", (e) => {
  const rect = elements.canvas.getBoundingClientRect();
  const touch = e.touches[0];
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  e.preventDefault();
});

elements.canvas.addEventListener("touchmove", (e) => {
  if (isDrawing) {
    const rect = elements.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  }
  e.preventDefault();
});

elements.canvas.addEventListener("touchend", () => {
  isDrawing = false;
});

// Șterge semnătura
const clearButton = document.getElementById("clearSignature");
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
  elements.signature.src = ""; // Resetează imaginea
});

// Salvează semnătura ca imagine
const saveButton = document.getElementById("saveSignature");

// Salvează semnătura și numele în secțiunea din dreapta jos
saveButton.addEventListener("click", () => {
  const dataURL = elements.canvas.toDataURL("image/png");

  // Afișează semnătura în img cu id="signature"
  elements.signature.src = dataURL;
  elements.signature.alt = "Semnătură";

  // Afișează numele în <p id="signatureName">
  const nameValue = elements.name.value;
  elements.signatureName.textContent = nameValue;
});

const input = elements.iban;
const result = elements.ibanresult;

input.addEventListener("input", () => {
  const value = input.value;
  updateIbanValidation(value);
});
