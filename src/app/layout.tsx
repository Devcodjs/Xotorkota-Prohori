import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aapada Mitra | আপদ মিত্ৰ : Community First Responders ",
  description: "Empowering communities with trained volunteers for effective disaster response and preparedness in Assam. Learn about the Aapada Mitra scheme, training programs, and how to become a friend in emergencies. | অসমত প্ৰাকৃতিক দুৰ্যোগৰ মোকাবিলা আৰু প্ৰস্তুতিৰ বাবে প্ৰশিক্ষিত স্বেচ্ছাসেৱকসকলৰ জৰিয়তে সমাজক শক্তিশালী কৰা হৈছে। আপদা মিত্ৰ আঁচনি, প্ৰশিক্ষণ কাৰ্যসূচী, আৰু জৰুৰীকালীন অৱস্থাত কেনেকৈ বন্ধু হ'ব পাৰি তাৰ বিষয়ে জানক।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
