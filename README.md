# @csvbox/angular

> Angular adapter for csvbox.io

[![NPM](https://img.shields.io/npm/v/@csvbox/angular.svg)](https://www.npmjs.com/package/@csvbox/angular) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Shell

```bash
npm install @csvbox/angular
```

## Import
Add `CSVBoxAngularModule` to your module imports
```ts
import { CSVBoxAngularModule } from "@csvbox/angular";

@NgModule({
  ...
  imports: [
    ...
    CSVBoxAngularModule
  ]
})
```

## Usage

```html
<csvbox-button [licenseKey]="licenseKey" [isImported]="isImported.bind(this)" [user]="user">Import</csvbox-button>
```

## Example

```ts

@Component({
  selector: 'app-root',
  template: `
    <csvbox-button
      [licenseKey]="licenseKey"
      [user]="user"
      [isImported]="isImported.bind(this)">
      Import
    </csvbox-button>
  `
})

export class AppComponent {

  title = 'example';
  licenseKey = 'YOUR_LICENSE_KEY_HERE';
  user = { user_id: 'default123' };

  isImported(result: boolean, data: any) {
    if(result) {
      console.log("Sheet uploaded successfully");
      console.log(data.row_success + " rows uploaded");
    }else{
      console.log("There was some problem uploading the sheet");
    }
  }

}
```

## Events

| Event       | Description                                                               |
| :---------- | :-------------------------------------------------------------------------|
| `isReady`   | Triggers when the importer is initialized and ready for use by the users. |
| `isClosed`   | Triggers when the importer is closed.                                     |
| `isSubmitted`   | Triggers when the user hits the 'Submit' button to upload the validated file. **data** object is available in this event. It contains metadata related to the import.|
| `isImported`   | Triggers when the data is pushed to the destination.<br>Two objects are available in this event:<br>1. result (boolean): It is true when the import is successful and false when the import fails.<br>2. data (object): Contains metadata related to the import.|

## Readme

For usage see the guide here - https://help.csvbox.io/getting-started#2-install-code


## License

MIT © [csvbox-io](https://github.com/csvbox-io)
