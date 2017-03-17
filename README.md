### setup

- add this to package.json `dependencies` in `working/<course>` `"learning-object-actionplan": "git+ssh://git@github.com/phoenix-scitent/learning-object-actionplan.git#latest"` 
- run `npm install`
- create `src/js/actionplans` directory
- create `actionplan_config.js`
- add `import actionplanConfig from './actionplan_config';` to `index.js`

### styles

- action plan question
- running record notes (same notes in all sections)
- per section notes

#### ecmo notes example

> running record notes

- button in navigation partial triggers modal (same for all pages)
