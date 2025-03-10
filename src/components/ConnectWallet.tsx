import { useWallet, useWalletList } from "@meshsdk/react";
import Image from "next/image";


export const ConnectWalletButton = ({
  setShowConnectWallet,
  balance,
}: {
  setShowConnectWallet: (show: boolean) => void;
  balance: number;
}) => {
  const { name, connecting, connected } = useWallet();

  const wallets = useWalletList();

  return (
    <div
      className="hover:opacity-80 cursor-pointer bg-white text-black flex items-center gap-2 p-2 rounded-md font-bold text-lg"
      onClick={() => setShowConnectWallet(true)}>
      {connected ? (
        <>
          <img
            src={wallets.find((w) => w.name === name)?.icon || "/icons/WalletIcon.svg"}
            alt={name}
            width={32}
            height={32}
            style={{ width: "32px", height: "100%" }}
          />
          <div className="h-fit">₳{" " + (balance / 100000).toFixed(4)}</div>
        </>
      ) : connecting ? (
        "Connecting..."
      ) : (
        "Connect Wallet"
      )}
    </div>
  );
};

export const ConnectWalletPrompt = ({ setShowConnectWallet }: { setShowConnectWallet: (show: boolean) => void }) => {
  const { connect, disconnect, connected } = useWallet();

  const wallets = useWalletList();

  const handleConnect = (walletName: string) => {
    connect(walletName);
    setShowConnectWallet(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowConnectWallet(false);
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-transparent backdrop-blur-sm">
      <div onClick={() => setShowConnectWallet(false)} className="absolute left-0 top-0 z-[-1] h-full w-full " />
      <div className="flex flex-col w-1/5 gap-2 rounded-md bg-black text-white p-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Connect wallet</div>

          <div className="hover:opacity-80 cursor-pointer" onClick={() => setShowConnectWallet(false)}>
            X
          </div>
        </div>
        {wallets.map((wallet) => (
          <div
            className="hover:opacity-80 cursor-pointer flex w-full rounded-sm bg-gray-600 items-center gap-2 p-2"
            key={wallet.name}
            onClick={() => handleConnect(wallet.name)}>
            <img src={wallet.icon} alt={wallet.name} style={{ width: "48px" }} />
            <div className="capitalize text-lg">{wallet.name}</div>
          </div>
        ))}
        {connected && (
          <div
            className="hover:opacity-80 cursor-pointer w-full rounded-sm bg-gray-600 gap-2 p-2"
            onClick={() => handleDisconnect()}>
            Disconnect
          </div>
        )}
      </div>
    </div>
  );
};