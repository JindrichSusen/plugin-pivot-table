# Pivot table plugin for Origam
You have two options to build the Origam client with the plugin 
## Manual
1. Copy `plugins/src` to `frontend-html\src\plugins\implementations`
2. Replace `frontend-html\src\plugins\tools\PluginRegistration.ts` with `PluginRegistration.ts`
3. Run this script to copy the missing dependencies to `package.json`:
    ```
   python buildScripts/addDependenciesPivot.py frontend-html\package.json
   ```

## Automatic
1. Open `buildScripts/copyPivotPluginToClient.py` in a text editor
2. Change `path_to_plugin_repo` and `repo_path`
3. Install python module `send2trash` 
3. run `python buildScripts/copyPivotPluginToClient.py`
4. Wait for `DONE!` to be printed in the console