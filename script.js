function $(selector, parent) {
  return (parent || document).querySelector(selector);
}

// Add signatureStatus boolean variable
let signatureStatus = false;

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
  ibanholder: $("#ibanholder"),
  ibanlabel: $("#ibanlabel"),

  // Details section
  personalInfoSection: $("#personal-info-section"),

  // Alte elemente
  dataTableBody: $("#dataTable tbody"),
  dataTableFoot: $("#dataTable tfoot"),
  signature: $("#signature"),
  signatureName: $("#signatureName"),
  canvas: $("#signatureCanvas")
};

function formatDate(date) {
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

  // Set the required attribute based on visibility
  elements.iban.required = visible;

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
    elements.iban.setCustomValidity(""); // Clear any validation message
  } else {
    elements.iban.classList.remove("valid");
    elements.iban.setCustomValidity("IBAN invalid! Formatul corect este: RO46BTRL06701205T61531XX");
    elements.iban.reportValidity(); // Show validation message
  }
}

// Salvează modalitatea de încasare în localStorage și actualizează live preview
function updateLivePreview() {
  const nameValue = elements.name.value;
  const dateValue = elements.date.value;
  const purposeValue = elements.purpose.value;
  const iban = elements.iban.value.trim().toUpperCase();
  const paymentMethodValue = elements.paymentMethod.value;

  // Salvează datele în localStorage
  localStorage.setItem("savedName", nameValue);
  localStorage.setItem("savedPaymentMethod", paymentMethodValue);
  localStorage.setItem("savedIban", iban);
  localStorage.setItem("savedPurpose", purposeValue);

  elements.previewName.textContent = nameValue;
  elements.previewDate.textContent = formatDate(dateValue);
  elements.previewPurpose.textContent = purposeValue;
  elements.previewPaymentMethod.textContent = paymentMethodValue;

  if (paymentMethodValue === "Transfer bancar") {
    elements.previewIban.textContent = iban;
    toggleIbanVisibility(true);
  } else {
    toggleIbanVisibility(false);
  }
}

// Function to draw signature image on canvas
function drawSignatureOnCanvas(canvas, imageSrc) {
  const ctx = canvas.getContext("2d");
  const scale = window.devicePixelRatio || 1;

  const img = new Image();
  img.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the proper dimensions to maintain aspect ratio while fitting within canvas
    const canvasWidth = canvas.width / scale;
    const canvasHeight = canvas.height / scale;

    let drawWidth, drawHeight;
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas (relative to height)
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
    } else {
      // Image is taller than canvas (relative to width)
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
    }

    // Center the image on the canvas
    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };
  img.src = imageSrc;
}

window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("savedName");
  const savedPaymentMethod = localStorage.getItem("savedPaymentMethod");
  const savedIban = localStorage.getItem("savedIban");
  const savedSignature = localStorage.getItem("savedSignature");
  const savedPurpose = localStorage.getItem("savedPurpose");

  if (savedName) {
    elements.name.value = savedName;
    elements.previewName.textContent = savedName;
    if (savedSignature) {
      elements.signatureName.textContent = savedName;
    }
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

  if (savedPurpose) {
    elements.purpose.value = savedPurpose;
    elements.previewPurpose.textContent = savedPurpose;
  }

  // Asigură-te că starea IBAN-ului este corectă în funcție de modalitatea de plată
  const paymentMethodValue = elements.paymentMethod.value;
  if (paymentMethodValue === "Transfer bancar") {
    elements.previewIban.textContent = savedIban || "";
    toggleIbanVisibility(true);
  } else {
    toggleIbanVisibility(false);
  }

  if (savedSignature) {
    elements.signature.src = savedSignature;
    elements.signature.alt = "Semnătură";
    signatureStatus = true;

    drawSignatureOnCanvas(elements.canvas, savedSignature);
  }

  if (!savedName || (paymentMethodValue === "Transfer bancar" && (!savedIban || !isValidRomanianIBAN(savedIban)))) {
    // Auto-open the details section if no name is saved or payment method is "Transfer bancar" without valid IBAN
    elements.personalInfoSection.setAttribute("open", "open");
  }

  // data - use local date to avoid timezone issues
  const currentDate = new Date();
  // Format date as YYYY-MM-DD using local date parts
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const localDateString = `${year}-${month}-${day}`;

  elements.date.value = localDateString;
  elements.previewDate.textContent = formatDate(currentDate);
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
ctx.lineWidth = 3;

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
  signatureStatus = false; // Reset signature status
});

// Salvează semnătura și numele în secțiunea din dreapta jos
$("#saveSignature").addEventListener("click", () => {
  const dataURL = elements.canvas.toDataURL("image/png");

  // Store signature in localStorage
  localStorage.setItem("savedSignature", dataURL);

  // Afișează semnătura în img cu id="signature"
  elements.signature.src = dataURL;
  elements.signature.alt = "Semnătură";

  // Afișează numele în <p id="signatureName">
  const nameValue = elements.name.value;
  elements.signatureName.textContent = nameValue;

  // Set signature status to "yes" so form can be submitted
  signatureStatus = true;
});

["name", "date", "purpose", "paymentMethod", "iban"].forEach(field => {
  $(`#${field}`).addEventListener("input", updateLivePreview);
});

elements.iban.addEventListener("input", e => {
  updateIbanValidation(e.target.value);
});

$("#pdfForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const tableRows = elements.dataTableBody.querySelectorAll("tr");
  if (tableRows.length === 0) {
    alert("Adăugați cel puțin un document!");
    $("#tableSection").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (!signatureStatus) {
    alert("Vă rugăm să aplicați semnătura!");
    // Scroll to signature section for better UX
    $("#signatureSection").scrollIntoView({ behavior: "smooth" });
    return;
  }

  // Update document title with current date in ISO format for easy sorting / finding
  const isoDate = new Date().toISOString().split("T")[0]; // Gets YYYY-MM-DD format
  document.title = `${isoDate} Decont Unu-Unu`;

  window.print();
});
