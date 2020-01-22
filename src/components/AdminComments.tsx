import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard';
import { FacebookLogin } from './social/login/FacebookLogin';
import { GoogleLogin } from './social/login/GoogleLogin';
import CommentsStore from '../stores/CommentsStore';
import styles from './Comments.module.css';

export type Provider = 'facebook' | 'google';

interface Props {
    canonical?: string;
    onAccess?: (accessToken: string, uuid: string) => void;
    onLogout?: () => void;
}

function AdminComments(props: Props) {
    const [provider, setProvider] = useState<Provider>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [comments, setComments] = useState(
        JSON.parse(JSON.stringify(CommentsStore.getComments()))
    );

    useEffect(() => {
        const subscriptionId = CommentsStore.subscribe(() => {
            setComments(
                JSON.parse(JSON.stringify(CommentsStore.getComments()))
            );
        });

        return () => {
            CommentsStore.unsubscribe(subscriptionId);
        };
    }, []);

    function login(provider: Provider) {
        console.log('Login provider', provider);
        setProvider(provider);
        setLoggedIn(true);
    }

    function logout() {
        setLoggedIn(false);
        setProvider(null);
        props?.onLogout?.();
    }

    return (
        <section className={`${styles.comments} universal-comments`}>
            <h2>
                <span>Comments Admin</span>
            </h2>
            {comments.map((comment) => {
                return (
                    <CommentCard
                        key={comment?.id}
                        id={comment?.id}
                        displayName={comment?.user?.display_name}
                        generation={0}
                        userId={comment?.user?.id}
                        parentId={comment?.parent_id}
                        url={comment?.url}
                        image={comment?.user?.image}
                        timestamp={comment?.timestamp}
                        updated={comment?.updated}
                        removed={comment?.removed}
                        score={comment?.scores_aggregate?.aggregate?.sum?.score}
                        comment={comment?.comment}
                        subComments={comment?.subComments || []}
                        loggedIn={loggedIn}
                        noForm={true}
                    />
                );
            })}
            <div className={styles.loginContainer}>
                {!loggedIn || provider === 'facebook' ? (
                    <FacebookLogin
                        onLogin={login}
                        onLogout={logout}
                        onAccess={props.onAccess}
                    />
                ) : null}
                {!loggedIn || provider === 'google' ? (
                    <GoogleLogin
                        onLogin={login}
                        onLogout={logout}
                        onAccess={props.onAccess}
                    />
                ) : null}
            </div>
        </section>
    );
}

export { AdminComments };