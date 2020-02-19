import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard';
import CommentsStore from '../stores/CommentsStore';
import styles from './Comments.module.scss';
import { Login, Provider } from './social/login/Login';
import { PrimaryButton } from './buttons/buttons';

interface Props {
    canonical?: string;
    onAccess?: (accessToken: string, uuid: string) => void;
    onLogout?: () => void;
    onNextPage?: () => void;
    onPrevPage?: () => void;
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

            {!!comments?.length && (
                <section className={styles.nextPrevButtonsContainer}>
                    <PrimaryButton onClick={props.onPrevPage}>
                        Previous
                    </PrimaryButton>
                    <PrimaryButton onClick={props.onNextPage}>
                        Next
                    </PrimaryButton>
                </section>
            )}

            {!comments?.length && <h2>No comments</h2>}

            {comments.map((comment) => {
                return (
                    <CommentCard
                        key={comment?.id}
                        id={comment?.id}
                        displayName={comment?.user?.display_name}
                        generation={0}
                        userUuid={comment?.user?.uuid}
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

            {!!comments?.length && (
                <section className={styles.nextPrevButtonsContainer}>
                    <PrimaryButton onClick={props.onPrevPage}>
                        Previous
                    </PrimaryButton>
                    <PrimaryButton onClick={props.onNextPage}>
                        Next
                    </PrimaryButton>
                </section>
            )}

            <Login
                className={styles.loginContainer}
                onLogin={login}
                onLogout={logout}
                onAccess={props.onAccess}
                loggedIn={loggedIn}
                provider={provider}
            />
        </section>
    );
}

export { AdminComments };
