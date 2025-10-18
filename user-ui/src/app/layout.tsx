import Header from "../shared/widgets/header/header";
import "./global.css";
import { Poppins, Roboto } from "next/font/google";
import { AuthProvider } from "../shared/context/AuthContext";
import { WishlistProvider } from "../shared/context/WishlistContext";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "TitanStore - Premium Products at Unbeatable Prices",
  description:
    "Discover amazing deals on premium products at TitanStore. Your ultimate destination for quality shopping.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable}`}>
        <AuthProvider>
          <WishlistProvider>
            <Header />
            {children}
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
