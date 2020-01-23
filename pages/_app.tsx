import React from 'react';
import './styles.css';
import Head from 'next/head';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: any) {
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta
                    httpEquiv="Content-Security-Policy"
                    content="default-src 'self' * data:; img-src * data:; style-src 'self' * 'unsafe-inline'; script-src 'self' * 'unsafe-inline' 'unsafe-eval';"
                />
                <meta name="uc:disabled" content="true" />

                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.css"
                />
            </Head>
            <Component {...pageProps} />
        </>
    );
}
