import { Gateway, Wallets } from 'fabric-network';
import path from 'path';
import fs from 'fs';

export async function getBlockchainContract() {
    const ccpPath = path.resolve(process.cwd(), '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(process.cwd(), 'wallet');
    const certPath = path.join(walletPath, 'signcerts');
    const keyPath = path.join(walletPath, 'keystore');

    // Automatically find the first file in the directory
    const certFile = fs.readdirSync(certPath).find(f => !f.startsWith('.'));
    const keyFile = fs.readdirSync(keyPath).find(f => !f.startsWith('.'));

    if (!certFile || !keyFile) throw new Error("CRITICAL: IDENTITY_FILES_NOT_FOUND_IN_WALLET");

    const certificate = fs.readFileSync(path.join(certPath, certFile)).toString();
    const privateKey = fs.readFileSync(path.join(keyPath, keyFile)).toString();

    const wallet = await Wallets.newInMemoryWallet();
    await wallet.put('appUser', {
        credentials: { certificate, privateKey },
        mspId: 'Org1MSP',
        type: 'X.509',
    });

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    return { contract: network.getContract('aiaudit'), gateway };
}
