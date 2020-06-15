# Dataplattform G-Suite Add-on
An editor add-on for Google Spreadsheet and Google Forms to send data to [Dataplattform](https://github.com/knowit/Dataplattform-version2)

## Installation
[G Suite Markedplace](https://gsuite.google.com/marketplace/app/dataplattform/754607022705)

## Development
### Tools
- [node/npm](https://nodejs.org/en/download/)
- [clasp](https://github.com/google/clasp)

### Login with clasp
```
npm install -g @google/clasp
clasp login
```

### Push code to Google App Script
```
npm install
npm run push
```

### Run as add-on
Open Google App Script project
```
clasp open
```
From web UI: `Run > Test as Add-on`

## Publish
### Create a new version
```
# Push latest version of code
npm run push 

clasp version "<some description>"
```

For more infromation on updating published version read:
[Publishing an editor add-on](https://developers.google.com/gsuite/add-ons/how-tos/publishing-editor-addons)