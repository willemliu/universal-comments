import React, { useEffect, useState } from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';
import UserStore from '../../../stores/UserStore';
import { SecondaryButton } from '../../buttons/buttons';
import { createUser } from '../../../utils/apolloClient';

declare let process: any;

interface Props {
    loggedIn?: boolean;
    onAccess?: (accessToken: string, uuid: string) => void;
    onLogin?: (provider: string) => void;
    onLogout?: () => void;
}

const provider = 'auth0';

function Auth0Login(props: Props) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [auth0, setAuth0] = useState(null);

    useEffect(() => {
        setLoggedIn(props.loggedIn);
    }, [props.loggedIn]);

    async function storeUser(accessToken: string, user: any) {
        const userId = user?.sub?.split('|')?.[1];
        const { uuid, receive_mail } = await createUser(
            userId,
            user.name,
            user.email ?? `${userId}@unknown.email`,
            user.picture,
            accessToken
        );

        UserStore.setId(userId);
        UserStore.setName(user.name);
        UserStore.setEmail(user.email);
        UserStore.setImage(user.picture);
        UserStore.setToken(accessToken);
        UserStore.setUuid(uuid);
        UserStore.setReceiveMail(receive_mail);
        props?.onLogin(provider);
        if (props?.onAccess) {
            props?.onAccess(accessToken, uuid);
        }
    }

    useEffect(() => {
        // or with promises
        createAuth0Client({
            domain: process.env.AUTH0_DOMAIN,
            client_id: process.env.AUTH0_CLIENT_ID,
        }).then(async (auth) => {
            setAuth0(auth);
            if (await auth.isAuthenticated()) {
                const user = await auth.getUser();
                const accessToken = await auth.getTokenSilently();
                setLoggedIn(true);
                storeUser(accessToken, user);
            }
        });
    }, []);

    async function login() {
        await auth0.loginWithPopup({
            redirect_uri: window.location.href,
        });
        //logged in. you can get the user profile like this:
        const user = await auth0.getUser();
        const accessToken = await auth0.getTokenSilently();
        setLoggedIn(true);
        storeUser(accessToken, user);
    }

    function logout() {
        UserStore.clear();
        props?.onLogout();
        auth0.logout({
            returnTo: window.location.href,
        });
    }

    return (
        auth0 && (
            <>
                {loggedIn ? (
                    <SecondaryButton onClick={logout}>
                        Logout Auth0
                    </SecondaryButton>
                ) : (
                    <SecondaryButton onClick={login}>
                        Login with Auth0
                    </SecondaryButton>
                )}
            </>
        )
    );
}

export { Auth0Login };
