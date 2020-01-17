import React, { useState } from 'react';
import Head from 'next/head';
import {
    FBSDK,
    FacebookLogin,
} from '../src/components/social/login/FacebookLogin';
import {
    GoogleSDK,
    GoogleLogin,
} from '../src/components/social/login/GoogleLogin';
import { getApolloClient } from '../src/utils/apolloClient';
import { gql } from 'apollo-boost';
import { Provider } from '../src/components/Comments';
import { Circles } from '../src/components/circles/Circles';

export default function admin() {
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [provider, setProvider] = useState(null);
    const [circles, setCircles] = useState([]);

    function onAccess(accessToken: string) {
        setLoading(true);
        const client = getApolloClient();
        client
            .query({
                variables: {
                    accessToken,
                },
                query: gql`
                    query($accessToken: String!) {
                        circles(
                            where: {
                                users_circles: {
                                    user: { token: { _eq: $accessToken } }
                                }
                            }
                        ) {
                            name
                            password
                        }
                    }
                `,
            })
            .then((value) => {
                console.log(value?.data?.circles);
                if (value?.data?.circles) {
                    setCircles(() => value?.data?.circles);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function login(provider: Provider) {
        setProvider(provider);
        setLoggedIn(true);
    }

    function logout() {
        setLoggedIn(false);
        setProvider(null);
        setCircles([]);
    }

    return (
        <>
            <Head>
                <title>Circles - Universal Comments</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta name="uc:disabled" content="true" />
                <FBSDK key="facebook" />
                <GoogleSDK key="google" />

                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.css"
                />
            </Head>

            {loading ? (
                <div className="blink">Loading...</div>
            ) : (
                <Circles circles={circles} />
            )}

            <div>
                {!loggedIn || provider === 'facebook' ? (
                    <FacebookLogin
                        onLogin={login}
                        onLogout={logout}
                        onAccess={onAccess}
                    />
                ) : null}
                {!loggedIn || provider === 'google' ? (
                    <GoogleLogin
                        onLogin={login}
                        onLogout={logout}
                        onAccess={onAccess}
                    />
                ) : null}
            </div>
            <small>Universal comments circles</small>
        </>
    );
}
