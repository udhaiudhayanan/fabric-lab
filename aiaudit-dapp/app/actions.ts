'use server'
import { getBlockchainContract } from '@/lib/fabric';

export async function getModelHistory(modelId: string) {
    console.log(`>>> [WEB3_SYSTEM] AUDIT_REQUEST: ${modelId}`);
    try {
        const { contract, gateway } = await getBlockchainContract();
        
        // Use evaluateTransaction to query the ledger without creating a new block
        const resultBuffer = await contract.evaluateTransaction('AI-Audit:getModelHistory', modelId);
        const resultString = resultBuffer.toString();
        
        await gateway.disconnect();

        // Robust Parser for Fabric History Strings
        let cleaned = resultString
            .replace(/(TxId|Value|Timestamp|IsDelete):/g, '"$1":')
            .replace(/Timestamp":\s*(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/g, 'Timestamp": "$1"')
            .replace(/Value":\s*({.*?})/g, 'Value": $1');

        if (cleaned.startsWith('[TxId')) {
            cleaned = cleaned.replace('[TxId', '[{"TxId"');
        }

        let finalData = [];
        try {
            finalData = JSON.parse(cleaned);
        } catch (e) {
            // Fallback: Manual regex match if JSON.parse fails
            const matches = resultString.match(/TxId:.*?, Value: {.*?}/g);
            if (matches) {
                finalData = matches.map(m => ({
                    TxId: m.match(/TxId: (.*?),/)?.[1],
                    Value: JSON.parse(m.match(/Value: ({.*?})/)?.[1] || '{}')
                }));
            }
        }

        return { 
            success: true, 
            data: Array.isArray(finalData) ? finalData : [finalData] 
        };

    } catch (error: any) {
        console.error(">>> [WEB3_SYSTEM] QUERY_EMPTY_OR_FAILED:", error.message);
        return { success: false, error: error.message, data: [] };
    }
}
