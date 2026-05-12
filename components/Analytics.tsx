import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function Analytics() {
  return (
    <>
      {GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="lazyOnload"
          />
          <Script id="ga4-init" strategy="lazyOnload">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: true });
          `}</Script>
        </>
      ) : null}

      {PIXEL_ID ? (
        <Script id="meta-pixel-init" strategy="lazyOnload">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}</Script>
      ) : null}
    </>
  );
}
