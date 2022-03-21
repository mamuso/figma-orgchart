# Orgchart (a figma plugin)

Create an org chart in Figma from a JSON file.

## Run the plugin locally

TODO: Post the plugin to the Figma community. In the meantime, you can run the plugin locally:

- Clone the repository: `git clone https://github.com/mamuso/figma-orgchart.git`
- Go to the directory: `cd figma-orgchart`
- Install dependencies: `npm i`
- Build the plugin: `npm run watch`
- In the Figma desktop app, open a Figma document, and go to `Plugins > Development > Import plugin from manifest`
- Select the `figma-orgchart/manifest.json` file

If you run the plugin locally, you can edit `src/defautChartData.json` to change the default chart data.

## JSON data

You need to provide a JSON of your team. You can use the following keys:

- `team`: name of the team
- `manager`: will be represented at the top of the team
- `members`: array of members of a team
- `teams`: array of teams
- `section`: it will create a label with the text that you provide

Each manager and member can have the following keys:

- `name`: name of the person
- `alias`: title alias of the person. By default, it will expect a GitHub alias and will try to fill the avatar
- `meta`: additional information that you'll like to provide
- `avatar`: you can override the avatar providing a URL of an image

You can explore an example of JSON [here](https://jsoneditoronline.org/beta/#left=cloud.35c0637679714972b1d6e1db53e6008d).

## Aditional configurations

By default, the plugin assumes the following configuration:

```json
{
  "avatar": true,
  "name": true,
  "alias": true,
  "meta": true,
  "ogurl": "https://github.com/",
  "color": {
    "border": "EEECF3",
    "background": "FFFFFF",
    "primarytext": "444D56",
    "secondarytext": "A1A6AA"
  },
  "text": {
    "label": { "family": "Helvetica Neue", "style": "Bold", "size": 20 },
    "name": { "family": "Helvetica Neue", "style": "Bold", "size": 16 },
    "alias": { "family": "Helvetica Neue", "style": "Regular", "size": 12 },
    "meta": { "family": "Helvetica Neue", "style": "Regular", "size": 12 }
  }
}
```

You can change the default configuration by adding a `config` key to the root of the JSON file. Check some of the examples below to learn how to change the design of the chart.

## Examples

### An org chart with Avatar, Name, Alias, and Meta

- [001-avatar-name-alias-meta-github.json](examples/001-avatar-name-alias-meta-github.json)

![](assets/001-avatar-name-alias-meta-github.png)

### Loading avatars from Twitter

- [002-avatar-name-alias-meta-twitter.json](examples/002-avatar-name-alias-meta-twitter.json)

![](assets/002-avatar-name-alias-meta-twitter.png)

### Hidding Alias and Meta field

- [003-avatar-name-github.json](examples/003-avatar-name-github.json)

![](assets/003-avatar-name-github.png)

### Only shows the name

- [004-name.json](examples/004-name.json)

![](assets/004-name.png)

### Loading avatars from URLs

- [005-custom-avatar.json](examples/005-custom-avatar.json)

![](assets/005-custom-avatar.png)

### Using custom colors

- [006-custom-colors.json](examples/006-custom-colors.json)

![](assets/006-custom-colors.png)

### Using custom fonts

- [007-custom-fonts.json](examples/007-custom-fonts.json)

![](assets/007-custom-fonts.png)

### Sections

- [008-section.json](examples/008-section.json)

![](assets/008-section.png)
