"use client";

import { useState } from "react";
import { MeshProvider, CardanoWallet, useWallet } from "@meshsdk/react";
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
import { Transaction } from "@meshsdk/core";

export default function SendTransaction() {
  const { connected, wallet } = useWallet();
  const [recipient, setRecipient] = useState(
    "addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr"
  );
  const [amount, setAmount] = useState("1000000");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // New state for displaying the message

  const handleSendTransaction = async () => {
    if (!connected || !wallet) {
      setMessage("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setMessage("Submitting transaction...");

    try {
      const tx = new Transaction({ initiator: wallet }).sendLovelace(
        recipient,
        amount
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
        <CardTitle>Send ADA</CardTitle>
        <CardDescription>Send ADA to another wallet address</CardDescription>
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
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in lovelace (1 ADA = 1,000,000 lovelace)"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {!connected ? (
          <p>Connect Your Wallet First</p>
        ) : (
          <Button
            onClick={handleSendTransaction}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Send Transaction"}
          </Button>
        )}
      </CardFooter>

      {/* Show message as h2 */}
      {message && <h2>{message}</h2>}
    </Card>
  );
}
