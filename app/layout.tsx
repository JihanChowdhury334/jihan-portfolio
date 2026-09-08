import type { Metadata } from 'next';
import './original.css';
import './globals.css';
export const metadata: Metadata = {title:'Jihan Chowdhury — Computer Engineer', description:'Computer engineering at Toronto Metropolitan University. Full-stack platforms, applied AI, data systems, embedded and FPGA work.',openGraph:{title:'Jihan Chowdhury — Computer Engineer',description:'From interface to instruction. Explore the work of Jihan Chowdhury.',type:'website'}};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en" data-theme="dark" suppressHydrationWarning><head><link rel="icon" href="/favicon.svg"/><script dangerouslySetInnerHTML={{__html:`try{document.documentElement.dataset.theme=localStorage.getItem('jc-theme')==='light'?'light':'dark'}catch(e){}`}} /></head><body>{children}</body></html>;
}
