import { StoreBase, AutoSubscribeStore, autoSubscribe } from 'resub';

@AutoSubscribeStore
class UserStore extends StoreBase {
    private id: string;
    private name: string;
    private email: string;
    private token: string;
    private uuid: string;
    private image = '//place-hold.it/50x50';

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

    /**
     * Clear all user data. Typically used when logging out.
     */
    clear() {
        this.id = null;
        this.name = null;
        this.email = null;
        this.image = '//place-hold.it/50x50';
        this.trigger();
    }

    @autoSubscribe
    getId() {
        return this.id;
    }

    @autoSubscribe
    getName() {
        return this.name;
    }

    @autoSubscribe
    getEmail() {
        return this.email;
    }

    @autoSubscribe
    getImage() {
        return this.image;
    }

    @autoSubscribe
    getToken() {
        return this.token;
    }

    @autoSubscribe
    getUuid() {
        return this.uuid;
    }
}

export default new UserStore();
