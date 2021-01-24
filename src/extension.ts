import * as vscode from 'vscode'

interface ExtensionConfig { [index: string]: { isRegex?: boolean, replacement: string, stopMatching?: boolean, isCaseSensitive?: boolean, matchWholeWord?: boolean } }

interface IFindInFilesArgs {
	query?: string;
	replace?: string;
	triggerSearch?: boolean;
	filesToInclude?: string;
	filesToExclude?: string;
	isRegex?: boolean;
	isCaseSensitive?: boolean;
	matchWholeWord?: boolean;
}

export function activate(context: vscode.ExtensionContext) {
	const config: ExtensionConfig = vscode.workspace.getConfiguration("re-search").get("patterns", {})

	const disposable = vscode.commands.registerCommand('re-search.search', async () => {
		const selection = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection)
		const input = await vscode.window.showInputBox({ value: selection ?? "" })

		if (input == undefined)
			return
		let isRegex = false
		let isCaseSensitive = false
		let matchWholeWord = false
		let searchText = input
		for (const it in config) {
			const data = config[it]
			isRegex ||= data.isRegex ?? false
			isCaseSensitive ||= data.isCaseSensitive ?? false
			matchWholeWord ||= data.matchWholeWord ?? false
			let stop = data.stopMatching ?? false
			let key = it.trim()
			if (key.startsWith("/")) {
				key = key.substr(1, key.endsWith("/") ? key.length - 2 : key.length - 1)
				const reg = new RegExp(key, "g")
				stop = stop && searchText.match(reg) != null
				searchText = searchText.replace(reg, data.replacement)
			}
			else {
				stop = stop && searchText.indexOf(key) >= 0
				searchText = searchText.replace(key, data.replacement)
			}
			if (stop)
				break
		}
		vscode.commands.executeCommand('workbench.action.findInFiles', <IFindInFilesArgs>{
			query: searchText,
			triggerSearch: true,
			isRegex: isRegex,
			isCaseSensitive: isCaseSensitive,
			matchWholeWord: matchWholeWord,
		})
	})

	context.subscriptions.push(disposable)
}
