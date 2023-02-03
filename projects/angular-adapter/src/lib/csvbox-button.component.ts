import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

const packageJson = require('./../package.json');

@Component({
  selector: 'csvbox-button',
  template: `
    <div>
      <button disabled (click)="openModal()" data-csvbox-initator [attr.data-csvbox-token]="uuid">
        <ng-content></ng-content>
      </button>
      <div #holder class="holder" attr.id="csvbox-embed-{{ uuid }}"></div>
    </div>
  `,
  styles: [
    `
      .holder{
        z-index: 2147483647;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: none;
      }
      .csvbox-iframe {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0px;
        left: 0px;
      }
    `
  ]
})

export class CSVBoxButtonComponent implements OnInit, OnChanges {

  isModalShown = false;

  @ViewChild('holder') holder: any;
  // @ViewChild('iframe') iframe: any;
  @Input() onImport: Function;
  @Input() onReady: Function;
  @Input() onClose: Function;
  @Input() onSubmit: Function;

  @Input() isImported: Function;
  @Input() isReady: Function;
  @Input() isClosed: Function;
  @Input() isSubmitted: Function;

  @Input() user: Object;
  @Input() dynamicColumns: Object;
  @Input() licenseKey: String;
  @Input() options: Object;
  @Input() uuid: String = null;
  @Input() customDomain: String = null;
  @Input() dataLocation: String = null;
  @Input() language: String = null;

  @Input() isIframeLoaded: boolean = false;
  @Input() openModalOnIframeLoad: boolean = false;

  @Input() lazy: boolean = false;

  safeUrl: any;

  iframe = null;

  constructor(public sanitizer:DomSanitizer) {}

  ngOnInit(): void {
    this.uuid = this.generateUuid();
    let domain = this.customDomain ? this.customDomain : "app.csvbox.io";
    if(this.dataLocation) { domain = `${this.dataLocation}-${domain}`; }
    let iframeUrl = `https://${domain}/embed/${this.licenseKey}`;
    iframeUrl += `?library-version=${packageJson.version}`;
    iframeUrl += "&framework=angular";
    if(this.dataLocation) {
      iframeUrl += "&preventRedirect";
    }
    if(this.language){
      iframeUrl += "&language" + this.language;
    }
    // this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);

    this.safeUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl));


  }

  generateUuid(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes["user"] && changes['user'].currentValue != changes['user'].previousValue) {
      this.updateUserVariabe(changes['user'].currentValue);
    }
  }

  updateUserVariabe(data): void {
    this.user = data;
    this.iframe?.contentWindow?.postMessage({
      "customer" : data
    }, "*");
  }

  ngAfterViewInit(): void {
    window.addEventListener("message", (event) => {
      if(typeof event?.data == "object") {
        if(event?.data?.data?.unique_token == this.uuid) {
          if(event.data.type && event.data.type == "data-on-submit") {
            let metadata = event.data.data;
            metadata["column_mappings"] = event.data.column_mapping;
            // this.callback(true, metadata);
            delete metadata["unique_token"];
            this.onSubmit?.(metadata);
            this.isSubmitted?.(metadata);
          } else if(event.data.type && event.data.type == "data-push-status") {
            if(event.data.data.import_status == "success") {
                // this.callback(true, event.data.data);
                if(event?.data?.row_data) {
                    let primary_row_data = event.data.row_data;
                    let headers = event.data.headers;
                    let rows = [];
                    let dynamic_columns_indexes = event.data.dynamicColumnsIndexes;
                    let virtual_columns_indexes = event.data.virtualColumnsIndexes || [];

                    primary_row_data.forEach((row_data) => {
                        
                      let x = {};
                        let dynamic_columns = {};
                        let virtual_data = {};

                        row_data.data.forEach((col, i)=>{

                            if(col == undefined){ col = ""};

                            if(dynamic_columns_indexes.includes(i)) {
                                dynamic_columns[headers[i]] = col;
                            }
                            else if(virtual_columns_indexes.includes(i)) {
                              virtual_data[headers[i]] = col;
                            }
                            else{
                                x[headers[i]] = col;
                            }
                        });
                        if(row_data?.unmapped_data) {
                          x["_unmapped_data"] = row_data.unmapped_data;
                        }
                        if(dynamic_columns && Object.keys(dynamic_columns).length > 0) {
                          x["_dynamic_data"] = dynamic_columns;
                        }
                        if(virtual_data && Object.keys(virtual_data).length > 0) {
                          x["_virtual_data"] = virtual_data;
                        }
                        rows.push(x);
                    });
                    let metadata = event.data.data;
                    metadata["rows"] = rows;
                    delete metadata["unique_token"];
                    this.onImport?.(true, metadata);
                    this.isImported?.(true, metadata);
                }else{
                    let metadata = event.data.data;
                    delete metadata["unique_token"];
                    this.onImport?.(true, metadata);
                    this.isImported?.(true, metadata);
                }
            }else {
                let metadata = event.data.data;
                delete metadata["unique_token"];
                this.onImport?.(false, metadata);
                this.isImported?.(false, metadata);
            }
          } else if(event.data.type && event.data.type == "csvbox-modal-hidden") {
            this.holder.nativeElement.style.display = 'none';
            this.isModalShown = false;
            this.onClose?.();
            this.isClosed?.();
          } else if(event.data.type && event.data.type == "csvbox-upload-successful") {
              this.onImport?.(true);
              this.isImported?.(true);
          } else if(event.data.type && event.data.type == "csvbox-upload-failed") {
              this.onImport?.(false);
              this.isImported?.(false);
          }


        }
      }
    }, false);

    // let iframe = this.iframe.nativeElement;
    // let self = this;
    // iframe.onload = function () {
    //   self.onReady?.();
    //   self.enableInitator();
    //   iframe.contentWindow.postMessage({
    //     "customer" : self.user ? self.user : null,
    //     "columns" : self.dynamicColumns ? self.dynamicColumns : null,
    //     "options" : self.options ? self.options : null,
    //     "unique_token": self.uuid
    //   }, "*");
    // }

    if(this.lazy) {
      this.enableInitator();
    } else {
        this.initImporter();
    }

  }
  initImporter() {
    let iframe = document.createElement("iframe");
    this.iframe = iframe;
    iframe.setAttribute("src", this.safeUrl);
    iframe.frameBorder = "0";
    // iframe.classList.add('csvbox-iframe');

    
    iframe.style.height = "100%";
    iframe.style.width = "100%";
    iframe.style.position = "absolute";
    iframe.style.top = "0px";
    iframe.style.left = "0px";

    let self = this;
    iframe.onload = function () {
      self.onReady?.();
      self.isReady?.();
      self.enableInitator();
      self.isIframeLoaded = true;
      iframe.contentWindow.postMessage({
        "customer" : self.user ? self.user : null,
        "columns" : self.dynamicColumns ? self.dynamicColumns : null,
        "options" : self.options ? self.options : null,
        "unique_token": self.uuid
      }, "*");
      if(self.openModalOnIframeLoad) {
        self.openModal();
      }
    }

    this.holder.nativeElement.appendChild(iframe);

  }
  
  enableInitator() {
    let initator = document.querySelector(`[data-csvbox-initator][data-csvbox-token="${this.uuid}"]`) as HTMLButtonElement;
    if(initator && initator.disabled !== undefined) {
      initator.disabled = false;
    }
  }

  disableInitator() {
    let initator = document.querySelector(`[data-csvbox-initator][data-csvbox-token="${this.uuid}"]`) as HTMLButtonElement;
    if(initator && initator.disabled !== undefined) {
      initator.disabled = true;
    }
  }
  
  openModal(): void {

    if(this.lazy) {
      console.log("is lazy");
      if(!this.iframe) {
        console.log("!iframe");
          this.openModalOnIframeLoad = true;
          this.initImporter();
          return;
      }else{
        console.log("iframe");
      }
    }
    if(!this.isModalShown) {
      if(this.isIframeLoaded) {
          this.isModalShown = true;
          this.holder.nativeElement.style.display = 'block';
          this.iframe.contentWindow.postMessage('openModal', '*');
      } else {
          this.openModalOnIframeLoad = true;
      }                    
    }
  }

}
