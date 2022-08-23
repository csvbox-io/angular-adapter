import { Component, ViewChild, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/platform-browser";
export class CSVBoxButtonComponent {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.isModalShown = false;
        this.uuid = null;
    }
    ngOnInit() {
        this.uuid = this.generateUuid();
        if (this.debugMode) {
            console.log(`[Csvbox-${this.uuid}]`, "UUID:");
            console.log(`[Csvbox-${this.uuid}]`, "License key:", this.licenseKey);
            console.log(`[Csvbox-${this.uuid}]`, `Using ${this.useStagingServer ? 'staging' : 'live'} server`);
        }
        let url = `https://${this.useStagingServer ? 'staging' : 'app'}.csvbox.io/embed/${this.licenseKey}`;
        url += "?library-version=2";
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    generateUuid() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    ngOnChanges(changes) {
        if (changes["user"] && changes['user'].currentValue != changes['user'].previousValue) {
            this.updateUserVariabe(changes['user'].currentValue);
        }
    }
    updateUserVariabe(data) {
        var _a, _b, _c;
        this.user = data;
        (_c = (_b = (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.nativeElement) === null || _b === void 0 ? void 0 : _b.contentWindow) === null || _c === void 0 ? void 0 : _c.postMessage({
            "customer": data
        }, "*");
    }
    ngAfterViewInit() {
        window.addEventListener("message", (event) => {
            var _a, _b, _c, _d, _e;
            if (this.debugMode) {
                console.log(`[Csvbox-${this.uuid}]`, "Message:", event);
            }
            if ((event === null || event === void 0 ? void 0 : event.data) === "mainModalHidden") {
                this.holder.nativeElement.style.display = 'none';
                this.isModalShown = false;
                (_a = this.onClose) === null || _a === void 0 ? void 0 : _a.call(this);
            }
            if ((event === null || event === void 0 ? void 0 : event.data) === "uploadSuccessful") {
                this.onImport(true);
            }
            if ((event === null || event === void 0 ? void 0 : event.data) === "uploadFailed") {
                this.onImport(false);
            }
            if (typeof (event === null || event === void 0 ? void 0 : event.data) == "object") {
                if (((_c = (_b = event === null || event === void 0 ? void 0 : event.data) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.unique_token) == this.uuid) {
                    if (event.data.type && event.data.type == "data-on-submit") {
                        let metadata = event.data.data;
                        metadata["column_mappings"] = event.data.column_mapping;
                        // this.callback(true, metadata);
                        delete metadata["unique_token"];
                        (_d = this.onSubmit) === null || _d === void 0 ? void 0 : _d.call(this, metadata);
                    }
                    else if (event.data.type && event.data.type == "data-push-status") {
                        if (event.data.data.import_status == "success") {
                            // this.callback(true, event.data.data);
                            if ((_e = event === null || event === void 0 ? void 0 : event.data) === null || _e === void 0 ? void 0 : _e.row_data) {
                                let primary_row_data = event.data.row_data;
                                let headers = event.data.headers;
                                let rows = [];
                                let dynamic_columns_indexes = event.data.dynamicColumnsIndexes;
                                primary_row_data.forEach((row_data) => {
                                    let x = {};
                                    let dynamic_columns = {};
                                    row_data.data.forEach((col, i) => {
                                        if (col == undefined) {
                                            col = "";
                                        }
                                        ;
                                        if (dynamic_columns_indexes.includes(i)) {
                                            dynamic_columns[headers[i]] = col;
                                        }
                                        else {
                                            x[headers[i]] = col;
                                        }
                                    });
                                    if (row_data === null || row_data === void 0 ? void 0 : row_data.unmapped_data) {
                                        x["_unmapped_data"] = row_data.unmapped_data;
                                    }
                                    if (dynamic_columns && Object.keys(dynamic_columns).length > 0) {
                                        x["_dynamic_data"] = dynamic_columns;
                                    }
                                    rows.push(x);
                                });
                                let metadata = event.data.data;
                                metadata["rows"] = rows;
                                delete metadata["unique_token"];
                                this.onImport(true, metadata);
                            }
                            else {
                                let metadata = event.data.data;
                                delete metadata["unique_token"];
                                this.onImport(true, metadata);
                            }
                        }
                        else {
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
            var _a;
            if (self.debugMode) {
                console.log(`[Csvbox-${self.uuid}]`, "iframe loaded");
            }
            (_a = self.onReady) === null || _a === void 0 ? void 0 : _a.call(self);
            self.enableInitator();
            iframe.contentWindow.postMessage({
                "customer": self.user ? self.user : null,
                "columns": self.dynamicColumns ? self.dynamicColumns : null,
                "options": self.options ? self.options : null,
                "unique_token": self.uuid
            }, "*");
        };
    }
    enableInitator() {
        let initator = document.querySelector(`[data-csvbox-initator][data-csvbox-token="${this.uuid}"]`);
        if (initator && initator.disabled !== undefined) {
            initator.disabled = false;
        }
    }
    openModal() {
        if (!this.isModalShown) {
            this.isModalShown = true;
            this.iframe.nativeElement.contentWindow.postMessage('openModal', '*');
            this.holder.nativeElement.style.display = 'block';
        }
    }
}
CSVBoxButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0, type: CSVBoxButtonComponent, deps: [{ token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Component });
CSVBoxButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.2", type: CSVBoxButtonComponent, selector: "csvbox-button", inputs: { onImport: "onImport", onReady: "onReady", onClose: "onClose", onSubmit: "onSubmit", user: "user", dynamicColumns: "dynamicColumns", licenseKey: "licenseKey", options: "options", uuid: "uuid", debugMode: "debugMode", useStagingServer: "useStagingServer" }, viewQueries: [{ propertyName: "holder", first: true, predicate: ["holder"], descendants: true }, { propertyName: "iframe", first: true, predicate: ["iframe"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div>
      <button disabled (click)="openModal()" data-csvbox-initator [attr.data-csvbox-token]="uuid">
        <ng-content></ng-content>
      </button>
      <div #holder class="holder" attr.id="csvbox-embed-{{ uuid }}">
        <iframe #iframe class="iframe" [src]="safeUrl" [attr.data-csvbox-token]="uuid"></iframe>
      </div>
    </div>
  `, isInline: true, styles: ["\n      .holder{\n        z-index: 2147483647;\n        position: fixed;\n        top: 0;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        display: none;\n      }\n      .iframe{\n        height: 100%;\n        width: 100%;\n        position: absolute;\n        top: 0px;\n        left: 0px;\n      }\n    "] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0, type: CSVBoxButtonComponent, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], ctorParameters: function () { return [{ type: i1.DomSanitizer }]; }, propDecorators: { holder: [{
                type: ViewChild,
                args: ['holder']
            }], iframe: [{
                type: ViewChild,
                args: ['iframe']
            }], onImport: [{
                type: Input
            }], onReady: [{
                type: Input
            }], onClose: [{
                type: Input
            }], onSubmit: [{
                type: Input
            }], user: [{
                type: Input
            }], dynamicColumns: [{
                type: Input
            }], licenseKey: [{
                type: Input
            }], options: [{
                type: Input
            }], uuid: [{
                type: Input
            }], debugMode: [{
                type: Input
            }], useStagingServer: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N2Ym94LWJ1dHRvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWFkYXB0ZXIvc3JjL2xpYi9jc3Zib3gtYnV0dG9uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFVLFNBQVMsRUFBRSxLQUFLLEVBQTRCLE1BQU0sZUFBZSxDQUFDOzs7QUFxQzlGLE1BQU0sT0FBTyxxQkFBcUI7SUFxQmhDLFlBQW1CLFNBQXNCO1FBQXRCLGNBQVMsR0FBVCxTQUFTLENBQWE7UUFuQnpDLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBYVosU0FBSSxHQUFXLElBQUksQ0FBQztJQU1lLENBQUM7SUFFN0MsUUFBUTtRQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2hDLElBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFDLFNBQVMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sU0FBUyxDQUFFLENBQUM7U0FDcEc7UUFDRCxJQUFJLEdBQUcsR0FBRyxXQUFXLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFNLG9CQUFvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFckcsR0FBRyxJQUFJLG9CQUFvQixD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LEVBQUU7WUFDckIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7U0FDbkQ7SUFDSCxDQUFDOztrSEF0S1UscUJBQXFCO3NHQUFyQixxQkFBcUIseWdCQWhDdEI7Ozs7Ozs7OztHQVNUOzJGQXVCVSxxQkFBcUI7a0JBbENqQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxlQUFlO29CQUN6QixRQUFRLEVBQUU7Ozs7Ozs7OztHQVNUO29CQUNELE1BQU0sRUFBRTt3QkFDTjs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FpQkM7cUJBQ0Y7aUJBQ0Y7bUdBTXNCLE1BQU07c0JBQTFCLFNBQVM7dUJBQUMsUUFBUTtnQkFDRSxNQUFNO3NCQUExQixTQUFTO3VCQUFDLFFBQVE7Z0JBQ1YsUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxPQUFPO3NCQUFmLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBRUcsSUFBSTtzQkFBWixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxPQUFPO3NCQUFmLEtBQUs7Z0JBQ0csSUFBSTtzQkFBWixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csZ0JBQWdCO3NCQUF4QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIFZpZXdDaGlsZCwgSW5wdXQsIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyLCBTYWZlVXJsIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2NzdmJveC1idXR0b24nLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXY+XG4gICAgICA8YnV0dG9uIGRpc2FibGVkIChjbGljayk9XCJvcGVuTW9kYWwoKVwiIGRhdGEtY3N2Ym94LWluaXRhdG9yIFthdHRyLmRhdGEtY3N2Ym94LXRva2VuXT1cInV1aWRcIj5cbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgICAgPC9idXR0b24+XG4gICAgICA8ZGl2ICNob2xkZXIgY2xhc3M9XCJob2xkZXJcIiBhdHRyLmlkPVwiY3N2Ym94LWVtYmVkLXt7IHV1aWQgfX1cIj5cbiAgICAgICAgPGlmcmFtZSAjaWZyYW1lIGNsYXNzPVwiaWZyYW1lXCIgW3NyY109XCJzYWZlVXJsXCIgW2F0dHIuZGF0YS1jc3Zib3gtdG9rZW5dPVwidXVpZFwiPjwvaWZyYW1lPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGAsXG4gIHN0eWxlczogW1xuICAgIGBcbiAgICAgIC5ob2xkZXJ7XG4gICAgICAgIHotaW5kZXg6IDIxNDc0ODM2NDc7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgfVxuICAgICAgLmlmcmFtZXtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDBweDtcbiAgICAgICAgbGVmdDogMHB4O1xuICAgICAgfVxuICAgIGBcbiAgXVxufSlcblxuZXhwb3J0IGNsYXNzIENTVkJveEJ1dHRvbkNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcblxuICBpc01vZGFsU2hvd24gPSBmYWxzZTtcblxuICBAVmlld0NoaWxkKCdob2xkZXInKSBob2xkZXI6IGFueTtcbiAgQFZpZXdDaGlsZCgnaWZyYW1lJykgaWZyYW1lOiBhbnk7XG4gIEBJbnB1dCgpIG9uSW1wb3J0OiBGdW5jdGlvbjtcbiAgQElucHV0KCkgb25SZWFkeTogRnVuY3Rpb247XG4gIEBJbnB1dCgpIG9uQ2xvc2U6IEZ1bmN0aW9uO1xuICBASW5wdXQoKSBvblN1Ym1pdDogRnVuY3Rpb247XG5cbiAgQElucHV0KCkgdXNlcjogT2JqZWN0O1xuICBASW5wdXQoKSBkeW5hbWljQ29sdW1uczogT2JqZWN0O1xuICBASW5wdXQoKSBsaWNlbnNlS2V5OiBTdHJpbmc7XG4gIEBJbnB1dCgpIG9wdGlvbnM6IE9iamVjdDtcbiAgQElucHV0KCkgdXVpZDogU3RyaW5nID0gbnVsbDtcbiAgQElucHV0KCkgZGVidWdNb2RlOiBib29sZWFuO1xuICBASW5wdXQoKSB1c2VTdGFnaW5nU2VydmVyOiBib29sZWFuO1xuXG4gIHNhZmVVcmw6U2FmZVVybDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2FuaXRpemVyOkRvbVNhbml0aXplcikge31cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnV1aWQgPSB0aGlzLmdlbmVyYXRlVXVpZCgpO1xuICAgIGlmKHRoaXMuZGVidWdNb2RlKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW0NzdmJveC0ke3RoaXMudXVpZH1dYCxcIlVVSUQ6XCIpO1xuICAgICAgY29uc29sZS5sb2coYFtDc3Zib3gtJHt0aGlzLnV1aWR9XWAsXCJMaWNlbnNlIGtleTpcIiwgdGhpcy5saWNlbnNlS2V5KTtcbiAgICAgIGNvbnNvbGUubG9nKGBbQ3N2Ym94LSR7dGhpcy51dWlkfV1gLGBVc2luZyAke3RoaXMudXNlU3RhZ2luZ1NlcnZlciA/ICdzdGFnaW5nJyA6ICdsaXZlJ30gc2VydmVyYCApO1xuICAgIH1cbiAgICBsZXQgdXJsID0gYGh0dHBzOi8vJHt0aGlzLnVzZVN0YWdpbmdTZXJ2ZXIgPyAnc3RhZ2luZycgOiAnYXBwJyB9LmNzdmJveC5pby9lbWJlZC8ke3RoaXMubGljZW5zZUtleX1gO1xuXG4gICAgdXJsICs9IFwiP2xpYnJhcnktdmVyc2lvbj0yXCI7XG5cbiAgICB0aGlzLnNhZmVVcmwgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwodXJsKTtcbiAgfVxuXG4gIGdlbmVyYXRlVXVpZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZihjaGFuZ2VzW1widXNlclwiXSAmJiBjaGFuZ2VzWyd1c2VyJ10uY3VycmVudFZhbHVlICE9IGNoYW5nZXNbJ3VzZXInXS5wcmV2aW91c1ZhbHVlKSB7XG4gICAgICB0aGlzLnVwZGF0ZVVzZXJWYXJpYWJlKGNoYW5nZXNbJ3VzZXInXS5jdXJyZW50VmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVVzZXJWYXJpYWJlKGRhdGEpOiB2b2lkIHtcbiAgICB0aGlzLnVzZXIgPSBkYXRhO1xuICAgIHRoaXMuaWZyYW1lPy5uYXRpdmVFbGVtZW50Py5jb250ZW50V2luZG93Py5wb3N0TWVzc2FnZSh7XG4gICAgICBcImN1c3RvbWVyXCIgOiBkYXRhXG4gICAgfSwgXCIqXCIpO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZXZlbnQpID0+IHtcblxuICAgICAgaWYodGhpcy5kZWJ1Z01vZGUpIHsgY29uc29sZS5sb2coYFtDc3Zib3gtJHt0aGlzLnV1aWR9XWAsIFwiTWVzc2FnZTpcIiwgZXZlbnQpOyB9XG5cbiAgICAgIGlmIChldmVudD8uZGF0YSA9PT0gXCJtYWluTW9kYWxIaWRkZW5cIikge1xuICAgICAgICB0aGlzLmhvbGRlci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuaXNNb2RhbFNob3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25DbG9zZT8uKCk7XG4gICAgICB9XG4gICAgICBpZihldmVudD8uZGF0YSA9PT0gXCJ1cGxvYWRTdWNjZXNzZnVsXCIpIHtcbiAgICAgICAgdGhpcy5vbkltcG9ydCh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmKGV2ZW50Py5kYXRhID09PSBcInVwbG9hZEZhaWxlZFwiKSB7XG4gICAgICAgIHRoaXMub25JbXBvcnQoZmFsc2UpO1xuICAgICAgfVxuICAgICAgaWYodHlwZW9mIGV2ZW50Py5kYXRhID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgaWYoZXZlbnQ/LmRhdGE/LmRhdGE/LnVuaXF1ZV90b2tlbiA9PSB0aGlzLnV1aWQpIHtcbiAgICAgICAgICBpZihldmVudC5kYXRhLnR5cGUgJiYgZXZlbnQuZGF0YS50eXBlID09IFwiZGF0YS1vbi1zdWJtaXRcIikge1xuICAgICAgICAgICAgbGV0IG1ldGFkYXRhID0gZXZlbnQuZGF0YS5kYXRhO1xuICAgICAgICAgICAgbWV0YWRhdGFbXCJjb2x1bW5fbWFwcGluZ3NcIl0gPSBldmVudC5kYXRhLmNvbHVtbl9tYXBwaW5nO1xuICAgICAgICAgICAgLy8gdGhpcy5jYWxsYmFjayh0cnVlLCBtZXRhZGF0YSk7XG4gICAgICAgICAgICBkZWxldGUgbWV0YWRhdGFbXCJ1bmlxdWVfdG9rZW5cIl07XG4gICAgICAgICAgICB0aGlzLm9uU3VibWl0Py4obWV0YWRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoZXZlbnQuZGF0YS50eXBlICYmIGV2ZW50LmRhdGEudHlwZSA9PSBcImRhdGEtcHVzaC1zdGF0dXNcIikge1xuICAgICAgICAgICAgaWYoZXZlbnQuZGF0YS5kYXRhLmltcG9ydF9zdGF0dXMgPT0gXCJzdWNjZXNzXCIpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbGxiYWNrKHRydWUsIGV2ZW50LmRhdGEuZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYoZXZlbnQ/LmRhdGE/LnJvd19kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcmltYXJ5X3Jvd19kYXRhID0gZXZlbnQuZGF0YS5yb3dfZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhlYWRlcnMgPSBldmVudC5kYXRhLmhlYWRlcnM7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb3dzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGxldCBkeW5hbWljX2NvbHVtbnNfaW5kZXhlcyA9IGV2ZW50LmRhdGEuZHluYW1pY0NvbHVtbnNJbmRleGVzO1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X3Jvd19kYXRhLmZvckVhY2goKHJvd19kYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGR5bmFtaWNfY29sdW1ucyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcm93X2RhdGEuZGF0YS5mb3JFYWNoKChjb2wsIGkpPT57XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjb2wgPT0gdW5kZWZpbmVkKXsgY29sID0gXCJcIn07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihkeW5hbWljX2NvbHVtbnNfaW5kZXhlcy5pbmNsdWRlcyhpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeW5hbWljX2NvbHVtbnNbaGVhZGVyc1tpXV0gPSBjb2w7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhbaGVhZGVyc1tpXV0gPSBjb2w7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyb3dfZGF0YT8udW5tYXBwZWRfZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhbXCJfdW5tYXBwZWRfZGF0YVwiXSA9IHJvd19kYXRhLnVubWFwcGVkX2RhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkeW5hbWljX2NvbHVtbnMgJiYgT2JqZWN0LmtleXMoZHluYW1pY19jb2x1bW5zKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeFtcIl9keW5hbWljX2RhdGFcIl0gPSBkeW5hbWljX2NvbHVtbnM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2goeCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWV0YWRhdGEgPSBldmVudC5kYXRhLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhW1wicm93c1wiXSA9IHJvd3M7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXRhZGF0YVtcInVuaXF1ZV90b2tlblwiXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkltcG9ydCh0cnVlLCBtZXRhZGF0YSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXRhZGF0YSA9IGV2ZW50LmRhdGEuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1ldGFkYXRhW1widW5pcXVlX3Rva2VuXCJdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uSW1wb3J0KHRydWUsIG1ldGFkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG1ldGFkYXRhID0gZXZlbnQuZGF0YS5kYXRhO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXRhZGF0YVtcInVuaXF1ZV90b2tlblwiXTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uSW1wb3J0KGZhbHNlLCBtZXRhZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBmYWxzZSk7XG5cbiAgICBsZXQgaWZyYW1lID0gdGhpcy5pZnJhbWUubmF0aXZlRWxlbWVudDtcbiAgICAvLyBsZXQgdXNlciA9IHRoaXMudXNlcjtcbiAgICAvLyBsZXQgZHluYW1pY0NvbHVtbnMgPSB0aGlzLmR5bmFtaWNDb2x1bW5zO1xuICAgIC8vIGxldCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIC8vIGxldCB1dWlkID0gdGhpcy51dWlkO1xuXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYoc2VsZi5kZWJ1Z01vZGUpIHsgY29uc29sZS5sb2coYFtDc3Zib3gtJHtzZWxmLnV1aWR9XWAsXCJpZnJhbWUgbG9hZGVkXCIpOyB9XG5cbiAgICAgIHNlbGYub25SZWFkeT8uKCk7XG5cbiAgICAgIHNlbGYuZW5hYmxlSW5pdGF0b3IoKTtcblxuICAgICAgaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICBcImN1c3RvbWVyXCIgOiBzZWxmLnVzZXIgPyBzZWxmLnVzZXIgOiBudWxsLFxuICAgICAgICBcImNvbHVtbnNcIiA6IHNlbGYuZHluYW1pY0NvbHVtbnMgPyBzZWxmLmR5bmFtaWNDb2x1bW5zIDogbnVsbCxcbiAgICAgICAgXCJvcHRpb25zXCIgOiBzZWxmLm9wdGlvbnMgPyBzZWxmLm9wdGlvbnMgOiBudWxsLFxuICAgICAgICBcInVuaXF1ZV90b2tlblwiOiBzZWxmLnV1aWRcbiAgICAgIH0sIFwiKlwiKTtcblxuICAgIH1cbiAgfVxuICBlbmFibGVJbml0YXRvcigpe1xuICAgIGxldCBpbml0YXRvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWNzdmJveC1pbml0YXRvcl1bZGF0YS1jc3Zib3gtdG9rZW49XCIke3RoaXMudXVpZH1cIl1gKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICBpZihpbml0YXRvciAmJiBpbml0YXRvci5kaXNhYmxlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpbml0YXRvci5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBvcGVuTW9kYWwoKTogdm9pZCB7XG4gICAgaWYoIXRoaXMuaXNNb2RhbFNob3duKSB7XG4gICAgICB0aGlzLmlzTW9kYWxTaG93biA9IHRydWU7XG4gICAgICB0aGlzLmlmcmFtZS5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoJ29wZW5Nb2RhbCcsICcqJyk7XG4gICAgICB0aGlzLmhvbGRlci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIH1cbiAgfVxufVxuIl19