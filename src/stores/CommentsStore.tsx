import { StoreBase, AutoSubscribeStore, autoSubscribe } from 'resub';

export interface Comment {
    id: string;
    comment: string;
    url: string;
    parent_id: string;
    timestamp: string;
    updated: string;
    removed: boolean;
    user: {
        active: boolean;
        comments: Comment[];
        display_name: string;
        image: string;
        email: string;
        id: string;
        uuid: string;
        timestamp: string;
    };
    scores_aggregate: {
        aggregate: {
            sum: {
                score: number | null;
            };
        };
    };
    subComments?: Comment[];
}

@AutoSubscribeStore
class CommentsStore extends StoreBase {
    private comments: Comment[] = [];

    setComments(comments: Comment[]) {
        this.comments = [...comments];
        this.trigger();
    }

    addComment(comment: Comment) {
        this.comments = [...this.comments, comment];
        this.trigger();
    }

    updateComment(comment: Comment) {
        this.comments.forEach((oldComment) => {
            if (oldComment.id === comment.id) {
                oldComment.comment = comment.comment;
                oldComment.removed = comment.removed;
                oldComment.updated = comment.updated;
            }
        });
        this.trigger();
    }

    @autoSubscribe
    getComments() {
        return this.comments;
    }
}

export default new CommentsStore();
