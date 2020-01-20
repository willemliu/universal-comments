import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { FacebookLogin } from './social/login/FacebookLogin';
import { GoogleLogin } from './social/login/GoogleLogin';
import CommentsStore, { Comment } from '../stores/CommentsStore';
import styles from './Comments.module.css';

export type Provider = 'facebook' | 'google';

function assembleDescendents(comments: Comment[]) {
    try {
        let roots = [...comments];
        roots.forEach((comment) => {
            if (comment.parent_id) {
                const parent = roots.find(
                    (ancestor) => ancestor.id === comment.parent_id
                );
                if (parent.subComments) {
                    parent.subComments.push(comment);
                } else {
                    parent.subComments = [comment];
                }
            }
        });
        roots = roots.filter((dupe) => dupe.parent_id === null);
        return roots;
    } catch (e) {
        return comments;
    }
}

interface Props {
    noForm?: boolean;
    onAccess?: (accessToken: string) => void;
    title?: string;
}

function Comments(props: Props) {
    const [provider, setProvider] = useState<Provider>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [comments, setComments] = useState(
        assembleDescendents(
            JSON.parse(JSON.stringify(CommentsStore.getComments()))
        )
    );

    useEffect(() => {
        const subscriptionId = CommentsStore.subscribe(() => {
            setComments(
                assembleDescendents(
                    JSON.parse(JSON.stringify(CommentsStore.getComments()))
                )
            );
        });
        return () => {
            CommentsStore.unsubscribe(subscriptionId);
        };
    }, []);

    function login(provider: Provider) {
        setProvider(provider);
        setLoggedIn(true);
    }

    function logout() {
        setLoggedIn(false);
        setProvider(null);
    }

    return (
        <section className={`${styles.comments} universal-comments`}>
            {loggedIn && (
                <section className={styles.adminLinks}>
                    <a
                        href="/circles"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Manage Circles⚙️
                    </a>
                    <a href="/admin" target="_blank" rel="noopener noreferrer">
                        Manage Your Comments⚙️
                    </a>
                </section>
            )}

            <h2>
                <span>{props.title || 'Comments'}</span>
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
                        noForm={props.noForm}
                    />
                );
            })}
            {loggedIn && !props.noForm && <CommentForm />}
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

export { Comments };
