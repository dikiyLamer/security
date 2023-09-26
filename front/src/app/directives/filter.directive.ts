import { EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';


@Directive({
  selector: '[appFilter]'
})
export class FilterDirective implements OnInit, OnChanges {

  @Input() invisible!: boolean
  @Output() ev = new EventEmitter()


  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!changes['invisible'].currentValue) {
      this.renderer.setStyle(this.host.nativeElement, 'display', 'block')
    }
    else {
      this.renderer.setStyle(this.host.nativeElement, 'display', 'none')
    }


  }

  ngOnInit(): void {

    this.renderer.setStyle(this.host.nativeElement, 'display', 'none')
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {

    event.stopPropagation()

    let button = document.getElementById('filterButton')

    if (!this.host.nativeElement.contains(event.target as Node) && !button?.contains(event.target as Node)) {

      this.ev.emit()
    }


  }



}
