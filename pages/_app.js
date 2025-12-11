import { ThemeProvider } from "../context/ThemeContext";
import "../styles/global.css";
import "../styles/theme-speciale.css";
import "../styles/theme-jardin.css";
import "../styles/theme-zen.css";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
