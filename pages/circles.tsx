import React, { useState } from 'react';
import Head from 'next/head';
import { getCircles, addCircle, joinCircle } from '../src/utils/apolloClient';
import { Circles } from '../src/components/circles/Circles';
import UserStore from '../src/stores/UserStore';
import styles from './circles.module.scss';
import { Login, Provider } from '../src/components/social/login/Login';

export default function circles() {
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [provider, setProvider] = useState(null);
    const [circles, setCircles] = useState([]);

    async function onAccess(accessToken: string, uuid: string) {
        setLoading(true);
        try {
            setCircles(await getCircles(uuid));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formEl = e.currentTarget;
        const formData = new FormData(formEl);
        const name = formData.get('name').toString();

        if (name) {
            try {
                await addCircle(UserStore.getId(), name);
                formEl.reset();
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert(
                    `Couldn't add the [${name}] circle. Please notify the administrator of this error.`
                );
            }
        }
    }

    async function handleJoinSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formEl = e.currentTarget;
        const formData = new FormData(formEl);
        const name = formData.get('name').toString();
        const password = formData.get('password').toString();

        if (name && password) {
            try {
                await joinCircle(UserStore.getId(), name, password);
                formEl.reset();
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert(
                    `Couldn't join the [${name}] circle. Please notify the administrator of this error.`
                );
            }
        }
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
                that circle and vice versa. When you are writing a comment
                you'll have the option to place that comment in a circle or
                open. Open comments can be read by everyone. Replies to another
                message placed in a circle will automatically be placed within
                that circle.
            </p>
            <p>
                To add other users to your circle you can share the Circle name
                and password with them. They can use that info to join the
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
                        <legend>Create circle</legend>
                        <input
                            type="text"
                            name="name"
                            placeholder="Circle name"
                        />
                        <button title="Create circle">➕</button>
                    </fieldset>
                </form>
            ) : null}

            {loggedIn ? (
                <form onSubmit={handleJoinSubmit}>
                    <fieldset>
                        <legend>Join circle</legend>
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
                        <button title="Join circle">🤝</button>
                    </fieldset>
                </form>
            ) : null}

            <Login
                onLogin={login}
                onLogout={logout}
                onAccess={onAccess}
                loggedIn={loggedIn}
                provider={provider}
            />

            <small>Universal comments circles</small>
        </section>
    );
}
