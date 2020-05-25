import React, { useRef, useEffect } from 'react';
import styles from './CommentForm.module.scss';
import { insertComment, UpdateReceiveMail } from '../utils/apolloClient';
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
    const [receiveMail, setReceiveMail] = useState(UserStore.getReceiveMail());

    useEffect(() => {
        const subscriptionId = UserStore.subscribe(() => {
            setReceiveMail(UserStore.getReceiveMail());
        });
        return () => {
            UserStore.unsubscribe(subscriptionId);
        };
    }, [UserStore.getReceiveMail()]);

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
                fetch(`//${window.location.host}/api/mailCircle`, {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url,
                        uuid: UserStore.getUuid(),
                        commentUuid: insertedComment.id,
                        circleId: props.circleId,
                    }),
                })
                    .then(console.log)
                    .catch(console.error);
            } else {
                fetch(`//${window.location.host}/api/mail`, {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url,
                        uuid: UserStore.getUuid(),
                        commentUuid: insertedComment.id,
                    }),
                })
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

    function handleReceiveMailChange(e: React.ChangeEvent<HTMLInputElement>) {
        UserStore.setReceiveMail(e.currentTarget.checked);
        UpdateReceiveMail(UserStore.getUuid(), e.currentTarget.checked);
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

            <label className={styles.notificationEmails}>
                <input
                    type="checkbox"
                    value="1"
                    name="receive_mail"
                    onChange={handleReceiveMailChange}
                    checked={receiveMail}
                />{' '}
                Receive e-mail notifications{' '}
                <a
                    href="https://github.com/willemliu/universal-comments-plugin#receive-e-mail-notifications"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ❔
                </a>
            </label>
        </form>
    );
}

export { CommentForm };
