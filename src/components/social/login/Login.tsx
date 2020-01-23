import React from 'react';
import { FacebookLogin } from './FacebookLogin';
import { GoogleLogin } from './GoogleLogin';
import { Auth0Login } from './Auth0Login';

export type Provider = 'facebook' | 'google' | 'auth0';

interface Props {
    className?: string;
    loggedIn?: boolean;
    onAccess?: (accessToken: string, uuid: string) => void;
    onLogin?: (provider: string) => void;
    onLogout?: () => void;
    provider?: Provider;
}

function Login(props: Props) {
    return (
        <div className={props.className}>
            {!props.loggedIn || props.provider === 'auth0' ? (
                <Auth0Login
                    onLogin={props.onLogin}
                    onLogout={props.onLogout}
                    onAccess={props.onAccess}
                />
            ) : null}
            {/* {!props.loggedIn || props.provider === 'facebook' ? (
        <FacebookLogin
            onLogin={props.onLogin}
            onLogout={props.onLogout}
            onAccess={props.onAccess}
        />
    ) : null}
    {!props.loggedIn || props.provider === 'google' ? (
        <GoogleLogin
            onLogin={props.onLogin}
            onLogout={props.onLogout}
            onAccess={props.onAccess}
        />
    ) : null} */}
        </div>
    );
}

export { Login };
