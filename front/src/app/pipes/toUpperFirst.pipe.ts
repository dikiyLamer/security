import { Pipe, PipeTransform } from '@angular/core';
  
@Pipe({
    name: 'upper'
})
export class UpperPipe implements PipeTransform {
  transform(value: string, args?: any): string {
    let upperValue = value.slice(0,1).toUpperCase() + value.slice(1)
    return upperValue
  }
}