import { HttpService } from "@nestjs/axios";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MicroserviceUpdate } from "./DTO/microservice.update";
import { keycloak_role } from "./schemas/keycloak/keycloak_role.schema";
import { Microservice } from "./schemas/microservice.schema";
import { user_entity } from "./schemas/keycloak/user_entity.schema";
import { user_role_mapping } from "./schemas/keycloak/user_role_mapping.schema";
import { v4 } from "uuid"
import { Resource } from "./schemas/resource.schema";
import { Rule } from "./schemas/rule.schema";
import { RuleCreate } from "./DTO/rule.create";
import { DinamicUser } from "./interfaces/dinamicUser";
import { Permission } from "./interfaces/permission";
import { UserAttributes } from "./interfaces/userAttributes";
import axios from "axios";
import { TokenStore } from "src/helpers/token.store";
import { Message } from "src/helpers/message";
import { ResourceRule } from "./schemas/resource_rule.schema";
import { RuleUpdate } from "./DTO/rule.update";
import { RedisService } from "src/redis/redis.service";
import { ResourceAttribute } from "./schemas/resource-attribute.schema";
import { ResourceAttributeUpdate } from "./DTO/resource-attribute.update";
import { FieldRuleCreate } from "./DTO/field.rule.create";
import { RuleType } from "src/helpers/enums/rule-type.enum";
import { ResourceUpdate } from "./DTO/resource.update";

@Injectable()

export class AuthService {

    cache = {}
    lastRedisFilling: number = 0

    attributeName: string = ''
    constructor(@InjectRepository(user_entity) private usersRepository: Repository<user_entity>,
        @InjectRepository(keycloak_role) private rolesRepository: Repository<keycloak_role>,
        @InjectRepository(user_role_mapping) private rolesUsersRepository: Repository<user_role_mapping>,
        @InjectRepository(Microservice) private microservicesRepository: Repository<Microservice>,
        @InjectRepository(Resource) private resourcesRepository: Repository<Resource>,
        @InjectRepository(Rule) private rulesRepository: Repository<Rule>,
        @InjectRepository(ResourceRule) private resRuleRepository: Repository<ResourceRule>,
        @InjectRepository(ResourceAttribute) private resourceAttributeRepository: Repository<ResourceAttribute>,
        private redisService: RedisService,
        private readonly httpService: HttpService) {

    }

    async getResourcesForAuth(rule: { name: any, attribute: any, value: any }[]) {
        let query = `select * from microservice where uid=(select microservice_id from resource where name = '${rule[0].name}')`
        let microservice = await this.rulesRepository.query(query)
        let tokenStore = new TokenStore()
        let res: any;
        await axios.post(microservice[0].route, rule, { headers: { Authorization: `Bearer ${tokenStore.getToken()}` } }).then(data => res = data)
        return res.data

        // await axios.post(microservice[0].route, )
    }

    async getUsers() {
        return await this.usersRepository.find()
    }

    async getResourceByMicroserviceId(uid: string) {

        return await this.resourcesRepository.query(`SELECT * from resource WHERE microservice_id = '${uid}'`)
    }

    async getRuleByMicroserviceId(uid: string) {
        return await this.microservicesRepository.query(`
        select distinct rule.uid as uid, rule.name as name, rule.description as description, rule.action as action from rule
        join resource_rule on resource_rule.rule_id = rule.uid
        join resource on resource.uid = resource_rule.resource_id
        join microservice on microservice.uid = resource.microservice_id
        where microservice_id = '${uid}'`)
    }

    async getInfo(uid: string, type: string) {
        let users = await this.usersRepository.query(`SELECT * from user_rule WHERE rule_id = '${uid}'`)
        let resources: any;
        if (type === RuleType.row) {
            resources = await this.usersRepository.query(`
            select resource.name as name, microservice.name as microservice, resource_rule.attribute as attribute,
                resource_rule.operator as operator, resource_rule.value as value
                from rule
                join resource_rule on resource_rule.rule_id = rule.uid 
                join resource on resource_rule.resource_id = resource.uid
                join microservice on resource.microservice_id = microservice.uid
                where rule.uid = '${uid}'`)
            
        }
        else{
            resources = await this.usersRepository.query(`select resource.name as name, microservice.name as microservice, field.columns as columns from rule
            join field on rule.uid = field.rule_id
            join resource on field.resource_id = resource.uid
            join microservice on resource.microservice_id = microservice.uid
            where rule.uid = '${uid}'`)
        }

        return { users, resources }
    }

    async getUserById(userID: string): Promise<UserAttributes[]> {

        return await this.usersRepository.query(`select group_attribute.group_id, username, group_attribute.name, group_attribute.value from user_group_membership
        join user_entity on user_entity.id = user_group_membership.user_id
        join group_attribute on group_attribute.group_id = user_group_membership.group_id
        where user_entity.id = '${userID}'`)
    }

    async getAttributesNamesByPattern(pattern: string) {
        this.attributeName = pattern
        return this.resourcesRepository.query(`SELECT DISTINCT name FROM group_attribute WHERE name LIKE '%${pattern}%'`)
    }

    async getSubjAttrValuesVyPattern(pattern: DinamicUser) {
        return this.resourcesRepository.query(`SELECT DISTINCT value FROM group_attribute WHERE name LIKE '${pattern.subjAttribute}%'`)
    }

    async getMicroservices(): Promise<Microservice[]> {

        return await this.microservicesRepository.find()

    }

    async createMicroservice(microservice: Microservice) {
        this.lowercase(microservice)
        return await this.microservicesRepository.save(microservice)
            .then((data) => new Message(200, data))
            .catch((error) => new Message(500, error))
    }

    async deleteMicroservice(id: string) {

        return await this.microservicesRepository.query(`DELETE FROM microservice WHERE uid = '${id}'`)
            .then(() => this.microservicesRepository.query(`DELETE FROM resource WHERE microservice_id = '${id}' RETURNING uid`))
            .then((data) => {
                let query: string = ''
                data[0].forEach(element => query += `DELETE FROM rule WHERE uid IN (SELECT rule_id FROM resource_rule WHERE resource_id = '${element.uid}');
                                                DELETE FROM resource_rule WHERE resource_id = '${element.uid}';`)

                this.microservicesRepository.query(query)
            })
            .then(() => new Message(200, id))
            .catch((error) => new Message(500, error))
    }

    async getUsersByGroups(groups: { name: string, value: string }[]) {
        let query = 'select * from user_entity where id in '

        for (let group = 0; group < groups.length; group++) {
            query += `
                (select user_entity.id from (SELECT * FROM public.group_attribute where name ILIKE '${groups[group].name}' and value ILIKE '${groups[group].value}')as t1
                join user_group_membership on user_group_membership.group_id = t1.group_id
                join user_entity on user_group_membership.user_id = user_entity.id )
                `
            if (group < groups.length - 1) {
                query += 'and id in '
            }
        }

        return await this.usersRepository.query(query)
    }

    async processingIncomingResourcesAndAttributes(data: { tableName: string, properties: string[] }[], microservice: MicroserviceUpdate) {
        let incomingResources = data.map(async element => {
            //Проверяем существует ли ресурс
            let checkResource = await this.resourcesRepository.findOneBy({ name: element.tableName, microservice_id: microservice.uid })
            //Если сущетсвует, то проверяем уже записанные атрибуты с пришедшими, синхронизируем
            //Если нет, то создаем новый ресурс и атрибуты
            if (checkResource) {
                let attributes = await this.getAttributesByResourceUid(checkResource.uid)
                //Прохожусь по имеющимся атрибутам и сверяюсь с теми, что пришли. Если в пришедших не найден - удаляем
                attributes.forEach(async attribute => {
                    const checkAttribute = element.properties.includes(attribute.name)
                    if (!checkAttribute) {
                        await this.resourceAttributeRepository.delete(attribute)
                    }
                })
                //Прохожусь по пришедшим, ищу запись в бд, если нет - создаю новый атрибут
                element.properties.forEach(async property => {
                    const checkProperty = await this.resourceAttributeRepository.findOneBy({ name: property, resourceUid: checkResource.uid })
                    if (!checkProperty) {
                        await this.resourceAttributeRepository.save({ uid: v4(), name: property, resourceUid: checkResource.uid })
                    }
                })
            } else {
                let newResource = await this.resourcesRepository.save({ uid: v4(), name: element.tableName, microservice_id: microservice.uid })
                element.properties.forEach(async property => {
                    await this.resourceAttributeRepository.save({ uid: v4(), name: property, resourceUid: newResource.uid })
                })
            }
        })
        return new Message(200, '')
    }

    // async upsertResources(resources: ResourceUpdate[]) {



    //     let resource: any;
    //     let message: Message = new Message(200, '')
    //     for (let resInd = 0; resInd < resources.length; resInd++) {

    //         resource = this.lowercase(resources[resInd])
    //         console.log(resource);

    //         await this.resourcesRepository.query(`INSERT INTO resource ("uid","name","alias","attributes","created_at","microservice_id", "description") 
    //         VALUES ('${resource.uid}','${resource.name}','${resource.alias}','${JSON.stringify(resource.attributes)}',
    //         '${Date.now()}','${resource.microservice_id}', '${resource.description}') ON CONFLICT ("uid") DO UPDATE 
    //         SET name='${resource.name}',alias='${resource.alias}',attributes='${JSON.stringify(resource.attributes)}'
    //         ,microservice_id='${resource.microservice_id}', description='${resource.description}'`)
    //             .catch((error => {
    //                 console.log(error);

    //                 message.code = 500; message.status = error
    //             }))

    //     }
    //     console.log(message);
    //     return message
    // }

    async deleteResource(uid: string) {
        return await this.resourcesRepository.query(`DELETE FROM resource WHERE uid='${uid}'`)
            .then((data) => new Message(200, uid))
            .catch((error) => new Message(500, error))
    }

    async getResources() {
        return await this.resourcesRepository.query(`select resource.uid, resource.name, resource.alias, resource.attributes, resource.created_at, 
            resource.microservice_id, resource.description, microservice.name as microservice_name from resource
            join microservice  on microservice.uid = resource.microservice_id`)
    }

    async getResourcesByPattern(pattern: string) {

        let pattern1 = pattern.toString().toLowerCase()

        let result = await this.resourcesRepository.query(`SELECT * FROM resource WHERE name LIKE '%${pattern1}%' LIMIT 4`)
        return result[0]
    }

    async updateResourceByUid(resourceUid: string, resourceUpdate: ResourceUpdate): Promise<Resource> {
        let resource = await this.resourcesRepository.findOneBy({ uid: resourceUid })
        if (!resource) {
            throw new NotFoundException('Ресурс с таким UID не найден')
        }
        return await this.resourcesRepository.save({
            ...resource, ...{
                alias: resourceUpdate.alias,
                description: resourceUpdate.description
            }
        })
    }

    //Получаем атрибуты ресурса по UID ресурса
    async getAttributesByResourceUid(resourceUid: string): Promise<ResourceAttribute[]> {
        return await this.resourceAttributeRepository.findBy({ resourceUid: resourceUid })
    }

    //Обновляем атрибут ресурса
    async updateResourceAttribute(resourceAttributeUpdate: ResourceAttributeUpdate): Promise<ResourceAttribute> {
        let resourceAttribute = await this.resourceAttributeRepository.findOneBy({ uid: resourceAttributeUpdate.uid })
        return await this.resourceAttributeRepository.save({
            ...resourceAttribute, ...{
                alias: resourceAttributeUpdate.alias,
                description: resourceAttributeUpdate.description
            }
        })
    }

    //Обновляем атрибуты ресурса
    async updateResourceAttributes(resourceAttributesUpdate: ResourceAttributeUpdate[]): Promise<ResourceAttribute[]> {
        let resourceAttributes: ResourceAttribute[] = []
        for (let i = 0; i < resourceAttributesUpdate.length; i++) {
            resourceAttributes.push(await this.updateResourceAttribute(resourceAttributesUpdate[i]))
        }
        return resourceAttributes
    }

    async getRules() {
        return await this.rulesRepository.find()
        // return await this.rulesRepository.query(`select rule.uid as uid, microservice.name as microservice, resource.name as resource_name, rule.name, rule.description from rule
        // join resource_rule on resource_rule.rule_id = rule.uid 
        // join resource on resource_rule.resource_id = resource.uid
        // join microservice on resource.microservice_id = microservice.uid`)
    }

    async getRulesByResource(resId: number): Promise<any> {
        return await this.rulesRepository.query(`
        SELECT rule.uid, rule.name, rule.description, rule.created_at, rule.action
        FROM rule
        JOIN resource_rule ON resource_rule.rule_id = rule.uid
        WHERE resource_rule.resource_id = '${resId}'`)
    }

    async deleteRule(uid: string) {
        return await this.rulesRepository.query(`delete from rule where uid = '${uid}';
        delete from resource_rule where rule_id = '${uid}';
        delete from user_rule where rule_id = '${uid}';
        delete from field where rule_id = '${uid}';
        `)
            .then(() => new Message(200, uid))
            .catch((error) => new Message(500, error.message))
    }

    async updateRule(rule: RuleUpdate) {
        let findRule = await this.rulesRepository.findOneBy({ uid: rule.uid })
        findRule.name = rule.name
        findRule.description = rule.description
        return await this.rulesRepository.save(findRule)
    }

    async getResourceIdByName(name: string, microservice: string) {
        return await this.resourcesRepository.query(`SELECT uid FROM resource WHERE name = '${name}' AND microservice_id='${microservice}' `)
    }


    async getResourceById(uid: string) {
        return await this.resourcesRepository.query(`SELECT * FROM resource WHERE uid = '${uid}' `)
    }

    async createRule(rule: RuleCreate) {

        let rule_uid = v4()
        let resource_id = await this.getResourceIdByName(rule.resourceNameStatic, rule.microserviceStatic)
        let message: Message = new Message(200, { ...rule, uid: rule_uid })

        await this.rulesRepository.query(`INSERT INTO rule (uid, name, description, created_at, action, type) VALUES 
                                        ('${rule_uid}', '${rule.ruleName}','${rule.ruleDescription}',${Date.now()}, '${rule.action}', 'row')`)
            .then(() => this.resourcesRepository.query(`INSERT INTO resource_rule (uid, resource_id, rule_id, attribute, operator, value) VALUES
                                  ('${v4()}', '${resource_id[0].uid}', '${rule_uid}', '${rule.attributeStatic}',
                                  '${rule.operatorStatic}','${rule.resourceValueStatic}')`))
            .then(() => this.rulesRepository.query(`INSERT INTO user_rule (uid, rule_id, attribute, operator, value) VALUES ('${v4()}','${rule_uid}', '${rule.subjAttributeStatic}',
                                  '${rule.subjOperatorStatic}','${rule.subjValueStatic}')`))
            .catch((error) => { message.code = 500, message.status = `Insert to Rule table: ${error.message}` })


        if (rule.resource.length > 0) {
            for (let i = 0; i < rule.resource.length; i++) {
                await this.resourcesRepository.query(`INSERT INTO resource_rule (uid, resource_id, rule_id, attribute, operator, value) VALUES
                ('${v4()}', '${(await this.getResourceIdByName(rule.resource[i].resourceName, rule.resource[i].microservice))[0].uid}', '${rule_uid}', '${rule.resource[i].resourceAttribute}',
                '${rule.resource[i].resourceOperator}','${rule.resource[i].resourceValue}')`)
                    .catch((error) => { message.code = 500, message.status = `Insert to resource_rule table: ${error.message}` })
            }
        }

        if (rule.user.length > 0) {
            for (let i = 0; i < rule.user.length; i++) {
                await this.rulesRepository.query(`INSERT INTO user_rule (uid, rule_id, attribute, operator, value) VALUES ('${v4()}','${rule_uid}', '${rule.user[i].subjAttribute}',
                '${rule.user[i].subjOperator}', '${rule.user[i].subjValue}')`)
                    .catch((error) => { message.code = 500, message.status = `Insert to user_rule table: ${error.message}` })
            }

        }

        //удаляем из кэша ключи, содержащие измененный ресурс
        for (let [key, value] of Object.entries(this.cache)) {
            if (key.indexOf(resource_id[0].uid) != -1) {
                delete this.cache[key]
            }
        }

        return message
    }


    async createRuleForField(rule: FieldRuleCreate) {
        let rule_uid = v4()
        let resource_id = await this.getResourceIdByName(rule.resourceNameStatic, rule.microserviceStatic)
        let message: Message = new Message(200, { ...rule, uid: rule_uid })

        await this.rulesRepository.query(`INSERT INTO rule (uid, name, description, created_at, action,type) VALUES 
                                        ('${rule_uid}', '${rule.ruleName}','${rule.ruleDescription}',${Date.now()}, '${rule.action}', 'field')`)
            .then(() => this.resourcesRepository.query(`INSERT INTO Field (uid, columns, rule_id, resource_id) VALUES
                                  ('${v4()}', '${rule.fields}', '${rule_uid}', '${resource_id[0].uid}')`))
            .then(() => this.rulesRepository.query(`INSERT INTO user_rule (uid, rule_id, attribute, operator, value) VALUES ('${v4()}','${rule_uid}', '${rule.subjAttributeStatic}',
                                  '${rule.subjOperatorStatic}','${rule.subjValueStatic}')`))
            .catch((error) => { message.code = 500, message.status = `Insert to Rule table: ${error.message}` })

        if (rule.user.length > 0) {
            for (let i = 0; i < rule.user.length; i++) {
                await this.rulesRepository.query(`INSERT INTO user_rule (uid, rule_id, attribute, operator, value) VALUES ('${v4()}','${rule_uid}', '${rule.user[i].subjAttribute}',
                '${rule.user[i].subjOperator}', '${rule.user[i].subjValue}')`)
                    .catch((error) => { message.code = 500, message.status = `Insert to user_rule table: ${error.message}` })
            }

        }

        // //удаляем из кэша ключи, содержащие измененный ресурс
        // for (let [key, value] of Object.entries(this.cache)) {
        //     if (key.indexOf(resource_id[0].uid) != -1) {
        //         delete this.cache[key]
        //     }
        // }

        return message
    }

    async getPermissions(data: string): Promise<Permission[]> {
        let permArray = data.split(',')

        return await this.rulesRepository.query(`SELECT rule.uid, rule.name, rule.description, rule.action,rule.type,
        user_rule.attribute userattribute, user_rule.operator useroperator, user_rule.value uservalue, resource_rule.resource_id,
		resource_rule.attribute resourceattribute, resource_rule.operator resourceoperator, resource_rule.value resourcevalue FROM rule
        JOIN user_rule ON rule.uid = user_rule.rule_id
        JOIN resource_rule ON rule.uid = resource_rule.rule_id 
        WHERE resource_id = '${permArray[0]}' and type = 'row'`)

    }

    async getPermissionsForFields(data: string): Promise<Permission[]> {
        let permArray = data.split(',')

        return await this.rulesRepository.query(`SELECT rule.uid, rule.name, rule.description, rule.action,
        user_rule.attribute userattribute, user_rule.operator useroperator, user_rule.value uservalue, field.columns columns FROM rule
        JOIN user_rule ON rule.uid = user_rule.rule_id
        JOIN field ON rule.uid = field.rule_id 
        WHERE resource_id = '${permArray[0]}' and type = 'field'`)

    }

    async synchronize(microservice: MicroserviceUpdate): Promise<Message> {
        let tokenStore = new TokenStore

        return await axios.get(microservice.route, { headers: { Authorization: `Bearer ${tokenStore.getToken()}` } }).then(async data => {

            if (data.data.length != 0) {
                await this.processingIncomingResourcesAndAttributes(data.data, microservice)

                return new Message(200, 'Синхронизация прошла успешно')
            }
            else if (data.data.length == 0) {
                // await this.upsertResources(data.data)
                return new Message(200, 'Синхронизация прошла успешно, ресурсов не обнаружено')
            }


        })
            .catch((error) => {
                console.log(error);

                return new Message(404, error)
            })
    }

    filterPermissions(perms: Permission[]) {
        let rulesArray = []
        let rule = []
        let unchanged = 0
        let old = ''
        
        perms.sort(this.compare)

        for (let index = 0; index < perms.length; index++) {
            if (perms[index].uid === old /*|| unchanged === 0*/) {

                rule.push(perms[index])
                unchanged++
            }
            else {
                rulesArray.push(rule)
                rule = []

                rule.push(perms[index])

                // unchanged = 0
            }

            old = perms[index].uid
        }

        rulesArray.push(rule)

        return rulesArray
    }

    async getGroups(user_id: string) {
        return await this.rulesRepository.query(`select * from user_group_membership 
        join group_attribute on group_attribute.group_id = user_group_membership.group_id
        where user_id='${user_id}'`)
    }

    handleUserPermissions(sortedRules: [Permission[]], userAttributes: UserAttributes[]) {

        let userAttributeEnterCount = 0
        let ruleEnterCount = 0
        let finalArray = []

        if (userAttributes.find(element => element.name === 'admin' && element.value === 'admin')) {

            return [[{
                uid: '0195203f-c471-4670-928b-e2881056545brobster',
                name: '*',
                resource_id: '*',
                description: '*',
                action: 'Запись',
                resourceattribute: '*',
                resourceoperator: '*',
                resourcevalue: '*',
                userattribute: 'admin',
                useroperator: '*',
                uservalue: 'admin',
            }]]

        }

        for (let ruleArrayIndex = 0; ruleArrayIndex < sortedRules.length; ruleArrayIndex++) { // Массив правил (по ИЛИ)

            for (let ruleIndex = 0; ruleIndex < sortedRules[ruleArrayIndex].length; ruleIndex++) { // Одно правило (по И)

                for (let userAttributeIndex = 0; userAttributeIndex < userAttributes.length; userAttributeIndex++) { //смотрит соответствие атрибутов пользователя

                    if (sortedRules[ruleArrayIndex][ruleIndex].useroperator === 'Равно') {
                        // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                        //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value)

                        if (sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name &&
                            sortedRules[ruleArrayIndex][ruleIndex].uservalue === userAttributes[userAttributeIndex].value) {
                            // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                            //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value, ' userAttributeEnterCount: ', userAttributeEnterCount + 1,
                            //     ' sortedRules[ruleArrayIndex].length: ',sortedRules[ruleArrayIndex].length)
                            userAttributeEnterCount++

                        }

                    }
                    else if (sortedRules[ruleArrayIndex][ruleIndex].useroperator === 'Не равно') {

                        if (sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name &&
                            sortedRules[ruleArrayIndex][ruleIndex].uservalue != userAttributes[userAttributeIndex].value) {
                            // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                            //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value)
                            userAttributeEnterCount++

                        }
                    }
                    else if (sortedRules[ruleArrayIndex][ruleIndex].useroperator === 'Содержит') {

                        if (sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name &&
                            userAttributes[userAttributeIndex].value.indexOf(sortedRules[ruleArrayIndex][ruleIndex].uservalue) != -1) {
                            // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                            //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value)
                            userAttributeEnterCount++

                        }
                    }
                    else if (sortedRules[ruleArrayIndex][ruleIndex].useroperator === 'Не содержит') {

                        if (sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name &&
                            userAttributes[userAttributeIndex].value.indexOf(sortedRules[ruleArrayIndex][ruleIndex].uservalue) === -1) {
                            // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                            //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value)
                            userAttributeEnterCount++

                        }
                    }
                    else if (sortedRules[ruleArrayIndex][ruleIndex].useroperator === 'Начинается с') {

                        if (sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name &&
                            userAttributes[userAttributeIndex].value.startsWith(sortedRules[ruleArrayIndex][ruleIndex].uservalue)) {
                            // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                            //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value)
                            userAttributeEnterCount++

                        }
                    }
                    else if (sortedRules[ruleArrayIndex][ruleIndex].useroperator === 'Не начинается с') {

                        if (sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name &&
                            !userAttributes[userAttributeIndex].value.startsWith(sortedRules[ruleArrayIndex][ruleIndex].uservalue)) {
                            // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                            //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value)
                            userAttributeEnterCount++

                        }
                    }
                    else if (sortedRules[ruleArrayIndex][ruleIndex].useroperator === 'Заканчивается на') {

                        // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute,  ' ravno ', userAttributes[userAttributeIndex].name, ': ', sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name );
                        // console.log(sortedRules[ruleArrayIndex][ruleIndex].uservalue , ' ravno ' , userAttributes[userAttributeIndex].value , ': ' , sortedRules[ruleArrayIndex][ruleIndex].uservalue.endsWith(userAttributes[userAttributeIndex].value));

                        if (sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name &&
                            userAttributes[userAttributeIndex].value.endsWith(sortedRules[ruleArrayIndex][ruleIndex].uservalue)) {
                            // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                            //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value)
                            userAttributeEnterCount++

                        }
                    }
                    else if (sortedRules[ruleArrayIndex][ruleIndex].useroperator === 'Не заканчивается на') {

                        if (sortedRules[ruleArrayIndex][ruleIndex].userattribute === userAttributes[userAttributeIndex].name &&
                            !userAttributes[userAttributeIndex].value.endsWith(sortedRules[ruleArrayIndex][ruleIndex].uservalue)) {
                            // console.log(sortedRules[ruleArrayIndex][ruleIndex].userattribute, sortedRules[ruleArrayIndex][ruleIndex].uservalue,
                            //     userAttributes[userAttributeIndex].name, userAttributes[userAttributeIndex].value)
                            userAttributeEnterCount++

                        }
                    }


                }

                if (userAttributeEnterCount >= sortedRules[ruleArrayIndex].length) {


                    finalArray.push(sortedRules[ruleArrayIndex])
                    ruleEnterCount++

                }

            }

            ruleEnterCount = 0
            userAttributeEnterCount = 0
        }

        return finalArray

    }

    lowercase(obj): typeof obj {
        let obj_clone = Object.assign(obj)

        for (let key of Object.keys(obj_clone)) {
            if (typeof obj_clone[key] === 'string') obj_clone[key] = obj_clone[key].toString().toLowerCase()
        }

        return obj_clone
    }

    compare(a, b) {
        if (a.uid > b.uid) return 1; // если первое значение больше второго
        if (a.uid == b.uid) return 0; // если равны
        if (a.uid < b.uid) return -1; // если первое значение меньше второго
    }


    setUsersToRedis(interval: number) {

        let timestamp: number = Date.now()

        if (timestamp >= (this.lastRedisFilling + interval * 60 * 60 * 1000)) {
            this.getUsers().then(async data => {
                await this.redisService.insert('users', JSON.stringify(data))

            })

            this.lastRedisFilling = timestamp
        }


    }
}
