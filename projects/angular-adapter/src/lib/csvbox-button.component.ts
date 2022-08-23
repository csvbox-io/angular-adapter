import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'csvbox-button',
  template: `
    <div>
      <button disabled (click)="openModal()" data-csvbox-initator [attr.data-csvbox-token]="uuid">
        <ng-content></ng-content>
      </button>
      <div #holder class="holder" attr.id="csvbox-embed-{{ uuid }}">
        <iframe #iframe class="iframe" [src]="safeUrl" [attr.data-csvbox-token]="uuid"></iframe>
      </div>
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
      .iframe{
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
  @ViewChild('iframe') iframe: any;
  @Input() onImport: Function;
  @Input() onReady: Function;
  @Input() onClose: Function;
  @Input() onSubmit: Function;

  @Input() user: Object;
  @Input() dynamicColumns: Object;
  @Input() licenseKey: String;
  @Input() options: Object;
  @Input() uuid: String = null;
  @Input() debugMode: boolean;
  @Input() useStagingServer: boolean;

  safeUrl:SafeUrl;

  constructor(public sanitizer:DomSanitizer) {}

  ngOnInit(): void {
    this.uuid = this.generateUuid();
    if(this.debugMode) {
      console.log(`[Csvbox-${this.uuid}]`,"UUID:");
      console.log(`[Csvbox-${this.uuid}]`,"License key:", this.licenseKey);
      console.log(`[Csvbox-${this.uuid}]`,`Using ${this.useStagingServer ? 'staging' : 'live'} server` );
    }
    let url = `https://${this.useStagingServer ? 'staging' : 'app' }.csvbox.io/embed/${this.licenseKey}`;

    url += "?library-version=2";

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
    this.iframe?.nativeElement?.contentWindow?.postMessage({
      "customer" : data
    }, "*");
  }

  ngAfterViewInit(): void {
    window.addEventListener("message", (event) => {

      if(this.debugMode) { console.log(`[Csvbox-${this.uuid}]`, "Message:", event); }

      if (event?.data === "mainModalHidden") {
        this.holder.nativeElement.style.display = 'none';
        this.isModalShown = false;
        this.onClose?.();
      }
      if(event?.data === "uploadSuccessful") {
        this.onImport(true);
      }
      if(event?.data === "uploadFailed") {
        this.onImport(false);
      }
      if(typeof event?.data == "object") {
        if(event?.data?.data?.unique_token == this.uuid) {
          if(event.data.type && event.data.type == "data-on-submit") {
            let metadata = event.data.data;
            metadata["column_mappings"] = event.data.column_mapping;
            // this.callback(true, metadata);
            delete metadata["unique_token"];
            this.onSubmit?.(metadata);
        }
        else if(event.data.type && event.data.type == "data-push-status") {
            if(event.data.data.import_status == "success") {
                // this.callback(true, event.data.data);
                if(event?.data?.row_data) {
                    let primary_row_data = event.data.row_data;
                    let headers = event.data.headers;
                    let rows = [];
                    let dynamic_columns_indexes = event.data.dynamicColumnsIndexes;
                    primary_row_data.forEach((row_data) => {
                        let x = {};
                        let dynamic_columns = {};
                        row_data.data.forEach((col, i)=>{

                            if(col == undefined){ col = ""};

                            if(dynamic_columns_indexes.includes(i)) {
                                dynamic_columns[headers[i]] = col;
                            }else{
                                x[headers[i]] = col;
                            }
                        });
                        if(row_data?.unmapped_data) {
                            x["_unmapped_data"] = row_data.unmapped_data;
                        }
                        if(dynamic_columns && Object.keys(dynamic_columns).length > 0) {
                            x["_dynamic_data"] = dynamic_columns;
                        }
                        rows.push(x);
                    });
                    let metadata = event.data.data;
                    metadata["rows"] = rows;
                    delete metadata["unique_token"];
                    this.onImport(true, metadata);
                }else{
                    let metadata = event.data.data;
                    delete metadata["unique_token"];
                    this.onImport(true, metadata);
                }
            }else {
                let metadata = event.data.data;
                delete metadata["unique_token"];
                this.onImport(false, metadata);
            }
        }


        }
      }
    }, false);

    let iframe = this.iframe.nativeElement;
    // let user = this.user;
    // let dynamicColumns = this.dynamicColumns;
    // let options = this.options;
    // let uuid = this.uuid;

    let self = this;

    iframe.onload = function () {

      if(self.debugMode) { console.log(`[Csvbox-${self.uuid}]`,"iframe loaded"); }

      self.onReady?.();

      self.enableInitator();

      iframe.contentWindow.postMessage({
        "customer" : self.user ? self.user : null,
        "columns" : self.dynamicColumns ? self.dynamicColumns : null,
        "options" : self.options ? self.options : null,
        "unique_token": self.uuid
      }, "*");

    }
  }
  enableInitator(){
    let initator = document.querySelector(`[data-csvbox-initator][data-csvbox-token="${this.uuid}"]`) as HTMLButtonElement;
    if(initator && initator.disabled !== undefined) {
      initator.disabled = false;
    }
  }
  openModal(): void {
    if(!this.isModalShown) {
      this.isModalShown = true;
      this.iframe.nativeElement.contentWindow.postMessage('openModal', '*');
      this.holder.nativeElement.style.display = 'block';
    }
  }
}
