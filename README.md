# Pivot table plugin for Origam
To build the Origam client application with the plugin do the following
1. Make sure you have python 3 installed
2. Go to the Origam repository, folder `origam\plugins`
3. Duplicate the template file `_pluginmanager_config.json`, name the new file `pluginmanager_config.json`
4. Edit the new file `pluginmanager_config.json`, change name of the node **somePlugin** to **PivotTablePlugin**. Fill all parameter values. 
5. Double click `origam\plugins\pluginmanager.py`, select 1 then select 0. All files should be copied
6. Open cmd in `origam\frontend-html`, run `yarn`, and then `yarn build`