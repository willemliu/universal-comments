import React, { useEffect, useState } from 'react';
import UserStore from '../../../stores/UserStore';
import { createUser } from '../../../utils/apolloClient';
import { SecondaryButton } from '../../buttons/buttons';
import styles from './social.module.css';

declare let window: any;
declare let FB: any;

interface Props {
    onAccess?: (accessToken: string, uuid: string) => void;
    onLogin?: (provider: string) => void;
    onLogout?: () => void;
}

const provider = 'facebook';

function FacebookLogin(props: Props) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        if (window?.FB) {
            FB.Event.subscribe('auth.statusChange', (response) => {
                setAccessToken(response?.authResponse?.accessToken);
                setLoggedIn(response.status === 'connected');
            });
            FB.getLoginStatus((response) => {
                setAccessToken(response?.authResponse?.accessToken);
                setLoggedIn(response.status === 'connected');
            });
        }
    }, []);

    useEffect(() => {
        if (window?.FB && loggedIn && accessToken) {
            let uuid = '';
            FB.api(
                '/me',
                { fields: 'id,name,email,picture' },
                async (response: any) => {
                    console.log('FB /me', response);
                    uuid = await createUser(
                        response.id,
                        response.name,
                        response.email,
                        response.picture?.data?.url,
                        accessToken
                    );

                    UserStore.setId(response.id);
                    UserStore.setName(response.name);
                    UserStore.setEmail(response.email);
                    UserStore.setImage(response.picture?.data?.url);
                    UserStore.setToken(accessToken);
                    UserStore.setUuid(uuid);
                }
            );
            props?.onLogin(provider);
            if (props?.onAccess) {
                props?.onAccess(accessToken, uuid);
            }
        }
    }, [loggedIn, accessToken]);

    function login() {
        FB.login(null, { scope: 'email', return_scopes: true });
    }

    function logout() {
        UserStore.clear();
        props?.onLogout();
        FB.logout();
    }

    return window?.FB ? (
        <>
            {loggedIn ? (
                <SecondaryButton onClick={logout}>
                    Logout Facebook
                </SecondaryButton>
            ) : (
                <SecondaryButton onClick={login}>
                    Login with Facebook
                </SecondaryButton>
            )}
        </>
    ) : (
        <span className={styles.alert}>
            Your browser has blocked some scripts required for Facebook login to
            work.
        </span>
    );
}

function FBSDK() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `window.fbAsyncInit = function() {
                    FB.init({
                        appId            : '725143261345249',
                        autoLogAppEvents : true,
                        xfbml            : true,
                        version          : 'v5.0'
                    });
                };
                (function(d, s, id){
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {return;}
                    js = d.createElement(s); js.id = id;
                    js.src = "https://connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));`,
            }}
        />
    );
}

export { FacebookLogin, FBSDK };
