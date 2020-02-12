import React, { useRef } from 'react';
import styles from './CommentForm.module.scss';
import { insertComment } from '../utils/apolloClient';
import { useState } from 'react';
import UserStore from '../stores/UserStore';
import CommentsStore from '../stores/CommentsStore';
import { getCanonical } from '../utils/url';
import { PrimaryButton } from './buttons/buttons';

interface Props {
    circleId?: number;
    parentId?: number;
    onSubmit?: (e: React.FormEvent) => void;
}

function CommentForm(props: Props) {
    const textareaRef = useRef(null);
    const [comment, setComment] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!comment || !comment.length) {
            return;
        }

        /**
         * Run event handler
         */
        if (props.onSubmit) {
            props.onSubmit(e);
        }

        const url = getCanonical();
        try {
            CommentsStore.addComment(
                await insertComment(
                    UserStore.getId(),
                    UserStore.getUuid(),
                    url,
                    comment,
                    props.parentId ?? null,
                    props.circleId ?? null
                )
            );
        } catch (e) {
            console.error(e);
        } finally {
            /**
             * Empty the comment field
             */
            if (textareaRef && textareaRef.current) {
                setComment('');
                textareaRef.current.value = '';
            }
        }
    }

    function handleCommentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setComment(e.currentTarget.value);
    }

    return (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
            <textarea
                ref={textareaRef}
                minLength={5}
                name="comment"
                placeholder={
                    props.parentId
                        ? 'Write your reply here'
                        : 'Write your comment here'
                }
                onChange={handleCommentChange}
            />
            <PrimaryButton title="Submit message">🖅</PrimaryButton>
        </form>
    );
}

export { CommentForm };
