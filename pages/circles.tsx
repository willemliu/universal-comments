import React, { useState } from 'react';
import Head from 'next/head';
import { FacebookLogin } from '../src/components/social/login/FacebookLogin';
import { GoogleLogin } from '../src/components/social/login/GoogleLogin';
import { getApolloClient } from '../src/utils/apolloClient';
import { gql } from 'apollo-boost';
import { Provider } from '../src/components/Comments';
import { Circles } from '../src/components/circles/Circles';
import UserStore from '../src/stores/UserStore';
import styles from './circles.module.css';

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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formEl = e.currentTarget;
        const formData = new FormData(formEl);
        const name = formData.get('name');
        const password = formData.get('password');

        if (name && password) {
            const client = getApolloClient();
            try {
                const id = await client
                    .mutate({
                        variables: {
                            name,
                            password,
                        },
                        mutation: gql`
                            mutation($name: String!, $password: String!) {
                                insert_circles(
                                    objects: {
                                        name: $name
                                        password: $password
                                    }
                                ) {
                                    returning {
                                        id
                                    }
                                }
                            }
                        `,
                    })
                    .then((value: any) => {
                        console.log(
                            value?.data?.insert_circles?.returning?.[0]
                        );
                        return value?.data?.insert_circles?.returning?.[0]?.id;
                    });

                await client
                    .mutate({
                        variables: {
                            userId: UserStore.getId(),
                            circleId: id,
                        },
                        mutation: gql`
                            mutation($userId: String!, $circleId: bigint!) {
                                insert_users_circles(
                                    objects: {
                                        user_id: $userId
                                        circle_id: $circleId
                                    }
                                ) {
                                    affected_rows
                                }
                            }
                        `,
                    })
                    .then((value: any) => {
                        console.log(value);
                    });
            } catch (err) {
                console.error(e, err);
                alert(
                    `Couldn't add the [${name}] circle. Please notify the administrator of this error.`
                );
            }
        }
        formEl.reset();
        window.location.reload();
    }

    function login(provider: Provider) {
        setProvider(provider);
        setLoggedIn(true);
    }

    function logout() {
        setLoggedIn(false);
        setProvider(null);
        setCircles(() => []);
    }

    return (
        <section className={styles.circles}>
            <Head>
                <title>Circles - Universal Comments</title>
            </Head>
            <h1>Circles</h1>
            <p>
                You can manage your circles here. When you have one or more
                circles you can write comments within these circles. Only users
                who are also accepted within a circle can read your comments in
                that circle vice versa. When you are writing a comment you'll
                have the option to place that comment in a circle or open. Open
                comments can be read by everyone. Replies to another message
                placed in a circle will automatically be placed within that
                circle.
            </p>

            {loading ? (
                <div className="blink">Loading...</div>
            ) : (
                <>{loggedIn ? <Circles circles={circles} /> : null}</>
            )}

            {loggedIn ? (
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>Add circle</legend>
                        <input
                            type="text"
                            name="name"
                            placeholder="Circle name"
                        />
                        <input
                            type="text"
                            name="password"
                            placeholder="Circle password"
                        />
                        <button>➕</button>
                    </fieldset>
                </form>
            ) : null}

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
        </section>
    );
}
