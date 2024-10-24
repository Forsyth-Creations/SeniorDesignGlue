import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "../components/QueryWrapper/QueryWrapper";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "../contexts/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "MDE Glue",
  description: "MDE Glue is a tool to help you manage the MDE class.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
