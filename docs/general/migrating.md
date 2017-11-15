# Migrating from Commando
While Commando-Plus is mostly compatible with Commando, there are a few changes you have to apply.
Please also follow the revised [first steps](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/general/first-steps) as there are some additional things you have to be aware of.

## From branch 11.2 or master
- Deprecated: function `CommandMessage.editCode` (following Discord.js)
- Renamed: property `CommandoClient.provider` to `CommandClient.settingsProvider`
- Renamed: function `CommandoClient.setProvider` to `CommandoClient.setSettingsProvider`
- Renamed: class `SettingProvider` to `SettingsProvider`
- Renamed: class `SQLProvider` to `SQLSettingsProvider`
- Note: Some changes have been applied to `SettingsProvider` that might impact you if you've been extending this abstract class for your own settings provider.
  Most of the code that was in `SQLSettingsProvider` can now be found in `SettingsProvider` in order to prevent code duplication for `YAMLSettingsProvider`.
