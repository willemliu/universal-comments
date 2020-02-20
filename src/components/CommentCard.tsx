import React, { useEffect } from 'react';
import CommentsStore, { Comment } from '../stores/CommentsStore';
import { useState } from 'react';
import { CommentScore } from './CommentScore';
import { insertScore, removeComment } from '../utils/apolloClient';
import { CommentForm } from './CommentForm';
import UserStore from '../stores/UserStore';
import ReactMarkdown from 'react-markdown';
import styles from './CommentCard.module.scss';
import { EditForm } from './EditForm';
import ReactDiffViewer from 'react-diff-viewer';

interface Props {
    comment: string;
    editedComment: string;
    circleId?: string;
    displayName: string;
    id: string;
    generation?: number;
    parentId: string;
    score: number;
    timestamp: string;
    updated: string;
    removed: boolean;
    url: string;
    image: string;
    userUuid: string;
    subComments?: Comment[];
    loggedIn?: boolean;
    noForm?: boolean;
    showLink?: boolean;
}

function CommentCard(props: Props) {
    const [userId, setUserId] = useState(UserStore.getId());
    const [uuid, setUuid] = useState(UserStore.getUuid());
    const timestamp = new Date(props.timestamp);
    const updated = props.updated ? new Date(props.updated) : undefined;
    const [score, setScore] = useState(props.score);
    const [collapsed, setCollapsed] = useState(
        props.score < 0 || props.removed
    );
    const [reply, setReply] = useState(false);
    const [edit, setEdit] = useState(false);
    const [showDiff, setShowDiff] = useState(false);

    const ageSeconds = Math.floor((+new Date() - +timestamp) / 1000);

    useEffect(() => {
        const subscriptionId = UserStore.subscribe(() => {
            setUserId(UserStore.getId());
            setUuid(UserStore.getUuid());
        });
        return () => {
            UserStore.unsubscribe(subscriptionId);
        };
    }, []);

    function toggleCollapse() {
        setCollapsed(!collapsed);
    }

    async function vote(vote: number) {
        try {
            setScore(await insertScore(userId, uuid, vote, props.id));
        } catch (e) {
            console.error(e);
        }
    }

    async function handleRemoveComment() {
        if (
            confirm(
                'Are you sure you want to remove this comment? This action is not reversible.'
            )
        ) {
            CommentsStore.updateComment(
                await removeComment(props.id, userId, uuid)
            );
        }
    }

    function toggleReply() {
        setReply(!reply);
        setEdit(false);
    }

    function toggleEdit() {
        setReply(false);
        setEdit(!edit);
    }

    function toggleDiff() {
        setShowDiff(!showDiff);
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

    function handleEditSubmit() {
        setEdit(false);
    }

    function isDifferent() {
        return props.editedComment && props.comment !== props.editedComment;
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
                    <div>
                        {!props.removed && isDifferent() && (
                            <a
                                className={styles.diffButton}
                                onClick={toggleDiff}
                                title="View changes"
                            >
                                📜
                            </a>
                        )}
                        {!props.removed &&
                            props.loggedIn &&
                            props.userUuid === uuid && (
                                <a
                                    className={styles.removeButton}
                                    onClick={handleRemoveComment}
                                    title="Remove comment"
                                >
                                    ☠️
                                </a>
                            )}
                    </div>
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
                            </figure>
                            <section>
                                <div className={styles.meta}>
                                    <span>{props.displayName}:</span>
                                    <span>
                                        <div>{`${timestamp.toLocaleTimeString()} ${timestamp.toLocaleDateString()}`}</div>
                                        {updated ? (
                                            <div>
                                                Update:{' '}
                                                {`${updated.toLocaleTimeString()} ${updated.toLocaleDateString()}`}
                                            </div>
                                        ) : null}
                                    </span>
                                </div>
                                {props.removed ? (
                                    <h2>[Removed]</h2>
                                ) : showDiff && isDifferent() ? (
                                    <ReactDiffViewer
                                        oldValue={`${props.comment}`}
                                        newValue={`${props.editedComment}`}
                                        splitView={true}
                                        hideLineNumbers={true}
                                        showDiffOnly={true}
                                        leftTitle="Original"
                                        rightTitle="New"
                                    />
                                ) : (
                                    <ReactMarkdown
                                        className="markdown-body"
                                        source={
                                            props.editedComment ?? props.comment
                                        }
                                        linkTarget="_blank"
                                    />
                                )}
                            </section>
                        </section>
                        {!props.removed && (
                            <footer>
                                {!props.loggedIn ? (
                                    <div>Score: {score ?? 0}</div>
                                ) : null}
                                {props.loggedIn && (
                                    <>
                                        <CommentScore
                                            score={score}
                                            onVoteUp={voteUp}
                                            onVoteNeutral={voteNeutral}
                                            onVoteDown={voteDown}
                                        />
                                        {props.showLink && (
                                            <a
                                                href={props.url}
                                                className={styles.editToggle}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={`Go to: ${props.url}`}
                                            >
                                                🔗
                                            </a>
                                        )}
                                        {!props.noForm && (
                                            <div>
                                                {props.userUuid === uuid && (
                                                    <a
                                                        className={
                                                            styles.editToggle
                                                        }
                                                        onClick={toggleEdit}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </a>
                                                )}
                                                <a
                                                    className={
                                                        styles.replyToggle
                                                    }
                                                    onClick={toggleReply}
                                                    title="Reply"
                                                >
                                                    📥
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}
                            </footer>
                        )}
                    </>
                )}
                {reply && !props.noForm ? (
                    <CommentForm
                        parentId={props.id}
                        onSubmit={handleReplySubmit}
                        circleId={props.circleId}
                    />
                ) : null}
                {edit && !props.noForm ? (
                    <EditForm
                        id={props.id}
                        onSubmit={handleEditSubmit}
                        commentText={props.editedComment ?? props.comment}
                    />
                ) : null}
            </article>
            {collapsed ||
                props.subComments.map((comment) => {
                    return (
                        <CommentCard
                            key={comment?.id}
                            comment={comment?.comment}
                            editedComment={comment?.edited_comment}
                            circleId={props.circleId}
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
                            userUuid={comment?.user?.uuid}
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
