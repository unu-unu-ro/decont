// Salvează numele în localStorage și actualizează live preview
function updateLivePreview() {
  const nameValue = document.getElementById("name").value;
  const dateValue = document.getElementById("date").value;
  const purposeValue = document.getElementById("purpose").value;
  const paymentMethodValue = document.getElementById("paymentMethod").value;

  // Salvează numele în localStorage
  localStorage.setItem("savedName", nameValue);

  document.getElementById("previewName").textContent = nameValue;
  document.getElementById("previewDate").textContent = dateValue;
  document.getElementById("previewPurpose").textContent = purposeValue;
  document.getElementById("previewPaymentMethod").textContent = paymentMethodValue;
}

// La încărcarea paginii, preia numele salvat din localStorage și data curentă
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("savedName");
  if (savedName) {
    document.getElementById("name").value = savedName;
    document.getElementById("previewName").textContent = savedName;
  }

  // Setează data curentă în câmpul de dată
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  document.getElementById("date").value = formattedDate;

  // Actualizează data în format DD/MM/YYYY în preview
  const previewFormattedDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()}`;
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

  if (documentValue  && amountValue) {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td>${documentValue}</td>
      <td>${explanationValue}</td>
      <td>${parseFloat(amountValue).toFixed(2)}</td>
    `;

    dataTableBody.appendChild(newRow);

    // Resetează câmpurile după adăugare
    document.getElementById("document").value = "";
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

// Ensure proper scaling for high-DPI displays
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

// Șterge semnătura
const clearButton = document.getElementById("clearSignature");
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const signatureSection = document.querySelector(".signature-section");
  signatureSection.innerHTML = "<p><strong>Nume și Semnătură</strong></p>"; // Resetează conținutul
  
});

// Salvează semnătura ca imagine
const saveButton = document.getElementById("saveSignature");

// Salvează semnătura și numele în secțiunea din dreapta jos
saveButton.addEventListener("click", () => {
  const dataURL = canvas.toDataURL("image/png");

  // Afișează semnătura în secțiunea din dreapta jos
  const signatureImage = document.createElement("img");
  signatureImage.src = dataURL;
  signatureImage.alt = "Semnătură";
  signatureImage.style.width = "100px";
  signatureImage.style.height = "auto";

  const signatureSection = document.querySelector(".signature-section");
  signatureSection.innerHTML = "<p><strong>Nume și Semnătură</strong></p>"; // Resetează conținutul
  signatureSection.appendChild(signatureImage);

  // Afișează numele utilizatorului
  const nameValue = document.getElementById("name").value;
  const signatureName = document.createElement("p");
  signatureName.textContent = nameValue;
  signatureSection.appendChild(signatureName);
});
