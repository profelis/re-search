# re-search plugin

Preprocess search query be given patterns.

# Pattern examples

```json5
"re-search.patterns": [
	{
		// replace any `*` with regexp `.*` and activate regexp search
		"*": {
			"replacement": ".*",
			"isRegex": true, // activate regexp search
			"isCaseSensitive": false,
			"matchWholeWord": false,
		}
	},
	{
		// replace xml tag with regexp to match any xml tag with same name
		"/<\/{0,1}([A-Za-z][A-Za-z0-9]*)\/{0,1}>/": { // match with regexp
			"replacement": "<\/{0,1}$1\/{0,1}>",
			"isRegex": true,
			"stopMatching": true
		}
	}
]
```

# Usage

- Execute command `re-search: Search` (`ctrl-shift-alt-F` by default)
- insert search text
- processed text will be pasted in `Search` panel


![preview](https://raw.githubusercontent.com/profelis/re-search/master/preview.gif)
