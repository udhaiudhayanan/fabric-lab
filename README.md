# fabric-lab
hyperledger project
cat <<EOF > README.md
# Exercise 4: Hyperledger Fabric Network with Java SDK

## Project Overview
This project demonstrates the creation and deployment of a blockchain network using **Hyperledger Fabric v2.5**.

## Components
- **Network:** 2 Organizations (Org1, Org2) + 1 Orderer Service.
- **Channel:** \`mychannel\` initialized and joined by all peers.
- **Chaincode:** \`asset-transfer-basic\` written in **Java**.
- **SDK:** Interacted with the network using the **Fabric Gateway SDK for Java**.

## Transactions Performed
1. **Setup:** Network initialized using Fabric binaries.
2. **Install/Instantiate:** Java chaincode deployed via Lifecycle commands.
3. **Invoke:** Successfully created asset on the ledger.
4. **Query:** Verified world state retrieval of assets.

EOF

git add README.md
git commit -m "Update README with professional project documentation"
git push origin main