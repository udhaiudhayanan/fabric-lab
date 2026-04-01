/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.samples.assettransfer;

import java.util.ArrayList;
import java.util.List;
import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ChaincodeStub;
import com.owlike.genson.Genson;

@Contract(
        name = "basic",
        info = @Info(
                title = "Asset Transfer",
                description = "The hyperledger fabric fitness rewards transfer",
                version = "0.0.1-SNAPSHOT"))
@Default
public final class AssetTransfer implements ContractInterface {

    private final Genson genson = new Genson();

    private enum AssetTransferErrors {
        ASSET_NOT_FOUND,
        ASSET_ALREADY_EXISTS
    }

    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public void InitLedger(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();
        // Initializing Members with Points (Simplified to 3 arguments)
        putAsset(ctx, new Asset("member1", "Tomoko", 300));
        putAsset(ctx, new Asset("member2", "Brad", 400));
        putAsset(ctx, new Asset("member3", "Jin Soo", 500));
        putAsset(ctx, new Asset("member4", "Max", 600));
        putAsset(ctx, new Asset("member5", "Adrian", 700));
        putAsset(ctx, new Asset("member6", "Michel", 800));
    }

    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public Asset CreateAsset(final Context ctx, final String assetID, final String owner, final int appraisedValue) {
        if (AssetExists(ctx, assetID)) {
            throw new ChaincodeException("Member " + assetID + " already exists", AssetTransferErrors.ASSET_ALREADY_EXISTS.toString());
        }
        return putAsset(ctx, new Asset(assetID, owner, appraisedValue));
    }

    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public Asset ReadAsset(final Context ctx, final String assetID) {
        String assetJSON = ctx.getStub().getStringState(assetID);
        if (assetJSON == null || assetJSON.isEmpty()) {
            throw new ChaincodeException("Member " + assetID + " does not exist", AssetTransferErrors.ASSET_NOT_FOUND.toString());
        }
        return genson.deserialize(assetJSON, Asset.class);
    }

    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public Asset UpdateAsset(final Context ctx, final String assetID, final String owner, final int appraisedValue) {
        if (!AssetExists(ctx, assetID)) {
            throw new ChaincodeException("Member " + assetID + " does not exist", AssetTransferErrors.ASSET_NOT_FOUND.toString());
        }
        return putAsset(ctx, new Asset(assetID, owner, appraisedValue));
    }

    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public Asset TransferAsset(final Context ctx, final String assetID, final String newOwner) {
        Asset asset = ReadAsset(ctx, assetID);
        return putAsset(ctx, new Asset(asset.getAssetID(), newOwner, asset.getAppraisedValue()));
    }

    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public String GetAllAssets(final Context ctx) {
        List<Asset> queryResults = new ArrayList<>();
        ctx.getStub().getStateByRange("", "").forEach(result -> queryResults.add(genson.deserialize(result.getStringValue(), Asset.class)));
        return genson.serialize(queryResults);
    }

    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public boolean AssetExists(final Context ctx, final String assetID) {
        String assetJSON = ctx.getStub().getStringState(assetID);
        return (assetJSON != null && !assetJSON.isEmpty());
    }

    private Asset putAsset(final Context ctx, final Asset asset) {
        ctx.getStub().putStringState(asset.getAssetID(), genson.serialize(asset));
        return asset;
    }
}