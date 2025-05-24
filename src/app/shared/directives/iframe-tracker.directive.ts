import {
  Directive,
  ElementRef,
  OnInit,
  Renderer2,
  Input,
  Output,
  EventEmitter,
  HostListener
 } from '@angular/core';

@Directive({
  selector: '[eclipseIframeTracker]',
  standalone: true
})
export class IframeTrackerDirective implements OnInit {

  private iframeMouseOver!: boolean;

  @Input() debug!: boolean;

  @Output() iframeClick = new EventEmitter<ElementRef>();

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.renderer.listen(window, 'blur', () => this.onWindowBlur());
  }

  @HostListener('mouseover')
  private onIframeMouseOver() {
    this.iframeMouseOver = true;
  }

  @HostListener('mouseout')
  private onIframeMouseOut() {
    this.iframeMouseOver = false;
  }

  private onWindowBlur() {
    if (this.iframeMouseOver) {
      this.iframeClick.emit(this.el);
    }
  }


}
