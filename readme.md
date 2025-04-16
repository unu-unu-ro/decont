# 📄 PDF Generator Web App

A **simple and clean web application** to generate professional PDF documents (like **invoices**, **quotes**, or **customer offers**) right from your browser.

🛠️ Original build took two hours using:
- [VSCode](https://code.visualstudio.com/)
- [GitHub Copilot Chat](https://code.visualstudio.com/docs/copilot/getting-started-chat)

---
## 🌐 Live Demo

👉 [Click here to try the app live](https://ovidiuchis.github.io/invpdfgenerator/)

---

## ✨ Features

- Generate PDFs directly in your browser
- Customizable document header:
  - Upload or link a logo
  - Manual title entry
  - Add fields like date, customer info, etc.
- Load table data from a JSON API (via a data URL)
  - The app will expect a array JSON and consume it (see sample data bellow)
- One-click PDF generation and download
- Saves your input automatically in **local storage** so you don’t lose your work

---

## 🚀 Tech Stack

- **HTML**
- **CSS**
- **JavaScript**

---

### 📄 Sample Data

You can use the following sample data files to test the app:

- 👉 [`dummydata1.json`](https://ovidiuchis.github.io/invpdfgenerator/assets/dummydata1.json) – general product listing (e.g., invoice or offer)
- 👉 [`dummydata2.json`](https://ovidiuchis.github.io/invpdfgenerator/assets/dummydata2.json) – invoice annex (some project task lines with details)
- 👉 [this random JSON](https://jsonplaceholder.typicode.com/posts) from [jsonplaceholder](https://jsonplaceholder.typicode.com/)

**How to use in the live demo:**

1. Copy the URL of one of them
2. Paste it into the **"Data URL"** field in the [live demo](https://ovidiuchis.github.io/invpdfgenerator/).
3. Click **"Preview"** and generate your PDF.

---

## 📸 Screenshot

![screenshot](assets/ss1.png)
![screenshot](assets/ss2.png)
![screenshot](assets/ss3.png)
![screenshot](assets/ss4.png)

---
## ✅ TODO

- [ ] Add other customization options: text color, detail color
- [ ] Group the color inputs in a collapsible section

      
## 📦 Local Installation (Optional)

If you want to run it locally:

```bash
git clone https://github.com/ovidiuchis/invpdfgenerator.git
cd invpdfgenerator
```
