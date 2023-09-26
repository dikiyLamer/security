import { DinamicResource } from "../interfaces/dinamicResource"
import { DinamicUser } from "../interfaces/dinamicUser"

export class RuleCreate{

ruleName: string
ruleDescription: string
action: string
effect: string
microserviceStatic: string
resourceNameStatic: string
attributeStatic: string
operatorStatic: string
resourceValueStatic: string
resource: DinamicResource[]
subjScopeStatic: string
subjAttributeStatic: string
subjOperatorStatic: string
subjValueStatic: string
user: DinamicUser[]

}