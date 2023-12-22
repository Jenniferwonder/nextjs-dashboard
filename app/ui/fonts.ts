//  This will be your primary font
import { Inter } from 'next/font/google';
import { Lusitana } from 'next/font/google';
// specify what subset you'd like to load. In this case, 'latin'
export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({ weight: "400", subsets: ['latin']});
