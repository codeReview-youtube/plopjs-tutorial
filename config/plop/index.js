const fs = require('fs');
const prettier = require('prettier');
const glob = require('glob');
const path = require('path');

const STATEFULL = 'STATEFULL';
const FUNCTION = 'FUNCTION';
const STATELESS = 'STATELESS';

const OUTPUT_TARGET = path.resolve(`${__dirname}/../../src/components`);
const CONTAINER_PATH = path.resolve(`${__dirname}/../../src/containers`);
const TEMPLATE_PATH = __dirname;

const getTemplate = type => {
  if ([STATEFULL, STATELESS].includes(type)) {
    return `${TEMPLATE_PATH}/index.js.class.hbs`;
  }
  return `${TEMPLATE_PATH}/index.js.function.hbs`;
};

function findFiles(target, addIndex) {
  const files = [];
  for (let file of glob.sync(`${target}/**/*`, { nodir: true })) {
    files.push(file);
  }

  if (addIndex) {
    files.push(`${OUTPUT_TARGET}/index.js`);
  }

  return files;
}

const format = path =>
  prettier
    .getFileInfo(path)
    .then(({ inferredParser: parser }) =>
      prettier.resolveConfig(`${__dirname}/../../`).then(options => ({
        ...options,
        parser,
        data: fs.readFileSync(path, 'utf-8')
      }))
    )
    .then(({ data, ...options }) =>
      fs.writeFileSync(path, prettier.format(data, options), 'utf-8')
    )
    .then(() => `Formatted ${path}`);

module.exports = function(plop) {
  plop.setGenerator('Component', {
    prompts: [
      {
        name: 'name',
        type: 'input',
        message: 'Name of your Component?'
      },
      {
        name: 'isContainer',
        type: 'confirm',
        message: 'Is it a container? [N]',
        default: false
      },
      {
        name: 'type',
        type: 'list',
        message: 'Which type of component do you want?',
        choices: [
          {
            name: 'Function component',
            value: FUNCTION
          },
          {
            name: 'STATELESS component',
            value: STATELESS
          },
          {
            name: 'STATEFULL component',
            value: STATEFULL
          }
        ]
      },
      {
        name: 'pure',
        type: 'confirm',
        message: 'Do you want your component to be pure?',
        default: false,
        when: ({ type }) => [STATELESS, STATEFULL].includes(type)
      },
      {
        name: 'appendIndex',
        type: 'confirm',
        message: 'Add an export to your index.js?',
        default: true
      },
      {
        name: 'options',
        type: 'checkbox',
        message: 'What do you want to include?',
        default: ['style'],
        choices: [
          {
            value: 'style',
            name: 'A style component'
          },
          {
            name: 'A test file',
            value: 'test'
          },
          {
            name: 'A styleguidist',
            value: 'readme'
          }
        ]
      }
    ],
    actions: ({ name, type, pure, options, appendIndex, isContainer }) => {
      const actions = [];
      const TARGET = `${OUTPUT_TARGET}/${name}`;
      // container
      if (isContainer) {
        actions.push({
          type: 'add',
          path: `${CONTAINER_PATH}/${name}Container.js`,
          templateFile: `${TEMPLATE_PATH}/container.js.class.hbs`,
          data: {
            superClass: pure & 'PureComponent' || 'Component'
          }
        });
      }
      // component
      if (!isContainer) {
        actions.push({
          type: 'add',
          path: `${TARGET}/index.js`,
          templateFile: getTemplate(type),
          data: {
            style: options.includes('style'),
            superClass: pure & 'PureComponent' || 'Component',
            hasState: type === STATEFULL
          }
        });

        // appendIndex
        if (appendIndex) {
          actions.push({
            type: 'append',
            path: `${OUTPUT_TARGET}/index.js`,
            template: "export { default as {{name}} } from './{{name}}';"
          });
        }
        // add styles file
        if (options.includes('style')) {
          actions.push({
            type: 'add',
            path: `${TARGET}/${name}.style.scss`,
            templateFile: `${TEMPLATE_PATH}/style.module.scss.hbs`
          });
        }

        // add styleguide readme
        if (options.includes('readme')) {
          actions.push({
            type: 'add',
            path: `${TARGET}/Readme.md`,
            templateFile: `${TEMPLATE_PATH}/readme.md.hbs`
          });
        }

        // add test file
        if (options.includes('test')) {
          actions.push({
            type: 'add',
            // my convention for test files
            path: `${TARGET}/${name}.test.js`,
            templateFile: `${TEMPLATE_PATH}/test.js.hbs`
          });
        }

        actions.push(() => {
          const files = findFiles(TARGET, appendIndex);

          for (let file of files) {
            actions.push(() => format(file));
          }

          return `Found ${files.length} to format`;
        });
      }

      return actions;
    }
  });
};
