"use client";

import { useState } from "react";
import { useWallet } from "@meshsdk/react";
import { Transaction } from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SendAssets() {
  const { connected, wallet } = useWallet();
  const [recipient, setRecipient] = useState(
    "addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr"
  );
  const [assetUnit, setAssetUnit] = useState(
    "64af286e2ad0df4de2e7de15f8ff5b3d27faecf4ab2757056d860a424d657368546f6b656e"
  );
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendAssets = async () => {
    if (!connected || !wallet) {
      setMessage("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setMessage("Submitting transaction...");

    try {
      const assets: Asset[] = [
        {
          unit: assetUnit,
          quantity: quantity,
        },
      ];

      const tx = new Transaction({ initiator: wallet }).sendAssets(
        recipient,
        assets
      );

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

    } catch (error) {
      console.error(error);
      setMessage("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Send Assets</CardTitle>
        <CardDescription>Send tokens to another wallet address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient address"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="assetUnit"
            value={assetUnit}
            onChange={(e) => setAssetUnit(e.target.value)}
            placeholder="Enter asset unit/policy ID"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity to send"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {!connected ? (
          <p className="text-center w-full text-amber-600">
            Connect Your Wallet First
          </p>
        ) : (
          <Button
            onClick={handleSendAssets}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Send Assets"}
          </Button>
        )}

        {message && (
          <div className="w-full text-center mt-4">
            <p
              className={
                message.includes("failed") ? "text-red-500" : "text-green-600"
              }
            >
              {message}
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
