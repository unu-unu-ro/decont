// Salvează modalitatea de încasare în localStorage și actualizează live preview
function updateLivePreview() {
  const nameValue = document.getElementById("name").value;
  const dateValue = document.getElementById("date").value;
  const purposeValue = document.getElementById("purpose").value;
  const iban = document.getElementById("iban").value;
  const paymentMethodValue = document.getElementById("paymentMethod").value;

  // Salvează numele și modalitatea de încasare în localStorage
  localStorage.setItem("savedName", nameValue);

  document.getElementById("previewName").textContent = nameValue;
  document.getElementById("previewDate").textContent = dateValue;
  document.getElementById("previewPurpose").textContent = purposeValue;
  document.getElementById("previewPaymentMethod").textContent =
    paymentMethodValue;

  if (paymentMethodValue === "Transfer bancar") {
    document.getElementById("previewIban").textContent = iban;
    document.getElementById("ibanholder").style.display = "block";
    document.getElementById("iban").style.display = "block";
    document.getElementById("ibanlabel").style.display = "block";
  } else {
    document.getElementById("previewIban").textContent = "";
    document.getElementById("ibanholder").style.display = "none";
    document.getElementById("iban").style.display = "none";
    document.getElementById("ibanlabel").style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("savedName");
  const savedPaymentMethod = localStorage.getItem("savedPaymentMethod");

  if (savedName) {
    document.getElementById("name").value = savedName;
    document.getElementById("previewName").textContent = savedName;
  }

  if (savedPaymentMethod) {
    document.getElementById("paymentMethod").value = savedPaymentMethod;
    document.getElementById("previewPaymentMethod").textContent =
      savedPaymentMethod;
  }

  // data
  const currentDate = new Date();
  document.getElementById("date").value = currentDate
    .toISOString()
    .split("T")[0];

  // Format data în DD/MM/YYYY pentru live preview
  const previewFormattedDate = `${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}/${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${currentDate.getFullYear()}`;
  document.getElementById("previewDate").textContent = previewFormattedDate;
});

// Adaugă funcționalitate pentru a adăuga date în tabel și actualizare live
const addToTableButton = document.getElementById("addToTable");
const dataTableBody = document.querySelector("#dataTable tbody");

// Adaugă funcționalitate pentru calcularea totalului
// Modifică funcția calculateTotal pentru a menține totalul ca ultima linie
function calculateTotal() {
  const rows = Array.from(dataTableBody.querySelectorAll("tr"));
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
    dataTableBody.appendChild(totalRow);
  } else {
    dataTableBody.appendChild(totalRow); // Asigură-te că este ultima linie
  }

  document.getElementById("totalAmount").textContent = total.toFixed(2);
}

// Modifică evenimentul de adăugare în tabel pentru a recalcula totalul
addToTableButton.addEventListener("click", () => {
  const documentValue = document.getElementById("document").value;
  const explanationValue = document.getElementById("explanation").value;
  const amountValue = document.getElementById("amount").value;

  if (documentValue && amountValue) {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td>${documentValue}</td>
      <td>${explanationValue}</td>
      <td>${parseFloat(amountValue).toFixed(2)}</td>
    `;

    dataTableBody.appendChild(newRow);

    // Resetează câmpurile după adăugare
    document.getElementById("explanation").value = "";
    document.getElementById("amount").value = "";

    // Recalculează totalul
    calculateTotal();
  } else {
    alert("Documentul si valoarea sunt obligatorii!");
  }
});

// Funcționalitate pentru semnătură pe canvas
const canvas = document.getElementById("signatureCanvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;

const scale = window.devicePixelRatio || 1;
canvas.width = canvas.offsetWidth * scale;
canvas.height = canvas.offsetHeight * scale;
ctx.scale(scale, scale);

// Adjust cursor position for drawing on the canvas
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

// Add touch support for mobile devices
canvas.addEventListener("touchstart", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  e.preventDefault();
});

canvas.addEventListener("touchmove", (e) => {
  if (isDrawing) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  }
  e.preventDefault();
});

canvas.addEventListener("touchend", () => {
  isDrawing = false;
});

// Șterge semnătura
const clearButton = document.getElementById("clearSignature");
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const signatureImage = document.getElementById("signature");
  signatureImage.src = ""; // Resetează imaginea
});

// Salvează semnătura ca imagine
const saveButton = document.getElementById("saveSignature");

// Salvează semnătura și numele în secțiunea din dreapta jos
saveButton.addEventListener("click", () => {
  const dataURL = canvas.toDataURL("image/png");

  // Afișează semnătura în img cu id="signature"
  const signatureImage = document.getElementById("signature");
  signatureImage.src = dataURL;
  signatureImage.alt = "Semnătură";

  // Afișează numele în <p id="signatureName">
  const nameValue = document.getElementById("name").value;
  const signatureName = document.getElementById("signatureName");
  signatureName.textContent = nameValue;
});

function isValidRomanianIBAN(iban) {
  const cleaned = iban.toUpperCase().replace(/\s+/g, "");
  const regex = /^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/;
  return regex.test(cleaned);
}

const input = document.getElementById("iban");
const result = document.getElementById("ibanresult");

input.addEventListener("input", () => {
  const value = input.value;
  const valid = isValidRomanianIBAN(value);

  if (valid) {
    input.classList.add("valid");
    input.classList.remove("invalid");
    result.textContent = "✅ IBAN valid!";
    result.style.color = "green";
  } else {
    input.classList.add("invalid");
    input.classList.remove("valid");
    result.textContent = "❌ IBAN invalid!";
    result.style.color = "red";
  }
});
