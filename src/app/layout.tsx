import { Inter, Noto_Kufi_Arabic } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoKufi = Noto_Kufi_Arabic({ subsets: ['arabic'], variable: '--font-noto-kufi' });

export const metadata = {
  title: 'NADOS - من أرض الحضارة... نصنع مستقبل التكنولوجيا',
  description: 'منصة تقنية عراقية تجمع خدمات تطوير المواقع والتطبيقات، الهندسة، تحليل الأسواق، التعليم، حلول الأعمال، والحلول المخصصة في منظومة واحدة.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${notoKufi.variable}`} suppressHydrationWarning>
      <body className="font-arabic">{children}</body>
    </html>
  );
}