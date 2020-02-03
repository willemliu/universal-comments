import React from 'react';
import { useEffect, useState } from 'react';
import UserStore from '../../../stores/UserStore';
import { createUser } from '../../../utils/apolloClient';
import { SecondaryButton } from '../../buttons/buttons';
import styles from './social.module.css';

declare let window: any;
declare let gapi: any;

interface Props {
    onAccess?: (accessToken: string, uuid: string) => void;
    onLogin?: (provider: string) => void;
    onLogout?: () => void;
}

const provider = 'google';

function GoogleLogin(props: Props) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [GoogleAuth, setGoogleAuth] = useState(null);
    const [apiLoaded, setApiLoaded] = useState(true);

    function isApiLoaded() {
        return window?.gapi;
    }

    useEffect(() => {
        setApiLoaded(isApiLoaded());
        if (isApiLoaded()) {
            gapi.load('auth2', function() {
                gapi.auth2.init({
                    client_id:
                        '426807433984-fjqermuq3moa27vho9he9dr9upjqafro.apps.googleusercontent.com',
                });
                setGoogleAuth(gapi.auth2.getAuthInstance());
            });
        }
    }, []);

    useEffect(() => {
        if (GoogleAuth) {
            GoogleAuth.isSignedIn.listen(async (signedIn: boolean) => {
                setLoggedIn(signedIn);
                if (signedIn) {
                    const profile = GoogleAuth.currentUser
                        .get()
                        .getBasicProfile();
                    const authResponse = GoogleAuth.currentUser
                        .get()
                        .getAuthResponse(true);

                    const uuid = await createUser(
                        profile.getId(),
                        profile.getName(),
                        profile.getEmail(),
                        profile.getImageUrl(),
                        authResponse?.access_token
                    );

                    UserStore.setId(profile.getId());
                    UserStore.setName(profile.getName());
                    UserStore.setEmail(profile.getEmail());
                    UserStore.setImage(profile.getImageUrl());
                    UserStore.setToken(authResponse?.access_token);
                    UserStore.setUuid(uuid);

                    props?.onLogin(provider);
                    if (props?.onAccess) {
                        props?.onAccess(authResponse.access_token, uuid);
                    }
                } else {
                    UserStore.clear();
                    props?.onLogout();
                }
            });

            if (GoogleAuth.isSignedIn.get()) {
                setLoggedIn(true);
                props?.onLogin(provider);
            }
        }
    }, [GoogleAuth]);

    function login() {
        GoogleAuth?.signIn();
    }

    function logout() {
        props?.onLogout();
        GoogleAuth?.signOut();
    }

    return apiLoaded ? (
        <>
            {loggedIn ? (
                <SecondaryButton onClick={logout}>
                    Logout Google
                </SecondaryButton>
            ) : (
                <SecondaryButton onClick={login}>
                    Login with Google
                </SecondaryButton>
            )}
        </>
    ) : (
        <span className={styles.alert}>
            Your browser has blocked some scripts required for Google login to
            work.
        </span>
    );
}

function GoogleSDK() {
    return (
        <>
            <meta
                name="google-signin-client_id"
                content="426807433984-fjqermuq3moa27vho9he9dr9upjqafro.apps.googleusercontent.com"
            />
            <script src="//apis.google.com/js/platform.js" />
        </>
    );
}

export { GoogleLogin, GoogleSDK };
