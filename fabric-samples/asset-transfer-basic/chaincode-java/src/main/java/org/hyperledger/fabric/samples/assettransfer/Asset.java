/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.samples.assettransfer;

import java.util.Objects;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import com.owlike.genson.annotation.JsonProperty;

@DataType()
public final class Asset {

    @Property()
    private final String assetID; // Maps to MemberID

    @Property()
    private final String owner; // Member Name

    @Property()
    private final int appraisedValue; // Maps to Reward Points

    public Asset(@JsonProperty("assetID") final String assetID, 
                 @JsonProperty("owner") final String owner,
                 @JsonProperty("appraisedValue") final int appraisedValue) {
        this.assetID = assetID;
        this.owner = owner;
        this.appraisedValue = appraisedValue;
    }

    public String getAssetID() { return assetID; }
    public String getOwner() { return owner; }
    public int getAppraisedValue() { return appraisedValue; }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) return true;
        if ((obj == null) || (getClass() != obj.getClass())) return false;
        Asset other = (Asset) obj;
        return Objects.equals(getAssetID(), other.getAssetID()) &&
               Objects.equals(getOwner(), other.getOwner()) &&
               getAppraisedValue() == other.getAppraisedValue();
    }

    @Override
    public int hashCode() {
        return Objects.hash(getAssetID(), getOwner(), getAppraisedValue());
    }

    @Override
    public String toString() {
        return "Member [MemberID=" + assetID + ", Name=" + owner + ", Points=" + appraisedValue + "]";
    }
}