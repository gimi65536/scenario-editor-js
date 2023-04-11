import '@/styles/globals.css'
import { Open_Sans, Noto_Sans_JP, Noto_Sans_TC } from 'next/font/google'

const open_sans = Open_Sans({ subsets: ['latin', 'latin-ext'] })
const noto_sans_jp = Noto_Sans_JP({ weight: '400', preload: false })
const noto_sans_tc = Noto_Sans_TC({ weight: '400', preload: false })

export default function App({ Component, pageProps }) {
  return (
    <>
      <style global jsx>{`
        html {
          font-family: ${open_sans.className} ${noto_sans_jp.className} ${noto_sans_tc.className};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
