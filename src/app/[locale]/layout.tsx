'use client';

import { useEffect } from 'react';

function DirectionSetter({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);
  return null;
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params?.locale === 'en' ? 'en' : 'ar';
  return (
    <>
      <DirectionSetter locale={locale} />
      {children}
    </>
  );
}