# Migrating from Commando
While Commando-Plus is mostly compatible with Commando, there are a few changes you have to apply.
Please also follow the revised [first steps](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/general/first-steps) as there are some additional things you have to be aware of.

## From branch 11.2 or master
### Client
- Renamed: property `CommandoClient.provider` to `CommandClient.settingsProvider`
- Renamed: function `CommandoClient.setProvider` to `CommandoClient.setSettingsProvider`
- Renamed: class `SettingProvider` to `SettingsProvider`
- Renamed: class `SQLProvider` to `SQLSettingsProvider`
- Note: Some changes have been applied to `SettingsProvider` that might impact you if you've been extending this abstract class for your own settings provider.
  Most of the code that was in `SQLSettingsProvider` can now be found in `SettingsProvider` in order to prevent code duplication for `YAMLSettingsProvider`.

### Commands and messages
- Removed: property `CommandRegistry.commandsPath` (the path is now module-dependent, see `Module.commandsDirectory`)
- Removed: function `CommandRegistry.registerCommandsIn` (implement your own module instead)
- Removed: function `CommandRegistry.registerDefaultGroups` (use `CommandRegistry.registerBuiltInModule` instead)
- Removed: function `CommandRegistry.registerDefaultCommands` (use `CommandRegistry.registerBuiltInModule` instead)
- Deprecated: function `CommandMessage.editCode` (following Discord.js)
- Changed: function `CommandRegistry.resolveCommandPath` has its signature changed to include the module: `(module, group, memberName)`
- Changed: commands and command groups are now contained in modules
- Changed: properies `CommandInfo.description`, `CommandInfo.details` and `ArgumentInfo.prompt` are now localization keys.
  You have to migrate these strings to your custom locales, otherwise they won't work.
