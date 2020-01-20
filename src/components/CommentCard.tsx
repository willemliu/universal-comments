import React, { useEffect } from 'react';
import CommentsStore, { Comment } from '../stores/CommentsStore';
import { useState } from 'react';
import { CommentScore } from './CommentScore';
import { gql } from 'apollo-boost';
import { getApolloClient } from '../utils/apolloClient';
import { CommentForm } from './CommentForm';
import UserStore from '../stores/UserStore';
import ReactMarkdown from 'react-markdown';
import styles from './CommentCard.module.css';

interface Props {
    comment: string;
    displayName: string;
    id: number;
    generation?: number;
    parentId: number;
    score: number;
    timestamp: string;
    updated: string;
    removed: boolean;
    url: string;
    image: string;
    userId: string;
    subComments?: Comment[];
    loggedIn?: boolean;
    noForm?: boolean;
}

function CommentCard(props: Props) {
    const [userId, setUserId] = useState(UserStore.getId());
    const timestamp = new Date(props.timestamp);
    const updated = props.updated ? new Date(props.updated) : undefined;
    const [score, setScore] = useState(props.score);
    const [collapsed, setCollapsed] = useState(
        props.score < 0 || props.removed
    );
    const [reply, setReply] = useState(false);

    const ageSeconds = Math.floor((+new Date() - +timestamp) / 1000);

    useEffect(() => {
        const subscriptionId = UserStore.subscribe(() => {
            setUserId(UserStore.getId());
        });
        return () => {
            UserStore.unsubscribe(subscriptionId);
        };
    }, []);

    function toggleCollapse() {
        setCollapsed(!collapsed);
    }

    function vote(vote: number) {
        const client = getApolloClient();
        client
            .mutate({
                variables: {
                    userId,
                    vote,
                    commentId: props.id,
                },
                mutation: gql`
                    mutation(
                        $userId: String!
                        $vote: Int!
                        $commentId: bigint!
                    ) {
                        insert_scores(
                            objects: {
                                user_id: $userId
                                score: $vote
                                comment_id: $commentId
                            }
                            on_conflict: {
                                constraint: scores_comment_id_user_id_key
                                update_columns: score
                            }
                        ) {
                            returning {
                                comment {
                                    scores_aggregate {
                                        aggregate {
                                            sum {
                                                score
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `,
            })
            .then(({ data }: any) => {
                setScore(
                    data?.insert_scores?.returning?.[0]?.comment
                        ?.scores_aggregate?.aggregate?.sum?.score || 0
                );
            })
            .catch(console.error);
    }

    function removeComment() {
        const client = getApolloClient();
        client
            .mutate({
                variables: {
                    commentId: props.id,
                    userId,
                },
                mutation: gql`
                    mutation($commentId: bigint!, $userId: String!) {
                        update_comments(
                            where: {
                                id: { _eq: $commentId }
                                user_id: { _eq: $userId }
                            }
                            _set: { removed: true, updated: "now()" }
                        ) {
                            returning {
                                id
                                updated
                                comment
                                removed
                            }
                        }
                    }
                `,
            })
            .then(({ data }: any) => {
                console.log(data?.update_comments?.returning?.[0]);
                CommentsStore.updateComment(
                    data?.update_comments?.returning?.[0]
                );
            })
            .catch(console.error);
    }

    function toggleReply() {
        setReply(!reply);
    }

    function voteUp() {
        vote(1);
    }

    function voteNeutral() {
        vote(0);
    }

    function voteDown() {
        vote(-1);
    }

    function handleReplySubmit() {
        setReply(false);
    }

    let indent = '';
    switch (props.generation) {
        case 0:
            indent = '';
            break;
        case 1:
            indent = styles.indent1;
            break;
        case 2:
            indent = styles.indent2;
            break;
        case 3:
            indent = styles.indent3;
            break;
        case 4:
            indent = styles.indent4;
            break;
        default:
            indent = styles.indent5;
    }

    return (
        <>
            <article
                className={`${styles.comment} ${indent} ${
                    ageSeconds < 3 ? 'highlight' : ''
                }`}
            >
                <header>
                    <div className={styles.collapser} onClick={toggleCollapse}>
                        {collapsed ? `➕ Show` : `➖ Hide`}
                    </div>
                    {!props.removed &&
                        props.loggedIn &&
                        `${props.userId}` === userId && (
                            <span
                                className={styles.removeButton}
                                onClick={removeComment}
                                title="Remove comment"
                            >
                                ☠️
                            </span>
                        )}
                </header>
                {collapsed || (
                    <>
                        <section className={styles.content}>
                            <figure>
                                <picture>
                                    <img
                                        src={props.image}
                                        alt={props.displayName}
                                        title={props.displayName}
                                    />
                                </picture>
                                <figcaption>{props.displayName}</figcaption>
                            </figure>
                            <section>
                                {props.removed ? (
                                    <h2>[Removed]</h2>
                                ) : (
                                    <ReactMarkdown
                                        className="markdown-body"
                                        source={decodeURI(props.comment)}
                                        linkTarget="_blank"
                                    />
                                )}
                            </section>
                        </section>
                        <footer>
                            <span>{`${timestamp.toLocaleTimeString()} ${timestamp.toLocaleDateString()}`}</span>
                            {updated ? (
                                <span>
                                    Update:{' '}
                                    {`${updated.toLocaleTimeString()} ${updated.toLocaleDateString()}`}
                                </span>
                            ) : null}
                            {!props.loggedIn ? (
                                <div>Score: {score ?? 0}</div>
                            ) : null}
                            {!props.removed && props.loggedIn && (
                                <>
                                    <CommentScore
                                        score={score}
                                        onVoteUp={voteUp}
                                        onVoteNeutral={voteNeutral}
                                        onVoteDown={voteDown}
                                    />
                                    {!props.noForm && (
                                        <a
                                            className={styles.replyToggle}
                                            onClick={toggleReply}
                                            title="Reply"
                                        >
                                            📥
                                        </a>
                                    )}
                                </>
                            )}
                        </footer>
                    </>
                )}
                {reply && !props.noForm ? (
                    <CommentForm
                        parentId={props.id}
                        onSubmit={handleReplySubmit}
                    />
                ) : null}
            </article>
            {collapsed ||
                props.subComments.map((comment) => {
                    return (
                        <CommentCard
                            key={comment?.id}
                            comment={comment?.comment}
                            id={comment?.id}
                            displayName={comment?.user?.display_name}
                            generation={props.generation + 1}
                            parentId={comment?.parent_id}
                            score={
                                comment?.scores_aggregate?.aggregate?.sum?.score
                            }
                            timestamp={comment?.timestamp}
                            updated={comment?.updated}
                            removed={comment?.removed}
                            url={comment?.url}
                            image={comment?.user?.image}
                            userId={comment?.user?.id}
                            subComments={comment?.subComments || []}
                            loggedIn={props.loggedIn}
                            noForm={props.noForm}
                        />
                    );
                })}
        </>
    );
}

export { CommentCard };
