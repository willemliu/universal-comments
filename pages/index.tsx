import React, { useState, useEffect } from 'react';
import {
    getCommentsByUrl,
    getCommentsByCircleId,
    getLatestPositivePublicComments,
    getLatestPositiveCircleComments,
    getAllCommentsCount,
} from '../src/utils/apolloClient';
import { Comments } from '../src/components/Comments';
import Head from 'next/head';
import CommentsStore from '../src/stores/CommentsStore';
import { getCanonical } from '../src/utils/url';
import { Charts } from '../src/components/charts/Charts';

function Index() {
    const [loading, setLoading] = useState(true);
    const [commentUrl, setCommentUrl] = useState('');
    const [canonical, setCanonical] = useState(null);
    const [latestComments, setLatestComments] = useState([]);
    const [circleId, setCircleId] = useState(null);
    const [circleName, setCircleName] = useState(null);
    const [offset, setOffset] = useState(0);
    const [allCommentsCount, setAllCommentsCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);

    useEffect(() => {
        const url = getCanonical();
        setCanonical(url);

        try {
            getCommentsByUrl(url).then((comments) => {
                CommentsStore.setComments(comments);
            });
            getLatestPositivePublicComments().then(setLatestComments);
            getAllCommentsCount().then((count) => {
                setHasNext(offset < count - 1);
                setAllCommentsCount(count);
            });
        } catch (e) {
            console.error(e);
        } finally {
            setCommentUrl(url);
            setLoading(false);
        }
    }, []);

    async function loadComments(circleId?: string, offset = 0, limit = 10) {
        const url = getCanonical();
        setCanonical(url);
        try {
            if (circleId) {
                CommentsStore.setComments(
                    await getCommentsByCircleId(url, circleId)
                );
                setLatestComments(
                    await getLatestPositiveCircleComments(
                        circleId,
                        offset,
                        limit
                    )
                );
            } else {
                CommentsStore.setComments(await getCommentsByUrl(url));
                setLatestComments(
                    await getLatestPositivePublicComments(offset, limit)
                );
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCommentUrl(url);
            setLoading(false);
        }
    }

    function handleCircleChange(circleId?: string, circleName?: string) {
        setCircleId(circleId ?? null);
        setCircleName(circleName ?? null);
        loadComments(circleId);
    }

    function handlePreviousLatestComments() {
        const tmp = Math.max(0, offset - 10);
        setOffset(tmp);
        loadComments(circleId, tmp);
    }

    function handleNextLatestComments() {
        const tmp = Math.min(allCommentsCount - 1, offset + 10);
        setHasNext(tmp < allCommentsCount - 1);
        setOffset(tmp);
        loadComments(circleId, tmp);
    }

    return (
        <>
            <Head>
                <title>Universal Comments {circleId}</title>
                {canonical ? <link rel="canonical" href={canonical} /> : null}
            </Head>

            {loading ? (
                <div className="blink">Loading...</div>
            ) : (
                <div className="comments-container">
                    <Comments
                        canonical={canonical}
                        onAccess={console.log}
                        onCircleChange={handleCircleChange}
                    />
                    <Charts
                        hasPrevious={offset > 0}
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
            )}

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
