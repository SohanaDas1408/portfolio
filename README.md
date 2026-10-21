# Sohana Das — Software Engineer & AI/ML Specialist Portfolio

A modern, job-ready personal portfolio website for **Sohana Das** designed to showcase academic depth, published research, software engineering internships, and industry credentials.

**Front-End:** 100% focused on a clean, professional, Silicon Valley-standard presentation of Sohana's resume.  
**Background:** An automatic, silent IP tracking and visitor ledger engine that records the IP address, location, device, and timestamp of every person who opens the portfolio.

---

## 🌟 Resume Highlights on the Webpage

- **Executive Identity:** **Sohana Das** — *Computer Science & Engineering | AI / Deep Learning, Full-Stack & Cyber Systems*.
- **Published Patent Spotlight:**
  - **Patent Published:** *ML & DL-Based Fake News Detection System*
  - **Indian Patent Office (2026)** | **Application No: 202521126334**
  - **Role:** Co-Inventor & Lead Pipeline Architect
  - Scholarly overview of contextual text embeddings, semantic analysis, and multi-class neural classifiers.
- **Featured Technical Projects:**
  - **Fake Review Detection using Deep Learning Models** (94.8% Accuracy, 0.93 F1-score, BERT, RoBERTa, Bi-LSTM, Flask API on 50,000+ records).
  - **Contextual Embedding for Next Word Prediction** (28% Perplexity drop on Penn Treebank, GPT-2, LSTM, GRU).
  - **Fake News Detection using ML & DL** (44,000+ labeled articles, SVM, LSTM, BERT, NLTK).
- **Work Experience & Simulations:**
  - **Maincrafts Technology** (2025) — Software Development & AI Intern (Chatbots, RESTful APIs in Python & SQL, schema optimization).
  - **Tata** (June 2026) — Cybersecurity Analyst Job Simulation (IAM fundamentals & strategy).
  - **Deloitte** (June 2026) — Cyber Job Simulation (Threat modeling, governance & risk mitigation).
- **Academic Credentials:**
  - **Symbiosis Institute of Technology, Nagpur** — B.Tech CSE (CGPA: **8.48 / 10**, 2024–2028).
  - **St. Claret School, Kolkata** — Class XII ISC: 84.5% | Class X ICSE: 93.2%.
- **Certifications:** Red Hat Academy (Python), IBM SkillsBuild, Maincrafts, Tata, Deloitte.
- **Official Resume PDF Download:** 1-click verified download (`assets/docs/Sohana_Das_Resume.pdf`).
- **Formal Headshot:** High-resolution portrait (`assets/images/sohanaformalpic.jpg`).

---

## 🛡️ Getting Visitor IPs Whenever Someone Opens Your Portfolio

All tracking operates completely in the background without affecting the professional appearance. You have multiple ways to receive the visitor's IP:

1. **Instant Phone Notifications via Discord / Slack Webhook (Fastest & Free):**
   - Click **"Analytics"** in the footer (or press `Ctrl + Shift + A`).
   - Paste your Discord Webhook URL (from any private Discord channel: Channel Settings > Integrations > Webhooks).
   - Every time a visitor or recruiter opens your portfolio, your phone will get an instant push notification with their **IP Address**, **City**, **Country**, **ISP**, **Device**, and **Time**.
2. **Direct Email Alerts to Your Inbox (`iamsohanadas1408@gmail.com`):**
   - In the Analytics modal, paste a free Web3Forms access key (from [web3forms.com](https://web3forms.com)) or a Formspree URL.
   - An email is automatically sent to `iamsohanadas1408@gmail.com` with the visitor's IP and location every time someone visits.
3. **Live Terminal Console Alerts:**
   - If running `python serve.py` or `node server.js`, the terminal prints an alert the instant a visitor arrives:
     `🚨 [VISITOR ALERT] IP Address: 157.34.12.89 | Time: 2026-10-21T11:15:00Z`
4. **Persistent Access Ledger & CSV/JSON Export:**
   - Every visitor IP is saved to browser storage and to `logs/visitors.json` on disk.
   - Press **`Ctrl + Shift + A`** on the portfolio at any time to inspect the full table or export logs to CSV/JSON.
5. **Origin IP-Stamped Recruiter Messages:**
   - When someone submits the contact form, their verified origin IP address is automatically recorded alongside their message.

---

## 🚀 Running & Deploying

### Option 1: Run Locally Right Now (Zero Dependencies)
```powershell
python serve.py
```
Open **`http://localhost:8000`** in your browser.

*(You can also simply double-click `index.html` to open it immediately in any web browser!)*

### Option 2: Deploy to Vercel (Free & Recommended)
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository and click **Deploy**.
4. The pre-configured `vercel.json` and `api/visitor.js` handle edge IP detection automatically.

### Option 3: Deploy to GitHub Pages (100% Free Static Hosting)
1. Push this repository to GitHub.
2. Go to **Settings > Pages** and select `main` branch root `/`.
3. The background client-side IP resolver works automatically with zero server configuration.

### Option 4: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and link your GitHub repo.
2. The included `netlify.toml` and `netlify/functions/visitor.js` are ready to go.

---

## 📁 Repository Structure

```
├── index.html                   # Professional single-page portfolio
├── styles.css                   # Modern Silicon Valley styling & typography
├── script.js                    # Silent background IP tracking & analytics modal
├── serve.py                     # Zero-dependency local Python server
├── server.js                    # Node.js Express server with IP capture
├── app.py                       # Python Flask server
├── package.json                 # Node dependencies
├── requirements.txt             # Python dependencies
├── vercel.json                  # Vercel deployment configuration
├── netlify.toml                 # Netlify deployment configuration
├── api/
│   └── visitor.js               # Vercel serverless function
├── netlify/
│   └── functions/
│       └── visitor.js           # Netlify serverless function
├── assets/
│   ├── images/
│   │   └── sohanaformalpic.jpg  # Sohana's formal resume picture
│   └── docs/
│       └── Sohana_Das_Resume.pdf# Verified PDF resume for download
└── logs/
    └── visitors.json            # Persistent visitor IP ledger
```

---

## 👤 Contact

- **Name:** Sohana Das
- **Email:** iamsohanadas1408@gmail.com
- **Phone:** +91 8777741907
- **LinkedIn:** [linkedin.com/in/sohana-das-943a44311](https://linkedin.com/in/sohana-das-943a44311)
- **Location:** Nagpur, Maharashtra, India
