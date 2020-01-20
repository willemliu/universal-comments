import React, { useState } from 'react';
import Head from 'next/head';
import { FacebookLogin } from '../src/components/social/login/FacebookLogin';
import { GoogleLogin } from '../src/components/social/login/GoogleLogin';
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
                            id
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
