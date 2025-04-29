function $(selector, parent) {
  return (parent || document).querySelector(selector);
}

// Cache-uim referințele DOM pentru elementele utilizate frecvent
const elements = {
  // Câmpuri de intrare
  name: $("#name"),
  date: $("#date"),
  purpose: $("#purpose"),
  paymentMethod: $("#paymentMethod"),
  iban: $("#iban"),
  explanation: $("#explanation"),
  amount: $("#amount"),

  // Elemente pentru preview
  previewName: $("#previewName"),
  previewDate: $("#previewDate"),
  previewPurpose: $("#previewPurpose"),
  previewPaymentMethod: $("#previewPaymentMethod"),
  previewIban: $("#previewIban"),

  // Elemente IBAN
  ibanresult: $("#ibanresult"),
  ibanholder: $("#ibanholder"),
  ibanlabel: $("#ibanlabel"),

  // Alte elemente
  dataTableBody: $("#dataTable tbody"),
  dataTableFoot: $("#dataTable tfoot"),
  signature: $("#signature"),
  signatureName: $("#signatureName"),
  canvas: $("#signatureCanvas")
};

function formatDate(date) {
  console.info("format", date);
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleDateString("ro-RO");
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
  const previewFormattedDate = formatDate(currentDate);
  elements.previewDate.textContent = previewFormattedDate;
});

// Asigură-te că data din input este transformată corect pentru live preview
elements.date.addEventListener("input", function () {
  if (this.value) {
    elements.previewDate.textContent = formatDate(this.value);
  }
});

// Adaugă funcționalitate pentru a adăuga date în tabel și actualizare live
const addToTableButton = $("#addToTable");

// Adaugă funcționalitate pentru calcularea totalului
function calculateTotal() {
  const rows = Array.from(elements.dataTableBody.querySelectorAll("tr"));
  let total = 0;

  // Calculate total from all rows in tbody
  rows.forEach(row => {
    const amountCell = row.querySelector("td:nth-child(3)");
    if (amountCell) {
      total += parseFloat(amountCell.textContent) || 0;
    }
  });

  // Clear existing tfoot content
  elements.dataTableFoot.innerHTML = "";

  // Create total row in tfoot
  const totalRow = document.createElement("tr");
  totalRow.id = "totalRow";
  totalRow.innerHTML = `
    <td colspan="2">TOTAL</td>
    <td id="totalAmount">${total.toFixed(2)}</td>
    <td class="action-column"></td>
  `;

  // Add total row to tfoot
  elements.dataTableFoot.appendChild(totalRow);
}

// Modifică evenimentul de adăugare în tabel pentru a recalcula totalul
addToTableButton.addEventListener("click", () => {
  const documentValue = $("#document").value;
  const explanationValue = elements.explanation.value;
  const amountValue = elements.amount.value;

  if (documentValue && amountValue) {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td>${documentValue}</td>
      <td>${explanationValue}</td>
      <td>${parseFloat(amountValue).toFixed(2)}</td>
      <td class="action-column">
        <button class="remove-btn" title="Șterge rând">❌</button>
      </td>
    `;

    // Adaugă event listener pentru butonul de ștergere
    const removeBtn = newRow.querySelector(".remove-btn");
    removeBtn.addEventListener("click", function () {
      newRow.remove();
      calculateTotal();
    });

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
elements.canvas.addEventListener("mousedown", e => {
  const rect = elements.canvas.getBoundingClientRect();
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

elements.canvas.addEventListener("mousemove", e => {
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
elements.canvas.addEventListener("touchstart", e => {
  const rect = elements.canvas.getBoundingClientRect();
  const touch = e.touches[0];
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  e.preventDefault();
});

elements.canvas.addEventListener("touchmove", e => {
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
const clearButton = $("#clearSignature");
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
  elements.signature.src = ""; // Resetează imaginea
});

// Salvează semnătura ca imagine
const saveButton = $("#saveSignature");

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
