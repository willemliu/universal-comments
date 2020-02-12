import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import CommentsStore from '../src/stores/CommentsStore';
import { getAllUserComments } from '../src/utils/apolloClient';
import { AdminComments } from '../src/components/AdminComments';

const pageSize = 10;

export default function admin() {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalCommentCount, setTotalCommentCount] = useState(0);
    const [currentOffset, setCurrentOffset] = useState(0);

    async function loadComments(uuid: string, offset = 0, limit = pageSize) {
        setLoading(true);
        try {
            const comments = await getAllUserComments(uuid, offset, limit);
            CommentsStore.setComments(comments.comments);
            setTotalCommentCount(comments.comments_aggregate.aggregate.count);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function onAccess(accessToken: string, uuid: string) {
        setUserId(uuid);
        await loadComments(uuid);
    }

    async function onPrevPage() {
        setCurrentOffset(Math.max(currentOffset - pageSize, 0));
    }

    async function onNextPage() {
        setCurrentOffset(
            Math.min(currentOffset + pageSize, totalCommentCount - 1)
        );
    }

    useEffect(() => {
        if (userId) {
            loadComments(userId, currentOffset);
        }
    }, [currentOffset, userId]);

    function onLogout() {
        CommentsStore.setComments([]);
    }

    return (
        <>
            <Head>
                <title>Admin - Universal Comments</title>
            </Head>
            {loading ? <div className="blink">Loading...</div> : null}
            <AdminComments
                onAccess={onAccess}
                onLogout={onLogout}
                onPrevPage={onPrevPage}
                onNextPage={onNextPage}
            />
            <small>Universal comments admin</small>
        </>
    );
}
