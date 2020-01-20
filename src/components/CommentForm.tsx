import React, { useRef, useEffect } from 'react';
import styles from './CommentForm.module.css';
import { insertComment, getCircles } from '../utils/apolloClient';
import { useState } from 'react';
import UserStore from '../stores/UserStore';
import CommentsStore from '../stores/CommentsStore';
import { getCanonical } from '../utils/url';
import { PrimaryButton } from './buttons/buttons';

interface Props {
    parentId?: number;
    onSubmit?: (e: React.FormEvent) => void;
}

function CommentForm(props: Props) {
    const textareaRef = useRef(null);
    const [comment, setComment] = useState('');
    const [circles, setCircles] = useState([]);
    const [circleId, setCircleId] = useState(null);

    useEffect(() => {
        getCircles(UserStore.getToken()).then((fetchedCircles) => {
            setCircles(fetchedCircles);
        });
    }, []);

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
                    url,
                    encodeURI(comment),
                    props.parentId ?? null,
                    circleId
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

    function handleCircleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setCircleId(e.currentTarget.value || null);
    }

    return (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
            {circles.length ? (
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
                                {circle.name}
                            </option>
                        ))}
                    </select>
                </section>
            ) : null}
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
