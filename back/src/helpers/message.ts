export class Message{
    code: number
    status: string | typeof Object

    constructor(code, status){
        this.code = code
        this.status = status
    }
}