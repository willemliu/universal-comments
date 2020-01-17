import React from 'react';
import { useEffect, useState } from 'react';
import UserStore from '../../../stores/UserStore';
import { createUser } from '../../../utils/apolloClient';
import { SecondaryButton } from '../../buttons/buttons';

declare let gapi: any;

interface Props {
    onAccess?: (accessToken: string) => void;
    onLogin?: (provider: string) => void;
    onLogout?: () => void;
}

const provider = 'google';

function GoogleLogin(props: Props) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [GoogleAuth, setGoogleAuth] = useState(null);

    useEffect(() => {
        gapi.load('auth2', function() {
            gapi.auth2.init({
                client_id:
                    '426807433984-fjqermuq3moa27vho9he9dr9upjqafro.apps.googleusercontent.com',
            });
            setGoogleAuth(gapi.auth2.getAuthInstance());
        });
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

                    console.log(profile, authResponse);

                    await createUser(
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

                    props?.onLogin(provider);
                    if (props?.onAccess) {
                        props?.onAccess(authResponse.access_token);
                    }
                } else {
                    UserStore.clear();
                    props?.onLogout();
                }
            });

            if (GoogleAuth.isSignedIn.get()) {
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

    return (
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
