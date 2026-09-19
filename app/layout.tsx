import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata={title:'DataGuard AI',description:'Data quality, anomaly detection and AI incident investigation platform'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
