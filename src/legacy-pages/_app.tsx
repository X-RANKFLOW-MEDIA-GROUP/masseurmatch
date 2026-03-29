import type { AppContext, AppProps } from "next/app";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import "@/index.css";

export default function LegacyPagesApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <MemoryRouter>
        <Component {...pageProps} />
      </MemoryRouter>
    </AuthProvider>
  );
}

LegacyPagesApp.getInitialProps = async ({ Component, ctx }: AppContext) => {
  const pageProps = Component.getInitialProps
    ? await Component.getInitialProps(ctx)
    : {};

  return { pageProps };
};
