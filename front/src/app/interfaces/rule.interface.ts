export interface Rule{
    uid?: string,
    name: string,
    microservice: string,
    resource_name: string,
    description: string,
    created_at?: bigint,
    action?: string
}