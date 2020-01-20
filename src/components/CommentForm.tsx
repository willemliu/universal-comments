import React, { useRef } from 'react';
import styles from './CommentForm.module.css';
import { gql } from 'apollo-boost';
import { getApolloClient } from '../utils/apolloClient';
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

    function handleSubmit(e: React.FormEvent) {
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
        const client = getApolloClient();

        client
            .mutate({
                variables: {
                    comment: encodeURI(comment),
                    url,
                    userId: UserStore.getId(),
                    parentId: props.parentId ?? null,
                },
                mutation: gql`
                    mutation(
                        $comment: String!
                        $url: String!
                        $userId: String!
                        $parentId: bigint
                    ) {
                        insert_comments(
                            objects: {
                                comment: $comment
                                url: $url
                                user_id: $userId
                                parent_id: $parentId
                            }
                        ) {
                            returning {
                                id
                                url
                                comment
                                parent_id
                                removed
                                timestamp
                                updated
                                scores_aggregate {
                                    aggregate {
                                        sum {
                                            score
                                        }
                                    }
                                }
                                user {
                                    id
                                    display_name
                                    image
                                }
                            }
                        }
                    }
                `,
            })
            .then(({ data }: any) => {
                console.log(data?.insert_comments?.returning?.[0]);
                CommentsStore.addComment(data?.insert_comments?.returning?.[0]);
            })
            .catch(console.error)
            .finally(() => {
                /**
                 * Empty the comment field
                 */
                if (textareaRef && textareaRef.current) {
                    setComment('');
                    textareaRef.current.value = '';
                }
            });
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
