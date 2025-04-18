# FSOCalculator – Foreign Service Officer Benefits Calculator (PWA)

A Progressive Web App (PWA) designed to help Foreign Service Officers (FSOs) calculate key post-employment benefits, including:

- 💵 **Severance Pay**
- 🏛️ **FSPS Annuity**
- 📊 **Health Insurance (FEHB, ACA, COBRA)**

This tool works offline, supports iOS/Android installation, and features a responsive, accessible interface.

---

## 🔗 Live Demo

📱 [Use the Calculator](https://rjgeiser.github.io/FSOCalculator)

---

## 📁 Project Structure

```
FSOCalculator/
├── index.html               # Main entry point
├── css/
│   └── style.css            # Core UI styling and dark mode support
├── js/
│   └── main.js              # Form logic, calculations, and PWA wiring
├── img/
│   ├── icon-192.png         # PWA install icon
│   ├── icon-512.png         # High-res app icon
│   ├── apple-splash-*.jpg   # iOS splash screens
├── manifest.json            # Web App Manifest (name, icons, theme)
├── sw.js                    # Service Worker (offline support)
└── README.md                # You're reading it
```

---

## 💠 Features

- 📊 **Multi-scenario Annuity Estimator**  
  Calculates Immediate, TERA, MRA+10, and Deferred retirement options.

- ⚖️ **Salary & SFS Rank Handling**  
  Accurately reflects salary progression for all FS levels including SFS tiers.

- 🏥 **Health Coverage Comparison**  
  Projects FEHB (employee + government share), ACA premiums, and COBRA costs.

- �� **Leave & Severance Tools**  
  Uses SCD and sick leave to adjust service time and payouts.

- 🥉 **Offline First**  
  Installs to home screen and works without a network.

- ♿ **Accessible by Design**  
  Built-in ARIA labels, keyboard navigation, and visual contrast support.

---

## 🚀 Deployment: GitHub Pages

1. Push to the `main` branch.
2. Go to **Settings > Pages** in the GitHub UI.
3. Set:
   - **Branch** = `main`
   - **Folder** = `/ (root)`
4. Save and visit the published URL provided.

---

## 📆 Local Testing

Clone and launch locally with any static server:

```bash
git clone https://github.com/rjgeiser/FSOCalculator.git
cd FSOCalculator
npx http-server . -c-1
```

Then open: `http://localhost:8080`

---

## 🧠 Developer Notes

- **Service Worker versioning**  
  Update `CACHE_VERSION` in `sw.js` when publishing updates to ensure users get the latest files.

- **Main logic lives in `main.js`**  
  Includes DOM bindings, UI rendering, and calculators. SFS-specific salary logic is embedded inside `FormManager.getFormData()`.

- **Only one `getFormData()` method exists**  
  Defined inside `FormManager` class and used throughout.

---

## 🤝 Contributions

Pull requests are welcome! Just follow these steps:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Commit with clear messages
4. Open a pull request

Please lint your JS and keep the code modular where possible.

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

