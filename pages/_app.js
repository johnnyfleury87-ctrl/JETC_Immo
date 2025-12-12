import { ThemeProvider } from "../context/ThemeContext";
import { DemoModeProvider } from "../context/DemoModeContext";
import "../styles/global.css";
import "../styles/animations.css";
import "../styles/marketing.css";
import "../styles/theme-speciale.css";
import "../styles/theme-jardin.css";
import "../styles/theme-zen.css";

export default function App({ Component, pageProps }) {
  return (
    <DemoModeProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </DemoModeProvider>
  );
}
