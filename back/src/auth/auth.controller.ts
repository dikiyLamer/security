import { Body, Controller, Delete, Get, Inject, Param, Put, Post, UseGuards, UseInterceptors, Req, Query } from '@nestjs/common';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { WSGateway } from 'src/webSocket/webSocketGateway.service';
import { AuthService } from './auth.service';
import { MicroserviceUpdate } from './DTO/microservice.update';
import { ResourceUpdate } from './DTO/resource.update';
import { UserUpdate } from './DTO/user.update';
import { DinamicUser } from './interfaces/dinamicUser';
import { Permission } from './interfaces/permission';
import { UserAttributes } from './interfaces/userAttributes';
import { AuthenticatedUser, AuthGuard } from 'nest-keycloak-connect';
import { TokenInterceptor } from 'src/interceptors/token.interceptor';
import { RuleUpdate } from './DTO/rule.update';
import { Request } from 'express';
import { ResourceAttributeUpdate } from './DTO/resource-attribute.update';
import { FieldRuleCreate } from './DTO/field.rule.create';
import { Rule } from './schemas/rule.schema';


@Controller("api/auth")
@UseGuards(AuthGuard)
@UseInterceptors(TokenInterceptor)
export class AuthController {

  constructor(private readonly authService: AuthService,
    @Inject('BT_SERVICE') private BTClient: ClientProxy,
    private ws: WSGateway,
  ) {

  }

  @Post('check_existing_res')
  checkRes(@Body() rule: { name: any, attribute: any, value: any }[]) {

    return this.authService.getResourcesForAuth(rule)
  }

  @Get('try')
  try(@Req() req: Request, @Query() s: any) {
    console.log(s);

  }

  @Get("users")
  getUsers() {

    return this.authService.getUsers();
  }

  @Post('subjAttributes/pattern')
  getAttributesByPattern(@Body() pattern: { pattern: string }) {
    return this.authService.getAttributesNamesByPattern(pattern.pattern)
  }

  @Post('subjAttrValues/pattern')
  getSubjAttrValuesVyPattern(@Body() pattern: DinamicUser) {

    return this.authService.getSubjAttrValuesVyPattern(pattern)
  }

  @Get("microservice")
  getMicroservices() {

    return this.authService.getMicroservices();
  }

  @Post("microservice")
  async createMicroservice(@Body() microservice: MicroserviceUpdate) {

    let result = await this.authService.createMicroservice(microservice);
    this.ws.server.emit('create_microservice', JSON.stringify(result))
    return result
  }

  @Put("microservice")
  async editMicroservice(@Body() microservice: MicroserviceUpdate) {

    let result = await this.authService.createMicroservice(microservice);
    this.ws.server.emit('update_microservice', JSON.stringify(result))
    return result
  }


  @Delete("microservice/:id")
  async deleteMicroservice(@Param('id') id: string) {

    let result = await this.authService.deleteMicroservice(id);
    this.ws.server.emit('delete_microservice', JSON.stringify(result))
    return result
  }

  @Post("microservice/synch") // Синхронизируем ресурсы между микросервисами
  @UseInterceptors(TokenInterceptor)
  async synchronizeMicroservice(@Body() microservice: MicroserviceUpdate) {
    console.log('microservice ',microservice);
    
    return await this.authService.synchronize(microservice)

  }

  @Post('preview_users')
  async preview_users(@Body() groups: { name: string, value: string }[]) {
    let result = await this.authService.getUsersByGroups(groups)
    this.ws.server.emit('preview_users', JSON.stringify(result))
  }



  @Post("resource")
  getResourcesByPattern(@Body() pattern: { pattern: string }) {

    return this.authService.getResourcesByPattern(pattern.pattern)
  }

  @Get("resource")
  getResources() {

    return this.authService.getResources()
  }

  @Post("resourceUsers")
  getResourceUsers(@Body() rule: Rule) {

    return this.authService.getInfo(rule.uid, rule.type)
  }

  @Post('resource-update/:uid')
  updateResourceByUid(@Param('uid') uid: string, @Body() resourceUpdate: ResourceUpdate){
    return this.authService.updateResourceByUid(uid, resourceUpdate)
  }

  @Get('resource-attributes/:uidResource')
  getAttributesByResourceUid(@Param('uidResource') uid: string) {
    return this.authService.getAttributesByResourceUid(uid)
  }

  @Post('resource-attribute')
  updateResourceAttribute(@Body() resourceAttributeUpdate: ResourceAttributeUpdate) {
    return this.authService.updateResourceAttribute(resourceAttributeUpdate)
  }

  @Post('resource-attributes')
  updateResourceAttributes(@Body() resourceAttributesUpdate: ResourceAttributeUpdate[]) {
    return this.authService.updateResourceAttributes(resourceAttributesUpdate)
  }

  @Get("rule")
  getRules() {

    return this.authService.getRules()
  }

  @Get('rules/:id')
  getRulesByUidResource(@Param('id') id: number) {
    return this.authService.getRulesByResource(id)
  }

  @Get('microservice/resource/:uid')
  getResourceByMicroserviceId(@Param('uid') uid: string){
    return this.authService.getResourceByMicroserviceId(uid)
  }

  @Get('microservice/rule/:uid')
  getRuleByMicroserviceId(@Param('uid') uid: string){
    return this.authService.getRuleByMicroserviceId(uid)
  }

  @Post("rule")
  async createRule(@Body() rule: any) {
    let result = await this.authService.createRule(rule)
    this.ws.server.emit('create_rule', JSON.stringify(result))
    return result
  }

  @Post("ruleForField")
  async createRuleForField(@Body() rule: FieldRuleCreate) {
    let result = await this.authService.createRuleForField(rule)
    // this.ws.server.emit('create_rule', JSON.stringify(result))
    return result
  }

  @Post('ruleupdate')
  async updateRule(@Body() rule: RuleUpdate) {
    let result = await this.authService.updateRule(rule)
    this.ws.server.emit('update_rule', JSON.stringify(result))
    return result
  }

  @Delete('rule')
  async deleteRule(@Body() rule: any) {

    let result = await this.authService.deleteRule(rule.uid)
    this.ws.server.emit('delete_rule', JSON.stringify(result))
    return result
  }

  // выдача прав для обратившегося ресурса
  @Post('bt_permissions')
  async permitionsHandler(@Body() data: { data: string }) {


    this.authService.setUsersToRedis(2)

    console.log('data', data.data);
    
    if (this.authService.cache[data.data]) {
      return this.authService.cache[data.data]
    }
    let splitData = data.data.split(',')
    let permissions: Permission[];
    let permissionsFields: Permission[];
    let userAttributes: UserAttributes[];
    let sortedRules: any[]
    let sortedRulesForFields: any[]
    await this.authService.getUserById(splitData[1]).then(res => userAttributes = res)
    await this.authService.getPermissions(data.data).then(res => permissions = res)
    await this.authService.getPermissionsForFields(data.data).then(res => permissionsFields = res)
    sortedRules = this.authService.filterPermissions(permissions)
    sortedRulesForFields = this.authService.filterPermissions(permissionsFields)
    console.log(sortedRulesForFields);
    

    let handledPermissions = this.authService.handleUserPermissions(<[Permission[]]>sortedRules, userAttributes)
    let handledPermissionsForFields = this.authService.handleUserPermissions(<[Permission[]]>sortedRulesForFields, userAttributes)
    // let userGroups = this.authService.getGroups(splitData[1])
    this.authService.cache[data.data] = handledPermissions //добить

    console.log(handledPermissionsForFields);
    
    return {handledPermissions,handledPermissionsForFields}
    // return handledPermissions
  }




}


