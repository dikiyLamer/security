import { UserRoleToBack } from "./userRoleToBack.interface"

export interface RuleForField{
    action: string
    fields: string
    microserviceStatic: string
    resourceNameStatic: string
    ruleDescription: string
    ruleName: string
    subjAttributeStatic: string
    subjOperatorStatic: string
    subjValueStatic: string
    user: UserRoleToBack[]
}