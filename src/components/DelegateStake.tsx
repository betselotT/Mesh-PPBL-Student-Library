"use client";

import { Transaction } from "@meshsdk/core";
import { useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";

export default function StakingPage() {
  const { wallet, connected } = useWallet();
  const [rewardAddress, setRewardAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (connected) {
      wallet?.getRewardAddresses().then((addresses) => {
        console.log("reward addresses: ", addresses);
        if (addresses && addresses.length > 0) {
          setRewardAddress(addresses[0]);
        }
      });
    }
  }, [connected, wallet]);

  const delegateStake = async () => {
    if (!rewardAddress) {
      setError("No reward address available");
      return;
    }

    setIsLoading(true);
    setError("");
    setTxHash("");

    const poolId = "pool1mhww3q6d7qssj5j2add05r7cyr7znyswe2g6vd23anpx5sh6z8d"; // Gimbalabs stake pool

    try {
      // Check if stake is already registered
      const isRegistered = await checkIfStakeIsRegistered(rewardAddress);

      const tx = new Transaction({ initiator: wallet });

      // Only register stake if not already registered
      if (!isRegistered) {
        tx.registerStake(rewardAddress);
      }

      tx.delegateStake(rewardAddress, poolId);

      // Make sure to add some ADA for the transaction fee
      const walletAddresses = await wallet.getUsedAddresses();
      if (walletAddresses.length === 0) {
        throw new Error("No wallet addresses available");
      }

      // Build, sign and submit transaction
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const submittedTxHash = await wallet.submitTx(signedTx);

      console.log("Transaction submitted successfully:", submittedTxHash);
      setTxHash(submittedTxHash);
    } catch (error) {
      console.error("Staking error: ", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if stake is already registered
  const checkIfStakeIsRegistered = async (
    stakeAddress: string
  ): Promise<boolean> => {
    try {
      // This is a placeholder - you would need to implement this based on
      // MeshSDK capabilities or use a Cardano blockchain API
      // For example, you might query the blockchain or use wallet.getUtxos()
      console.log(`Checking if stake address ${stakeAddress} is registered`);
      return false; // Default to false if you can't check
    } catch (error) {
      console.error("Error checking stake registration:", error);
      return false;
    }
  };

  return (
    <div className="p-3">
      {connected ? (
        <>
          <p className="mb-2">Connected</p>
          {rewardAddress ? (
            <p className="mb-4">Reward Address: {rewardAddress}</p>
          ) : (
            <p className="mb-4">Fetching Reward Address...</p>
          )}

          <button
            onClick={delegateStake}
            disabled={isLoading || !rewardAddress}
            className={`font-bold py-2 px-4 rounded ${
              isLoading || !rewardAddress
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? "Processing..." : "Delegate Stake"}
          </button>

          {error && <p className="mt-2 text-red-500">{error}</p>}
          {txHash && (
            <p className="mt-2 text-green-500">
              Transaction submitted: {txHash.substring(0, 10)}...
            </p>
          )}
        </>
      ) : (
        <>
          <p>Wallet Not Connected</p>
          <p>Connect your wallet before delegating stake</p>
        </>
      )}
    </div>
  );
}
