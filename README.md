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
1. Install python module `send2trash` 
2. Open `CMD` in `buildScripts`
3. Run `python copyPivotPluginToClient.py path_to_plugin_repo origam_repo_path`
   for example: `python copyPivotPluginToClient.py C:\Repos\origam-plugin-pivot-table C:\Repos\origam"`
4. Wait for `DONE!` to be printed in the console