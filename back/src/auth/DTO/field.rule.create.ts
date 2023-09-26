import { DinamicUser } from "../interfaces/dinamicUser"

export class FieldRuleCreate {
    action: string
    fields: string
    microserviceStatic: string
    resourceNameStatic: string
    ruleDescription: string
    ruleName: string
    subjAttributeStatic: string
    subjOperatorStatic: string
    subjValueStatic: string
    user: DinamicUser[]
}


