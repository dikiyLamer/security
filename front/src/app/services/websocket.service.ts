import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from "socket.io-client";
import { mainURL } from 'src/environments/environment';


@Injectable()
export class WebsocketService {

  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  public message0$: BehaviorSubject<string> = new BehaviorSubject('');
  public message1$: BehaviorSubject<string> = new BehaviorSubject('');
  public message2$: BehaviorSubject<string> = new BehaviorSubject('');
  public message3$: BehaviorSubject<string> = new BehaviorSubject('');
  public message4$: BehaviorSubject<string> = new BehaviorSubject('');
  constructor() {

    this.socket.on('create_microservice', (message) =>{
      this.message$.next(message);
    });

    this.socket.on('preview_users', (message) => {
      this.message0$.next(message)
    })

    this.socket.on('delete_microservice', (message) =>{
      this.message1$.next(message);
    });


    this.socket.on('update_microservice', (message) =>{
      this.message4$.next(message);
    });

    this.socket.on('delete_rule', (message) =>{
      this.message2$.next(message);
    });

    this.socket.on('create_rule', (message) =>{
      this.message3$.next(message);
    });
  }

  socket = io(mainURL);

  // listen(eventName: string) {
  //   console.log('connect');
  //   return new Observable((subscriber) => {
  //     this.socket.on(eventName, (data: any) => {

  //       subscriber.next(data);
  //     })
  //   })
  // }

  public sendMessage(message: any) {
    console.log('sendMessage: ', message)
    this.socket.emit('message', message);
  }


  public create_microservice() {
    return this.message$
  };

  public delete_microservice() {
    return this.message1$
  };

  public update_microservice() {
    return this.message4$
  };

  public delete_rule = () => {
    return this.message2$
  };

  public create_rule = () => {
    return this.message3$
  };
 }
