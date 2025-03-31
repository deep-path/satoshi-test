import type { Metadata } from "next";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import "@near-wallet-selector/modal-ui/styles.css";



import StyledComponentsRegistry from "@/component/styledComponentsRegistry";
import { WalletTypeContextProvider } from '@/context/walletTypeContext';
import { NearWalletSelectorContextProvider } from '@/context/nearWalletSelectorContext';
// import { BtcWalletSelectorContextProvider } from '@/context/btcWalletSelectorContext';
import { BtcWalletSelectorContextProvider } from 'btc-wallet'


import Header from '@/component/header'
import Footer from '@/component/footer'


export const metadata: Metadata = {
  title: "Satoshi Bridge",
  description: "Satoshi Bridge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/imgs/layout/header/btc.svg" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <WalletTypeContextProvider>
            <BtcWalletSelectorContextProvider>
              <NearWalletSelectorContextProvider>
                <Header />
                <div style={{ minHeight: 'calc(100vh - 124px)' }}>
                  {children}
                </div>
                <Footer />
              </NearWalletSelectorContextProvider>
            </BtcWalletSelectorContextProvider>
          </WalletTypeContextProvider>
        </StyledComponentsRegistry>

        <ToastContainer
          position={'top-right'}
          autoClose={5000}
          theme="dark"
          // toastStyle={{ backgroundColor: 'red' }}
          newestOnTop
          rtl={false}
          pauseOnFocusLoss
          closeButton={false}
          bodyClassName="btc-toast"
        />
      </body>
    </html>
  );
}
