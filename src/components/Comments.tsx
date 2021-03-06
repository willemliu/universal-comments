import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import CommentsStore, { Comment } from '../stores/CommentsStore';
import styles from './Comments.module.scss';
import {
    getCirclesByUrl,
    getCircles,
    getCommentCount,
    PAGE_SIZE,
    getCircleCommentCountByUrl,
} from '../utils/apolloClient';
import UserStore from '../stores/UserStore';
import { Login, Provider } from './social/login/Login';
import { Pagination } from './pagination/Pagination';

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
    canonical?: string;
    onAccess?: (accessToken: string, uuid: string) => void;
    onLogin?: () => void;
    onLogout?: () => void;
    onPageChange?: (offset: number) => void;
    onCircleChange?: (circleId?: string, circleName?: string) => void;
    title?: string;
}

function Comments(props: Props) {
    const [commentCount, setCommentCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [hasNext, setHasNext] = useState(false);

    const [circles, setCircles] = useState([]);
    const [circleId, setCircleId] = useState(null);

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

    useEffect(() => {
        if (props.canonical) {
            if (circleId) {
                getCircleCommentCountByUrl(
                    props.canonical,
                    UserStore.getUuid(),
                    circleId
                ).then((count) => {
                    setCommentCount(count);
                });
            } else {
                getCommentCount(props.canonical).then((count) => {
                    setCommentCount(count);
                });
            }
        }
    }, [props.canonical, circleId]);

    useEffect(() => {
        setHasNext(offset + PAGE_SIZE < commentCount - 1);
        setHasPrevious(offset > 0);
    }, [offset, commentCount]);

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
        setProvider(provider);
        setLoggedIn(true);
        props?.onLogin?.();
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
            const circle = circles.find((circle) => circle.id === tmpCircleId);
            props?.onCircleChange(tmpCircleId, circle?.name);
        } else {
            props?.onCircleChange(null, null);
        }
    }

    function handlePreviousCommentsPage() {
        if (hasPrevious) {
            const newOffset = offset - PAGE_SIZE;
            setOffset(newOffset);
            props.onPageChange(newOffset);
        }
    }

    function handleNextCommentsPage() {
        if (hasNext) {
            const newOffset = offset + PAGE_SIZE;
            setOffset(newOffset);
            props.onPageChange(newOffset);
        }
    }

    return (
        <section className={`${styles.comments} universal-comments`}>
            <h2>
                <span>
                    {props.title || 'Comments'}
                    {loggedIn && (
                        <a
                            href="/admin"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Manage your comments"
                        >
                            ⚙️
                        </a>
                    )}
                </span>
                <section className={styles.circle}>
                    <label htmlFor="circle">Circle:</label>
                    <select
                        id="circle"
                        name="circle"
                        onChange={handleCircleChange}
                    >
                        <option value="">Public</option>
                        {circles.map((circle: any) => (
                            <option value={circle.id} key={circle.id}>
                                {circle.name}{' '}
                                {circle?.comments_aggregate?.aggregate?.count
                                    ? `(${circle?.comments_aggregate?.aggregate?.count})`
                                    : null}
                            </option>
                        ))}
                    </select>
                    {loggedIn && (
                        <a
                            href="/circles"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Manage your circles"
                        >
                            ⚙️
                        </a>
                    )}
                </section>
            </h2>

            {hasPrevious && (
                <Pagination
                    hasPrev={hasPrevious}
                    hasNext={hasNext}
                    onNext={handleNextCommentsPage}
                    onPrevious={handlePreviousCommentsPage}
                />
            )}
            {comments.map((comment) => {
                return (
                    <CommentCard
                        key={comment?.id}
                        id={comment?.id}
                        circleId={circleId}
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
                        editedComment={comment?.edited_comment}
                        subComments={comment?.subComments || []}
                        loggedIn={loggedIn}
                        noForm={false}
                    />
                );
            })}
            {(hasPrevious || hasNext) && (
                <Pagination
                    hasPrev={hasPrevious}
                    hasNext={hasNext}
                    onNext={handleNextCommentsPage}
                    onPrevious={handlePreviousCommentsPage}
                />
            )}

            {loggedIn && <CommentForm circleId={circleId} />}
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

export { Comments };
