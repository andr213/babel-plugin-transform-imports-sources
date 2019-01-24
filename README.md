# babel-plugin-transform-imports-sources
babel plugin to transform imports sources

## install
```javascript
    npm i --save-dev git+https://git@github.com/andr213/babel-plugin-transform-imports-sources.git
```

## usage

#### simple usage
.babelrc:
```javascript
{
    "plugins": [
        ["transform-imports-sources", {
            "my-button.scss": { "transform": "mybutton.css" }
        }]
    ],
    "presets": ['@babel/env']
}
```

transforms the code:
```javascript
import "my-button.scss"
```

to:
```javascript
import "my-button.css"
```


#### regular expressions as the transformer

.babelrc:
```javascript
{
    "plugins": [
        ["transform-imports-sources", {
            "(\.*)(\.scss)": { "transform": "${1}.css" }
        }]
    ],
    "presets": ['@babel/env']
}
```

transforms the code:
```javascript
import "styles.scss"
import "other-styles.scss"
```

to:
```javascript
import "styles.css"
import "other-styles.css"
```

#### function as the transformer

.babelrc.js:
```javascript
module.exports = {
    plugins: [
        ['transform-imports-sources', {
            '(\.*)(\.scss)': {
                transform: function(matches) {
                    return `${matches[1]}.css`;
                }
            }
        }]
    ],
    presets: ['@babel/env']
};
```


#### function located in the file as the transformer

.babelrc:
```javascript
{
    "plugins": [
        ["transform-imports-sources", {
            "(\.*)(\.scss)": {
                "transform": "./path/to/transform.js"
            }
        }]
    ],
    presets: ['@babel/env']
}
```

./path/to/transform.js:
``` javascript
module.exports = function(matches) {
    return `${matches[1]}.css`;
};
```

