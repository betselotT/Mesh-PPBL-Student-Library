"use client";

import { Transaction } from "@meshsdk/core";
import { useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";
import { Configuration, MaestroClient } from "@maestro-org/typescript-sdk";

// Initialize Maestro client
// Note: In production, you should use environment variables for the API key
const maestroClient = new MaestroClient(
  new Configuration({
    apiKey:
      process.env.NEXT_PUBLIC_MAESTRO_API_KEY ||
      "zm9KGHFZ7F1OqDpquHrpwi6J7OsIsMFa",
    network: "Preprod", // Change to 'Mainnet' for production
  })
);

export default function StakingPage() {
  const { wallet, connected } = useWallet();
  const [rewardAddress, setRewardAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [stakeStatus, setStakeStatus] = useState<{
    registered: boolean;
    staked: boolean;
  } | null>(null);

  const poolId = "pool1mhww3q6d7qssj5j2add05r7cyr7znyswe2g6vd23anpx5sh6z8d"; // Gimbalabs stake pool

  useEffect(() => {
    if (connected) {
      wallet?.getRewardAddresses().then(async (addresses) => {
        console.log("reward addresses: ", addresses);
        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          setRewardAddress(address);

          // Check stake status when reward address is available
          try {
            const status = await checkIfStaked(address);
            setStakeStatus(status);
          } catch (err) {
            console.error("Error checking stake status:", err);
          }
        }
      });
    }
  }, [connected, wallet]);

  // Check if stake address is registered and delegated to our pool
  const checkIfStaked = async (rewardAddress: string) => {
    try {
      const info = await maestroClient.accounts.accountInfo(rewardAddress);
      const { registered, delegated_pool } = info.data;
      return {
        registered,
        staked: delegated_pool === poolId,
      };
    } catch (error) {
      console.error("Error checking stake status:", error);
      return { registered: false, staked: false };
    }
  };

  const delegateStake = async () => {
    if (!rewardAddress) {
      setError("No reward address available");
      return;
    }

    setIsLoading(true);
    setError("");
    setTxHash("");

    try {
      // Check current stake status
      const { registered, staked } = await checkIfStaked(rewardAddress);

      // If already staked to our pool, show appreciation message
      if (staked) {
        console.log("Already staked to our pool");
        setTxHash("Already staked to our pool. Thank you for your support!");
        setIsLoading(false);
        return;
      }

      // Otherwise proceed with delegation
      const tx = new Transaction({ initiator: wallet });

      // Only register stake if not already registered
      if (!registered) {
        tx.registerStake(rewardAddress);
      }

      tx.delegateStake(rewardAddress, poolId);

      // Build, sign and submit transaction
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const submittedTxHash = await wallet.submitTx(signedTx);

      console.log("Transaction submitted successfully:", submittedTxHash);
      setTxHash(submittedTxHash);

      // Update stake status after successful delegation
      setStakeStatus({ registered: true, staked: true });
    } catch (error) {
      console.error("Staking error: ", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Stake Delegation</h2>

      {connected ? (
        <>
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-green-600 font-semibold">Wallet Connected</p>
            {rewardAddress ? (
              <p className="text-sm mt-2 break-all">
                <span className="font-medium">Reward Address:</span>{" "}
                {rewardAddress}
              </p>
            ) : (
              <p className="text-sm mt-2">Fetching Reward Address...</p>
            )}

            {stakeStatus && (
              <div className="mt-3 text-sm">
                <p>
                  <span className="font-medium">Registration Status:</span>{" "}
                  {stakeStatus.registered ? (
                    <span className="text-green-600">Registered</span>
                  ) : (
                    <span className="text-yellow-600">Not Registered</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Delegation Status:</span>{" "}
                  {stakeStatus.staked ? (
                    <span className="text-green-600">
                      Delegated to our pool
                    </span>
                  ) : (
                    <span className="text-yellow-600">
                      Not delegated to our pool
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={delegateStake}
            disabled={isLoading || !rewardAddress}
            className={`w-full font-bold py-2 px-4 rounded transition-colors ${
              isLoading || !rewardAddress
                ? "bg-gray-400 cursor-not-allowed"
                : stakeStatus?.staked
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading
              ? "Processing..."
              : stakeStatus?.staked
              ? "Already Staked"
              : "Delegate Stake"}
          </button>

          {error && (
            <p className="mt-3 p-2 bg-red-50 text-red-600 rounded">{error}</p>
          )}

          {txHash && !error && (
            <div className="mt-3 p-2 bg-green-50 text-green-600 rounded">
              {txHash.startsWith("Already") ? (
                <p>{txHash}</p>
              ) : (
                <p>
                  Transaction submitted: {txHash.substring(0, 10)}...
                  <a
                    href={`https://preprod.cexplorer.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1 underline text-blue-500"
                  >
                    View on Explorer
                  </a>
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="p-4 bg-yellow-50 rounded text-center">
          <p className="font-medium text-yellow-700">Wallet Not Connected</p>
          <p className="mt-2 text-sm text-yellow-600">
            Please connect your wallet before delegating stake
          </p>
        </div>
      )}
    </div>
  );
}
