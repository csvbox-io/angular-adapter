import * as i0 from '@angular/core';
import { Component, ViewChild, Input, NgModule } from '@angular/core';
import * as i1 from '@angular/platform-browser';

class CSVBoxButtonComponent {
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

class CSVBoxAngularModule {
}
CSVBoxAngularModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0, type: CSVBoxAngularModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CSVBoxAngularModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0, type: CSVBoxAngularModule, declarations: [CSVBoxButtonComponent], exports: [CSVBoxButtonComponent] });
CSVBoxAngularModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0, type: CSVBoxAngularModule, imports: [[]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0, type: CSVBoxAngularModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        CSVBoxButtonComponent
                    ],
                    imports: [],
                    exports: [
                        CSVBoxButtonComponent
                    ]
                }]
        }] });

/*
 * Public API Surface of angular-adapter
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CSVBoxAngularModule, CSVBoxButtonComponent };
//# sourceMappingURL=angular-dummy.js.map
