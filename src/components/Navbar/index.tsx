import { Asset } from "@meshsdk/core";
import { useWallet } from "@meshsdk/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectWalletButton, ConnectWalletPrompt } from "../ConnectWallet";

export default function Navbar() {
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [lovelace, setLovelace] = useState(0);
  const { connected, wallet } = useWallet();

  const getWalletBalance = async () => {
    const balance = await wallet.getBalance();
    const lovelace =
      balance.find((asset: Asset) => asset.unit === "lovelace")?.quantity || 0;
    setLovelace(Number(lovelace));
  };

  useEffect(() => {
    if (connected && wallet) {
      getWalletBalance();
    }
  }, [connected, wallet]);

  return (
    <div className="flex bg-black text-white p-5 justify-between">
      {showConnectWallet && (
        <ConnectWalletPrompt setShowConnectWallet={setShowConnectWallet} />
      )}
      <div className="flex">
        <Link href="/" className="mr-5 hover:font-bold text-xl">
          Home
        </Link>
        <Link href="/users" className="hover:font-bold text-xl">
          Users
        </Link>
      </div>
      <ConnectWalletButton
        setShowConnectWallet={setShowConnectWallet}
        balance={lovelace}
      />
    </div>
  );
}
