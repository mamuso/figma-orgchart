import { convertHexColorToRgbColor, once, showUI } from '@create-figma-plugin/utilities'
import { ChartConfig, CloseHandler, CreateChartHandler } from './types'

/** -------------------------------------------------------------------------
 * Variables
 * ------------------------------------------------------------------------- */

/**
 * config: Default config object
 * TODO: declare type for config
 */
let config: ChartConfig = {
  avatar: true,
  name: true,
  alias: true,
  meta: true,
  ogurl: 'https://github.com/',
  color: {
    border: 'EEECF3',
    background: 'FFFFFF',
    primarytext: '444D56',
    secondarytext: 'A1A6AA',
  },
  text: {
    team: { family: 'Helvetica Neue', style: 'Bold', size: 20 },
    name: { family: 'Helvetica Neue', style: 'Bold', size: 16 },
    alias: { family: 'Helvetica Neue', style: 'Regular', size: 12 },
    meta: { family: 'Helvetica Neue', style: 'Regular', size: 12 },
  },
}

/**
 * Declaring global color variables
 */
const fallbackColor: RGB = { r: 0, g: 0, b: 0 }
let borderColor: RGB
let primarytextColor: RGB
let secondarytextColor: RGB
let backgroundColor: RGB

/**
 * Declaring global font promise variables
 */
let nameFont: Promise<void>
let aliasFont: Promise<void>
let metaFont: Promise<void>
let teamFont: Promise<void>

/**
 * Utility variables
 */
const signature = Date.now()
let baseFrame: boolean = false
let avatarsRequested: number = 0
let cardComonent: ComponentNode
let teamFrame: FrameNode
let teamName: string

/** -------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Merges the default config object with the object passed as a parameter.
 * Sets up the color coniguration and the font promises.
 *
 * @param configuration - A config object
 * @returns The config object
 */
export function setConfiguration(configuration: ChartConfig) {
  // Merge objects
  config = {
    ...config,
    ...configuration,
    color: {
      ...config.color,
      ...configuration.color,
    },
    text: {
      ...config.text,
      ...configuration.text,
    },
  }

  // Set up colors
  borderColor = convertHexColorToRgbColor(config.color.border) || fallbackColor
  primarytextColor = convertHexColorToRgbColor(config.color.primarytext) || fallbackColor
  secondarytextColor = convertHexColorToRgbColor(config.color.secondarytext) || fallbackColor
  backgroundColor = convertHexColorToRgbColor(config.color.background) || fallbackColor

  // Load fonts
  nameFont = figma.loadFontAsync({ family: config.text.name.family, style: config.text.name.style })
  aliasFont = figma.loadFontAsync({ family: config.text.alias.family, style: config.text.alias.style })
  metaFont = figma.loadFontAsync({ family: config.text.meta.family, style: config.text.meta.style })
  teamFont = figma.loadFontAsync({ family: config.text.team.family, style: config.text.team.style })
  return config
}

/**
 * Generates the card component that we will use to clone later.
 *
 * @returns The card as a ComponentNode
 */
export async function createCardComponent() {
  // All fonts must be loaded before we can create the component
  const card = await Promise.all([nameFont, aliasFont, metaFont, teamFont]).then(() => {
    // Create the card component frame
    const cardComponent = figma.createComponent()
    cardComponent.name = 'Card'
    cardComponent.fills = [{ type: 'SOLID', color: backgroundColor }]
    cardComponent.strokes = [{ type: 'SOLID', color: borderColor }]
    cardComponent.strokeAlign = 'INSIDE'
    cardComponent.strokeWeight = 2
    cardComponent.cornerRadius = 8
    cardComponent.resizeWithoutConstraints(280, 74)
    cardComponent.layoutMode = 'HORIZONTAL'
    cardComponent.layoutGrow = 0
    cardComponent.counterAxisAlignItems = 'CENTER'
    cardComponent.itemSpacing = 16
    cardComponent.paddingTop = 12
    cardComponent.paddingRight = 20
    cardComponent.paddingBottom = 12
    cardComponent.paddingLeft = 20

    // Create Avatar if enabled
    if (config.avatar) {
      const avatarComponent = figma.createEllipse()
      avatarComponent.name = 'Avatar'
      avatarComponent.resizeWithoutConstraints(40, 40)
      avatarComponent.fills = [{ type: 'SOLID', color: borderColor }]
      avatarComponent.strokes = [{ type: 'SOLID', color: fallbackColor, opacity: 0.12 }]
      avatarComponent.strokeAlign = 'INSIDE'
      avatarComponent.strokeWeight = 1
      cardComponent.appendChild(avatarComponent)
    }

    // Create text frame
    const cardComponentTextFrame = figma.createFrame()
    cardComponentTextFrame.name = 'TextFrame'
    cardComponentTextFrame.resizeWithoutConstraints(200, 74)
    cardComponentTextFrame.layoutMode = 'VERTICAL'
    cardComponentTextFrame.fills = []
    cardComponent.appendChild(cardComponentTextFrame)

    // Create name textbox if enabled
    if (config.name) {
      const cardComponentName = createTextbox('Name', 'Name', config.text.name.family, config.text.name.style, config.text.name.size, primarytextColor)
      cardComponentTextFrame.appendChild(cardComponentName)
    }

    // Create alias textbox and spacer if alias is enabled
    if (config.alias) {
      const cardComponentAlias = createTextbox('@alias', 'Alias', config.text.alias.family, config.text.alias.style, config.text.alias.size, primarytextColor)
      cardComponentTextFrame.appendChild(cardComponentAlias)

      // Create spacer
      const cardComponentSpacer = figma.createFrame()
      cardComponentSpacer.name = 'Spacer'
      cardComponentSpacer.resizeWithoutConstraints(4, 4)
      cardComponentSpacer.fills = []
      cardComponentTextFrame.appendChild(cardComponentSpacer)
    }

    // Create meta textbox if enabled
    if (config.meta) {
      const cardComponentMeta = createTextbox('Meta', 'Meta', config.text.meta.family, config.text.meta.style, config.text.meta.size, secondarytextColor)
      cardComponentMeta.letterSpacing = { value: 0.3, unit: 'PIXELS' }
      cardComponentTextFrame.appendChild(cardComponentMeta)
    }
    return cardComponent
  })
  return card
}

/**
 * Creates a text box object with the content and the style we define. This method has way too many parameters, but it
 * helps to keep the code clean.
 *
 * @param label - The content of the text box
 * @param name - Name of the font
 * @param fontFamily - Font family that you want to use for the text. It should exist in Figma
 * @param fontStyle - Variation of the font family. It should exist in Figma
 * @param fontSize - Font size
 * @param color - Color of the text
 * @returns A text box object as TextNode
 */
export function createTextbox(label: string, name: string, fontFamily: string, fontStyle: string, fontSize: number, color: RGB): TextNode {
  const textbox = figma.createText()
  textbox.name = name
  textbox.fontName = { family: fontFamily, style: fontStyle }
  textbox.lineHeight = { value: 120, unit: 'PERCENT' }
  textbox.fills = [{ type: 'SOLID', color: color }]
  textbox.characters = label
  textbox.fontSize = fontSize
  textbox.textAlignHorizontal = 'LEFT'
  return textbox
}

/* -------------------------------------------------------------------------
  Return fill from Uint8Array
  TODO: rewrite to use more descriptive variables
------------------------------------------------------------------------- */
export function getImageBytesFromArray(data: Uint8Array): ImagePaint[] {
  let imageHash = figma.createImage(new Uint8Array(data)).hash
  const newFill: ImagePaint = {
    type: 'IMAGE',
    filters: {
      contrast: 0,
      exposure: 0,
      highlights: 0,
      saturation: 0,
      shadows: 0,
      temperature: 0,
      tint: 0,
    },
    imageHash,
    imageTransform: [
      [1, 0, 0],
      [0, 1, 0],
    ],
    opacity: 1,
    scaleMode: 'FILL',
    scalingFactor: 0.5,
    visible: true,
  }

  return [newFill]
}

/* -------------------------------------------------------------------------
  Set Background fil
  TODO: This method made sense when I added it, but is a bridge.
  Can we remove it?
------------------------------------------------------------------------- */
export async function setBackgroundFillFromImageArray(layer: EllipseNode | RectangleNode, data: Uint8Array) {
  layer.fills = getImageBytesFromArray(data)
}

/* -------------------------------------------------------------------------
  Create Frame for teams
------------------------------------------------------------------------- */
export function createTeamFrame(teamName: string, key: string) {
  const frame = figma.createFrame()
  frame.layoutMode = key === 'teams' ? 'HORIZONTAL' : 'VERTICAL'
  frame.name = teamName
  frame.itemSpacing = key === 'teams' ? 80 : 16
  frame.primaryAxisSizingMode = 'AUTO'
  frame.counterAxisSizingMode = 'AUTO'
  frame.primaryAxisAlignItems = 'MIN'
  frame.counterAxisAlignItems = key === 'teams' ? 'MIN' : 'CENTER'
  frame.paddingTop = 16
  frame.paddingBottom = 32
  if (!baseFrame) {
    frame.paddingTop = 80
    frame.paddingBottom = 80
    frame.paddingRight = 100
    frame.paddingLeft = 100
  }
  return frame
}

/* -------------------------------------------------------------------------
  Update (cloned) card
------------------------------------------------------------------------- */
export async function fillCardContent(card: ComponentNode, name: string | undefined | null, alias: string | undefined | null, meta: string | undefined | null) {
  const textLayers: Array<TextNode> = card.findAllWithCriteria({ types: ['TEXT'] })
  const avatarLayer: EllipseNode = card.findAllWithCriteria({ types: ['ELLIPSE'] }).filter((e) => e.name === 'Avatar')[0]

  // Update name
  if (config.name) {
    const nameLayer = textLayers.filter((text) => text.name === 'Name')[0]
    if (nameLayer && name) {
      nameLayer.characters = `${name}`
    }
  }

  // Update Alias
  if (config.alias) {
    const aliasLayer = textLayers.filter((text) => text.name === 'Alias')[0]
    if (aliasLayer && alias) {
      aliasLayer.characters = `${alias}`
    }
  }

  // Update meta
  if (config.meta) {
    const metaLayer = textLayers.filter((text) => text.name === 'Meta')[0]
    if (metaLayer && meta) {
      metaLayer.characters = `${meta}`
    }
  }

  if (config.avatar) {
    alias = alias?.replace('@', '')
    if (alias && alias != '') {
      figma.ui.postMessage({ type: 'getAvatarURL', alias, avatarLayer })
      avatarsRequested = avatarsRequested + 1
    }
  }
}

/* -------------------------------------------------------------------------
  Process JSON data
------------------------------------------------------------------------- */
export async function process(key: any, value: any) {
  switch (key) {
    /* ------------------------------------------------------
     Create layer for each team
     ------------------------------------------------------ */
    case 'team':
    case 'teams':
      // Does the team layer already exist?
      teamName = `${key === 'team' ? value : teamFrame.name.replace(`team – ${signature}`, '')} ${key} – ${signature}`
      let teamLayer: FrameNode = figma.currentPage.findAllWithCriteria({ types: ['FRAME'] }).filter((node) => node.name === `${teamName}`)[0]
      // If it doesn't let's create it!
      if (teamLayer === undefined) {
        teamLayer = createTeamFrame(teamName, key)
        if (teamFrame) teamFrame.appendChild(teamLayer)
        baseFrame = true
      }

      teamFrame = teamLayer

      if (key === 'teams') {
        // Adding a shadow to act as a grouping line
        teamFrame.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.2 }, offset: { x: 0, y: -1 }, radius: 0, visible: true, blendMode: 'MULTIPLY' }]

        // Create all the frames for each team
        value.forEach((e: any) => {
          const subteamLayer = createTeamFrame(`${e.team} team – ${signature}`, 'team')
          teamFrame.appendChild(subteamLayer)
        })
      } else {
        // Create team textbox
        const teamTextbox = createTextbox(teamFrame.name.replace(`team – ${signature}`, ''), 'Team', config.text.team.family, config.text.team.style, config.text.team.size, primarytextColor)
        teamTextbox.resizeWithoutConstraints(340, 18)
        teamLayer.appendChild(teamTextbox)
      }

      break

    /* ------------------------------------------------------
     Create manager entry
     ------------------------------------------------------ */
    case 'manager':
      const manager = cardComonent.clone()
      manager.visible = true
      manager.name = `${value.name}`
      teamFrame.appendChild(manager)
      manager.resize(340, 74)
      // Fill the contents of the card
      fillCardContent(manager, value.name, value.alias, value.meta)
      break

    /* ------------------------------------------------------
     Create designer entry
     ------------------------------------------------------ */
    case 'members':
      value.forEach((d: any) => {
        if (d.section) {
          const sectionBox = createTextbox(`${d.section}`, 'Team', config.text.team.family, config.text.team.style, config.text.team.size, primarytextColor)
          sectionBox.resizeWithoutConstraints(296, 18)
          teamFrame.appendChild(sectionBox)
        } else {
          const designer = cardComonent.clone()
          designer.visible = true
          designer.name = `${d.name}`
          teamFrame.appendChild(designer)
          // Fill the contents of the card
          fillCardContent(designer, d.name, d.alias, d.meta)
        }
      })

      // Align to the right and reduce spacd
      teamFrame.counterAxisAlignItems = 'MAX'
      teamFrame.itemSpacing = 8
      break
  }
}

/* -------------------------------------------------------------------------
  Traverse JSON
------------------------------------------------------------------------- */
export async function traverse(json: any) {
  for (var i in json) {
    process(i, json[i])
    if (json[i] !== null && typeof json[i] == 'object') {
      traverse(json[i])
    }
  }
}

export default async function () {
  /* -------------------------------------------------------------------------
    Create chart
  ------------------------------------------------------------------------- */
  once<CreateChartHandler>('CREATE_CHART', async function (chartData: string) {
    // Handle messages
    figma.ui.on('message', (value) => {
      value = value[0]
      const avatarLayer: EllipseNode = figma.currentPage.findAllWithCriteria({ types: ['ELLIPSE'] }).filter((e) => e.id === value.layer)[0]
      setBackgroundFillFromImageArray(avatarLayer, value.img)
      avatarsRequested = avatarsRequested - 1
      if (avatarsRequested === 0) {
        figma.closePlugin()
      }
    })

    // Parse chart data
    const chartDataObject = JSON.parse(chartData)

    // Read configuration
    setConfiguration(chartDataObject.config)

    // Create card component
    cardComonent = await createCardComponent()
    cardComonent.visible = false

    // Traverse JSON
    await traverse(chartDataObject).then(() => {
      // If we are not going to paint the avatar, let's close the plugin
      if (!config.avatar) figma.closePlugin()
    })
  })

  /* -------------------------------------------------------------------------
    Close Plugin
  ------------------------------------------------------------------------- */
  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })

  /* -------------------------------------------------------------------------
    Show UI window
  ------------------------------------------------------------------------- */
  showUI({
    width: 600,
    height: 440,
  })
}
