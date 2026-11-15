// Headlines and text. next/font needs literal options in every call.
import { Playfair_Display, Work_Sans } from 'next/font/google';

const serif = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--f-serif' });
const sans = Work_Sans({ subsets: ['latin'], display: 'swap', variable: '--f-sans' });

/** The two variable class names for <html>. */
export const fontClasses = `${serif.variable} ${sans.variable}`;
