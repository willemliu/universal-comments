import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { FacebookLogin } from './social/login/FacebookLogin';
import { GoogleLogin } from './social/login/GoogleLogin';
import CommentsStore, { Comment } from '../stores/CommentsStore';
import styles from './Comments.module.css';
import { getCirclesByUrl, getCircles } from '../utils/apolloClient';
import UserStore from '../stores/UserStore';

export type Provider = 'facebook' | 'google';

interface Props {
    canonical?: string;
    onAccess?: (accessToken: string, uuid: string) => void;
    onLogout?: () => void;
    onCircleChange?: (circleId?: number) => void;
}

function AdminComments(props: Props) {
    const [circles, setCircles] = useState([]);
    const [circleId, setCircleId] = useState(null);

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

    useEffect(() => {
        if (loggedIn && UserStore.getUuid()) {
            if (props.canonical) {
                getCirclesByUrl(props.canonical, UserStore.getUuid()).then(
                    (fetchedCircles) => {
                        setCircles(fetchedCircles);
                    }
                );
            } else {
                getCircles(UserStore.getUuid()).then((fetchedCircles) => {
                    setCircles(fetchedCircles);
                });
            }
        } else {
            setCircles([]);
        }
    }, [loggedIn]);

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

    function handleCircleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const tmpCircleId = e.currentTarget.value || null;
        setCircleId(tmpCircleId);
        if (tmpCircleId) {
            props?.onCircleChange(Number.parseInt(tmpCircleId, 10));
        } else {
            props?.onCircleChange(null);
        }
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
                        circleId={circleId}
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
