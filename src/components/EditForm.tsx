import React, { useRef } from 'react';
import styles from './CommentForm.module.scss';
import { useState } from 'react';
import { PrimaryButton } from './buttons/buttons';
import { getCanonical } from '../utils/url';
import CommentsStore from '../stores/CommentsStore';
import { editComment } from '../utils/apolloClient';
import UserStore from '../stores/UserStore';

interface Props {
    id: string;
    commentText: string;
    onSubmit?: (e: React.FormEvent) => void;
}

function EditForm(props: Props) {
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
            CommentsStore.updateComment(
                await editComment(
                    props.id,
                    UserStore.getId(),
                    UserStore.getUuid(),
                    url,
                    comment
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
            <h2>Edit your comment</h2>
            <textarea
                ref={textareaRef}
                minLength={5}
                name="comment"
                placeholder={'Edit your comment here'}
                defaultValue={props.commentText}
                onChange={handleCommentChange}
            />
            <PrimaryButton title="Submit message">Submit</PrimaryButton>
        </form>
    );
}

export { EditForm };
