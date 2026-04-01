# 🛡️ AI-Audit: Model Integrity Ledger

A decentralized audit log for AI models built on **Hyperledger Fabric**. This project ensures that AI models haven't been tampered with by storing their cryptographic hashes on a permissioned ledger.

## ✨ Key Features
* **Glassmorphism UI:** Modern, transparent interface inspired by cosmos.so.
* **Blockchain Integration:** Connects to a Hyperledger Fabric network via a Gateway.
* **Real-time Auditing:** Instantly verify model history and integrity.

## 🛠️ Tech Stack
- **Frontend:** Next.js 15, Tailwind CSS
- **Blockchain:** Hyperledger Fabric v2.5, Docker
- **Language:** TypeScript

## 📸Screenshots
![alt text](<Screenshot 2026-04-02 at 12.34.06 AM.png>)

## 🚀 How to Run Locally
1. **Start the Network:** Run `./network.sh up` in the fabric-samples directory.
2. **Deploy Chaincode:** Deploy the `aiaudit` chaincode to `mychannel`.
3. **Run the App:**
   ```bash
   cd aiaudit-dapp
   npm install
   npm run dev
   \```