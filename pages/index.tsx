import React, { useState, useEffect } from 'react';
import {
    getCommentsByUrl,
    getCommentsByCircleId,
    getLatestPositivePublicComments,
    getLatestPositiveCircleComments,
    getAllCommentsCount,
    getAllCommentsCountByCircle,
    PAGE_SIZE,
    LATEST_COMMENTS_SIZE,
} from '../src/utils/apolloClient';
import { Comments } from '../src/components/Comments';
import Head from 'next/head';
import CommentsStore from '../src/stores/CommentsStore';
import { getCanonical } from '../src/utils/url';
import { Charts } from '../src/components/charts/Charts';
import UserStore from '../src/stores/UserStore';

function Index() {
    const [commentUrl, setCommentUrl] = useState('');
    const [canonical, setCanonical] = useState(null);
    const [latestComments, setLatestComments] = useState([]);
    const [circleId, setCircleId] = useState(null);
    const [circleName, setCircleName] = useState(null);
    const [latestCommentsOffset, setLatestCommentsOffset] = useState(0);
    const [allCommentsCount, setAllCommentsCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const subscriptionId = CommentsStore.subscribe(() => {
            setComments(CommentsStore.getComments());
        });
        const url = getCanonical();
        setCanonical(url);

        try {
            getCommentsByUrl(url, UserStore.getUuid()).then((comments) => {
                CommentsStore.setComments(comments);
            });
            getLatestPositivePublicComments(
                0,
                LATEST_COMMENTS_SIZE,
                UserStore.getUuid()
            ).then(setLatestComments);
        } catch (e) {
            console.error(e);
        } finally {
            setCommentUrl(url);
        }

        return () => {
            CommentsStore.unsubscribe(subscriptionId);
        };
    }, []);

    useEffect(() => {
        if (circleId) {
            getAllCommentsCountByCircle(UserStore.getUuid(), circleId).then(
                (count) => {
                    setHasNext(
                        latestCommentsOffset + LATEST_COMMENTS_SIZE < count
                    );
                    setAllCommentsCount(count);
                }
            );
        } else {
            getAllCommentsCount(UserStore.getUuid()).then((count) => {
                setHasNext(latestCommentsOffset + LATEST_COMMENTS_SIZE < count);
                setAllCommentsCount(count);
            });
        }
    }, [circleId, latestComments]);

    async function loadLatestComments(
        circleId?: string,
        offset = 0,
        limit = LATEST_COMMENTS_SIZE
    ) {
        try {
            if (circleId) {
                setLatestComments(
                    await getLatestPositiveCircleComments(
                        UserStore.getUuid(),
                        circleId,
                        offset,
                        limit
                    )
                );
            } else {
                setLatestComments(
                    await getLatestPositivePublicComments(
                        offset,
                        limit,
                        UserStore.getUuid()
                    )
                );
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function loadComments(
        circleId?: string,
        offset = 0,
        limit = PAGE_SIZE
    ) {
        if (circleId) {
            CommentsStore.setComments(
                await getCommentsByCircleId(
                    canonical,
                    UserStore.getUuid(),
                    circleId,
                    offset,
                    limit
                )
            );
        } else {
            CommentsStore.setComments(
                await getCommentsByUrl(
                    canonical,
                    UserStore.getUuid(),
                    offset,
                    limit
                )
            );
        }
    }

    async function handleCircleChange(circleId?: string, circleName?: string) {
        setCircleId(circleId ?? null);
        setCircleName(circleName ?? null);
        setLatestCommentsOffset(0);
        loadComments(circleId);
        loadLatestComments(circleId);
    }

    function handlePreviousLatestComments() {
        const tmp = Math.max(0, latestCommentsOffset - LATEST_COMMENTS_SIZE);
        setLatestCommentsOffset(tmp);
        loadLatestComments(circleId, tmp);
    }

    function handleNextLatestComments() {
        const tmp = Math.min(
            allCommentsCount,
            latestCommentsOffset + LATEST_COMMENTS_SIZE
        );
        setHasNext(tmp < allCommentsCount - 1);
        setLatestCommentsOffset(tmp);
        loadLatestComments(circleId, tmp);
    }

    async function handlePageChange(offset: number) {
        loadComments(circleId, offset);
    }

    return (
        <>
            <Head>
                <title>Universal Comments</title>
                {canonical ? <link rel="canonical" href={canonical} /> : null}
            </Head>

            <div className="comments-container">
                <Comments
                    canonical={canonical}
                    onAccess={console.log}
                    onCircleChange={handleCircleChange}
                    onLogin={loadLatestComments}
                    onPageChange={handlePageChange}
                />
                <Charts
                    hasPrevious={latestCommentsOffset > 0}
                    hasNext={hasNext}
                    onPreviousClick={handlePreviousLatestComments}
                    onNextClick={handleNextLatestComments}
                    title={
                        circleId
                            ? `Latest comments from ${circleName}`
                            : 'Latest comments'
                    }
                    showDisplayName={!!circleId}
                    latestComments={latestComments}
                />
            </div>

            <small>
                Universal comments
                <div>
                    Canonical:{' '}
                    <a
                        href={commentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {commentUrl}
                    </a>
                </div>
                <div>
                    <a
                        href="https://raw.githubusercontent.com/willemliu/universal-comments/master/20200118privacy.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy statement
                    </a>
                </div>
            </small>
        </>
    );
}

export default Index;
