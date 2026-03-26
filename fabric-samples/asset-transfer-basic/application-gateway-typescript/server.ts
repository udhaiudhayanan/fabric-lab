import express from 'express';
import cors from 'cors';
import * as grpc from '@grpc/grpc-js';
import { connect, Identity, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

const app = express();
const PORT = 3000;

// --- STEP 1: ADVANCED CORS & SECURITY SETTINGS ---
// This allows your Port 8080 Frontend to talk to this Port 3000 Backend
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// --- STEP 2: BLOCKCHAIN CONFIGURATION PATHS ---
const mspId = 'Org1MSP';
const cryptoPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com');
const keyDirectoryPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore');
const certPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'User1@org1.example.com-cert.pem');
const tlsCertPath = path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
const peerEndpoint = 'localhost:7051';

async function getGatewayConnection() {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    const client = new grpc.Client(peerEndpoint, tlsCredentials);

    const certificate = await fs.readFile(certPath);
    const identity: Identity = { mspId, credentials: certificate };

    const files = await fs.readdir(keyDirectoryPath);
    const fileName = files[0] || ''; 
    const keyPath = path.resolve(keyDirectoryPath, fileName);
    const privateKeyPem = await fs.readFile(keyPath);
    const signer = signers.newPrivateKeySigner(crypto.createPrivateKey(privateKeyPem));

    return connect({ client, identity, signer });
}

// --- STEP 3: API ROUTES ---

// Health Check: Test this first in your browser
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running', timestamp: new Date() });
});

// Assets Query: Pulls data from Hyperledger Fabric
app.get('/api/assets', async (req, res) => {
    console.log('--> Evaluating Transaction: GetAllAssets');
    let gateway;
    try {
        gateway = await getGatewayConnection();
        const network = gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');
        
        const resultBytes = await contract.evaluateTransaction('GetAllAssets');
        const resultJson = Buffer.from(resultBytes).toString();
        res.json(JSON.parse(resultJson));
    } catch (error) {
        console.error('Blockchain Error:', error);
        res.status(500).json({ 
            error: 'Failed to query ledger', 
            message: error instanceof Error ? error.message : 'Unknown error' 
        });
    } finally {
        if (gateway) gateway.close();
    }
});

// ROUTE 3: Create a New Asset on the Blockchain
app.post('/api/assets', async (req, res) => {
    const { id, owner, value } = req.body;
    console.log(`--> Submitting Transaction: CreateAsset ${id}`);
    
    let gateway;
    try {
        gateway = await getGatewayConnection();
        const network = gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');
        
        // This actually writes to the Ledger
        await contract.submitTransaction('CreateAsset', id, 'Blue', '5', owner, value.toString());
        
        res.status(201).json({ message: `Asset ${id} created successfully` });
    } catch (error) {
        console.error('Blockchain Write Error:', error);
        res.status(500).json({ error: 'Failed to write to ledger' });
    } finally {
        if (gateway) gateway.close();
    }
});

// ROUTE 4: Get Full Transaction History (Audit Log)
app.get('/api/history', async (req, res) => {
    console.log('--> Fetching Full Audit History');
    let gateway;
    try {
        gateway = await getGatewayConnection();
        const network = gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');
        
        // This calls a built-in Fabric function to get history for all assets
        const resultBytes = await contract.evaluateTransaction('GetAllAssets'); 
        const assets = JSON.parse(Buffer.from(resultBytes).toString());
        
        res.json({
            generatedAt: new Date().toLocaleString(),
            network: "Hyperledger Fabric v2.5",
            channel: "mychannel",
            records: assets
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit log' });
    } finally {
        if (gateway) gateway.close();
    }
});

// --- STEP 4: START SERVER ---
app.listen(PORT, () => {
    console.log(`\n🚀 ============================================`);
    console.log(`✅ API Server is LIVE on Port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Assets API: http://localhost:${PORT}/api/assets`);
    console.log(`==============================================\n`);
});