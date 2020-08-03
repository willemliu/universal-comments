import { ReSubstitute } from '../utils/ReSubstitute';

class UserStore extends ReSubstitute {
    private id: string;
    private name: string;
    private email: string;
    private token: string;
    private uuid: string;
    private image = '//place-hold.it/50x50';
    private receiveMail = true;

    setId(id: string) {
        this.id = id;
        this.trigger();
    }

    setName(name: string) {
        this.name = name;
        this.trigger();
    }

    setEmail(email: string) {
        this.email = email;
        this.trigger();
    }

    setImage(image: string) {
        this.image = image;
        this.trigger();
    }

    setToken(token: string) {
        this.token = token;
        this.trigger();
    }

    setUuid(uuid: string) {
        this.uuid = uuid;
        this.trigger();
    }

    setReceiveMail(receiveMail: boolean) {
        this.receiveMail = receiveMail;
        this.trigger();
    }

    /**
     * Clear all user data. Typically used when logging out.
     */
    clear() {
        this.id = null;
        this.name = null;
        this.email = null;
        this.image = '//place-hold.it/50x50';
        this.uuid = null;
        this.trigger();
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getEmail() {
        return this.email;
    }

    getImage() {
        return this.image;
    }

    getToken() {
        return this.token;
    }

    getUuid() {
        return this.uuid;
    }

    getReceiveMail() {
        return this.receiveMail;
    }
}

export default new UserStore();
