export class TokenStore{
    
    private static instance: any = null
    private token: string = ''
    constructor() {
        
        if (!TokenStore.instance){
            TokenStore.instance = this
        }
        else{
            return TokenStore.instance
        }
        
    }

    getToken(){
        return this.token
    }

    setToken(token: string){
        this.token = token
    }
}