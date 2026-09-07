import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  SecurityContext,
  AfterContentInit
} from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';
import { insertCSS } from '../utlis/insertCSS';
import { buildImportUrl, generateUuid, buildInitPayload, classifyStructuredMessage } from '@csvbox/adapter';

const appVersion = '1.1.16';

@Component({
  selector: 'csvbox-button',
  template: `
    <div>
      <button [disabled]="disabled" (click)="openModal()" [attr.data-csvbox-token]="uuid">
        <ng-content></ng-content>
      </button>
    </div>
  `
})

export class CSVBoxButtonComponent implements OnInit, OnChanges, AfterContentInit {

  isModalShown = false;

  @Input() onImport?: Function;
  @Input() onReady?: Function;
  @Input() onClose?: Function;
  @Input() onSubmit?: Function;

  @Input() isImported?: Function;
  @Input() isReady?: Function;
  @Input() isClosed?: Function;
  @Input() isSubmitted?: Function;

  @Input() importerReady?: Function;
  @Input() closed?: Function;
  @Input() submitted?: Function;
  @Input() imported?: Function;
  @Input() loadStarted?: Function;

  @Input() user?: object;
  @Input() dynamicColumns?: object;
  @Input() licenseKey: string | null = null;
  @Input() options?: object;
  @Input() uuid: string | null = null;
  @Input() customDomain: string | null = null;
  @Input() dataLocation: string | null = null;
  @Input() language: string | null = null;
  @Input() environment?: object;

  @Input() theme: string | null = null;

  @Input() isIframeLoaded: boolean = false;
  @Input() openModalOnIframeLoad: boolean = false;

  @Input() lazy: boolean = false;

  safeUrl: any;

  iframe: HTMLIFrameElement | null = null;

  @Input() disabled: boolean = true;

  constructor(public sanitizer:DomSanitizer) {}

  holder: any;

  ngOnInit(): void {
    this.uuid = generateUuid();
    let iframeUrl = buildImportUrl(
      {
        licenseKey: this.licenseKey,
        customDomain: this.customDomain,
        dataLocation: this.dataLocation,
        language: this.language,
        theme: this.theme,
        environment: this.environment
      },
      "angular",
      appVersion
    );
    this.safeUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl));
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes["user"] && changes['user'].currentValue != changes['user'].previousValue) {
      this.updateUserVariabe(changes['user'].currentValue);
    }
  }

  updateUserVariabe(data: any): void {
    this.user = data;
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({
        "customer" : data
      }, "*");
    }
  }

  ngAfterContentInit(): void {
    window.addEventListener("message", (event) => {
      let message = classifyStructuredMessage(event.data, this.uuid!);
      if (!message) {
        return;
      }

      if (message.type === "data-on-submit") {
        if (this.onSubmit) this.onSubmit(message.metadata);
        if (this.isSubmitted) this.isSubmitted(message.metadata);
        if (this.submitted) this.submitted(message.metadata);
      } else if (message.type === "data-push-status") {
        if (!message.success) {
          delete message.metadata["unique_token"];
        }
        if (this.onImport) this.onImport(message.success, message.metadata);
        if (this.isImported) this.isImported(message.success, message.metadata);
        if (this.imported) this.imported(message.success, message.metadata);
      } else if (message.type === "csvbox-modal-hidden") {
        this.handleModalClosed();
      } else if (message.type === "csvbox-upload-successful") {
          if (this.onImport) this.onImport(true);
          if (this.isImported) this.isImported(true);
          if (this.imported) this.imported(true);
      } else if (message.type === "csvbox-upload-failed") {
          if (this.onImport) this.onImport(false);
          if (this.isImported) this.isImported(false);
          if (this.imported) this.imported(false);
      }
    }, false);

    if(this.lazy) {
      this.disabled = false;
    } else {
      this.disabled = true;
      this.initImporter();
    }
  }

  handleModalClosed(): void {
    if (this.holder) this.holder.style.display = 'none';
    this.isModalShown = false;
    this.isIframeLoaded = false;
    this.openModalOnIframeLoad = false;
    if (this.holder) this.holder.remove();
    this.holder = null;
    this.iframe = null;
    if (this.onClose) this.onClose();
    if (this.isClosed) this.isClosed();
    if (this.closed) this.closed();
  }

  initImporter() {
    if (this.loadStarted) this.loadStarted();

    this.uuid = generateUuid();

    insertCSS();

    let iframe = document.createElement("iframe");
    this.iframe = iframe;
    iframe.setAttribute("src", this.safeUrl);
    iframe.setAttribute("allow", "clipboard-read; clipboard-write *");
    iframe.frameBorder = "0";

    let self = this;
    iframe.onload = function () {
      if (self.onReady) self.onReady();
      if (self.isReady) self.isReady();
      if (self.importerReady) self.importerReady();

      self.disabled = false;
      self.isIframeLoaded = true;
      if (self.iframe && self.iframe.contentWindow) {
        self.iframe.contentWindow.postMessage(buildInitPayload(self.user, self.dynamicColumns, self.options, self.uuid!), "*");
      }
      if(self.openModalOnIframeLoad) {
        self.openModal();
      }
    }

    this.holder = document.createElement('div');
    this.holder.classList.add('csvbox-holder');
    this.holder.setAttribute('id', `csvbox-embed-${this.uuid}`);
    this.holder.appendChild(iframe);

    document.body.insertAdjacentElement(
      'beforeend', this.holder
    );
  }

  openModal(): void {
    if(!this.iframe) {
        this.openModalOnIframeLoad = true;
        this.initImporter();
        return;
    }
    if(!this.isModalShown) {
      if(this.isIframeLoaded) {
          this.isModalShown = true;
          if(this.holder) this.holder.style.display = 'block';
          if(this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage('openModal', '*');
          }
      } else {
          this.openModalOnIframeLoad = true;
      }
    }
  }

}
