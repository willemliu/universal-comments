import React, { useRef } from 'react';
import styles from './CommentForm.module.scss';
import { insertComment } from '../utils/apolloClient';
import { useState } from 'react';
import UserStore from '../stores/UserStore';
import CommentsStore, { Comment } from '../stores/CommentsStore';
import { getCanonical } from '../utils/url';
import { PrimaryButton } from './buttons/buttons';

declare let window: any;

interface Props {
    circleId?: string;
    parentId?: string;
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
            const insertedComment: Comment = await insertComment(
                UserStore.getId(),
                UserStore.getUuid(),
                url,
                comment,
                props.parentId ?? null,
                props.circleId ?? null
            );
            CommentsStore.addComment(insertedComment);

            if (props.circleId) {
                fetch(
                    `//${
                        window.location.host
                    }/api/mailCircle?uuid=${UserStore.getUuid()}&commentUuid=${
                        insertedComment.id
                    }&url=${url}&circleId=${props.circleId}`
                )
                    .then(console.log)
                    .catch(console.error);
            } else {
                fetch(
                    `//${
                        window.location.host
                    }/api/mail?uuid=${UserStore.getUuid()}&commentUuid=${
                        insertedComment.id
                    }&url=${url}`
                )
                    .then(console.log)
                    .catch(console.error);
            }
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
            {props.parentId && <h2>Reply</h2>}
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
            <PrimaryButton title="Submit message">Submit</PrimaryButton>
        </form>
    );
}

export { CommentForm };
