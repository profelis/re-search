import * as vscode from 'vscode'

interface ExtensionConfig { [index: string]: { isRegex?: boolean, replacement: string, stopMatching?: boolean, isCaseSensitive?: boolean, matchWholeWord?: boolean, filesToInclude?: string, filesToExclude?: string, useExcludeSettingsAndIgnoreFiles?: boolean } }

// https://github.com/microsoft/vscode/blob/master/src/vs/workbench/contrib/searchEditor/browser/searchEditorInput.ts
interface SearchConfiguration {
	query?: string
	filesToInclude?: string
	filesToExclude?: string
	contextLines?: number
	matchWholeWord?: boolean
	isCaseSensitive?: boolean
	isRegex?: boolean
	useExcludeSettingsAndIgnoreFiles?: boolean
	showIncludesExcludes?: boolean
	onlyOpenEditors?: boolean
	triggerSearch?: boolean
	focusResults?: boolean
	// location: 'reuse' | 'new'
	replace?: string
}

let config: ExtensionConfig = {}

function updateConfig() {
	config = vscode.workspace.getConfiguration("re-search").get("patterns", {})
}

export function activate(context: vscode.ExtensionContext) {
	updateConfig()

	vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration("re-search"))
			updateConfig()
	})

	function search(input: string) {
		if (input == undefined)
			return
		let isRegex = false
		let isCaseSensitive = false
		let matchWholeWord = false
		let filesToInclude = null
		let filesToExclude = null
		let useExcludeSettingsAndIgnoreFiles = true
		let searchText = input
		let matched = false;
		for (const it in config) {
			const data = config[it]
			let stop = data.stopMatching ?? false

			let key = it.trim()
			if (key.startsWith("/")) {
				key = key.substr(1, key.endsWith("/") ? key.length - 2 : key.length - 1)
				const reg = new RegExp(key, "g")
				matched = searchText.match(reg) != null
				stop = stop && matched
				searchText = searchText.replace(reg, data.replacement)
			}
			else {
				matched = searchText.indexOf(key) >= 0
				stop = stop && matched
				searchText = searchText.replace(key, data.replacement)
			}

			if (matched) {

				// regex probably shouldn't revert if a previous non-stopping config sets it to true
				isRegex ||= data.isRegex ?? false

				// for all other properties, let the matching entry decide these values
				if (data.hasOwnProperty('isCaseSensitive'))
					isCaseSensitive = data.isCaseSensitive === true
				if (data.hasOwnProperty('matchWholeWord'))
					matchWholeWord = data.matchWholeWord === true
				if (data.hasOwnProperty('useExcludeSettingsAndIgnoreFiles'))
					useExcludeSettingsAndIgnoreFiles = data.useExcludeSettingsAndIgnoreFiles === true

				if (data.hasOwnProperty('filesToInclude'))
					filesToInclude = filesToInclude == null ? data.filesToInclude : filesToInclude + "," + data.filesToInclude
				if (data.hasOwnProperty('filesToExclude'))
					filesToExclude = filesToExclude == null ? data.filesToExclude : filesToExclude + ',' + data.filesToExclude
			}

			if (stop)
				break
		}
		vscode.commands.executeCommand('workbench.action.findInFiles', <SearchConfiguration>{
			query: searchText,
			triggerSearch: true,
			isRegex: isRegex,
			isCaseSensitive: isCaseSensitive,
			matchWholeWord: matchWholeWord,
			filesToInclude: filesToInclude,
			filesToExclude: filesToExclude,
			useExcludeSettingsAndIgnoreFiles: useExcludeSettingsAndIgnoreFiles,
		})
	}

	const searchDisposable = vscode.commands.registerCommand('re-search.search', async () => {
		const selection = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection)
		const input = await vscode.window.showInputBox({ value: selection ?? "", prompt: "Search" })
		if (input != undefined)
			search(input)
	})

	const searchSelectedDisposable = vscode.commands.registerCommand('re-search.searchSelected', async () => {
		const selection = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection)
		if (selection)
			search(selection)
	})

	context.subscriptions.push(searchDisposable)
	context.subscriptions.push(searchSelectedDisposable)
}
