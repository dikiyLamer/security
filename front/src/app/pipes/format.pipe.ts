import { Pipe, PipeTransform } from '@angular/core';
  
@Pipe({
    name: 'format'
})
export class FormatPipe implements PipeTransform {
  transform(value: string, args?: any): string {
    console.log(value);
    
    let data = JSON.parse(value)  
    let attrs = ''
    for (let key in data){
      attrs += ' ' + data[key]
    }
    
    return attrs
  }
}