import type { Metadata } from 'next';
import './original.css';
import './globals.css';
// Social previews (LinkedIn especially) require an absolute og:image URL, so
// resolve the production origin at build time and fall back for local dev.
const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const site = origin ? `https://${origin}` : 'http://localhost:3000';
const title = 'Jihan Chowdhury — Computer Engineer';
const blurb = 'From interface to instruction. Explore the work of Jihan Chowdhury.';
const card = {url:'/og.png',width:1200,height:630,alt:'Jihan Chowdhury — Computer Engineer, Toronto'};

export const metadata: Metadata = {
 metadataBase:new URL(site),
 title, description:'Computer engineering at Toronto Metropolitan University. Full-stack platforms, applied AI, data systems, embedded and FPGA work.',
 openGraph:{title,description:blurb,type:'website',url:site,siteName:'Jihan Chowdhury',locale:'en_CA',images:[card]},
 twitter:{card:'summary_large_image',title,description:blurb,images:[card.url]},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en" data-theme="dark" suppressHydrationWarning><head><link rel="icon" href="/favicon.svg"/><script dangerouslySetInnerHTML={{__html:`try{document.documentElement.dataset.theme=localStorage.getItem('jc-theme')==='light'?'light':'dark'}catch(e){}`}} /></head><body>{children}</body></html>;
}
