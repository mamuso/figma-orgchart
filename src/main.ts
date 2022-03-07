import { convertHexColorToRgbColor, once, showUI } from '@create-figma-plugin/utilities'
import { CloseHandler, CreateChartHandler } from './types'

/* -------------------------------------------------------------------------
  Default config object
  TODO: create type for config
------------------------------------------------------------------------- */
let config: any = {
  alias: true,
  meta: true,
  ogurl: 'https://github.com/',
  color: {
    border: 'EEECF3',
    background: 'FFFFFF',
    primarytext: '444D56',
    secondarytext: 'FFFFFF',
  },
}

/* -------------------------------------------------------------------------
  Color Variables
  TODO: Make them overridable via config
------------------------------------------------------------------------- */
const fallbackColor = { r: 0, g: 0, b: 0 }
const borderColor = convertHexColorToRgbColor('EEECF3') || fallbackColor
const textColor = convertHexColorToRgbColor('444D56') || fallbackColor
const secondarytextColor = convertHexColorToRgbColor('A1A6AA') || fallbackColor
const backgroundColor = convertHexColorToRgbColor('FFFFFF') || fallbackColor

/* -------------------------------------------------------------------------
  Font Promises
  TODO: Simplify and use fonts that are available out of the box
------------------------------------------------------------------------- */
const allianceregularFont = figma.loadFontAsync({ family: 'Alliance No.1', style: 'Regular' })
const allianceboldFont = figma.loadFontAsync({ family: 'Alliance No.1', style: 'Bold' })
const sfproregularFont = figma.loadFontAsync({ family: 'SF Pro Display', style: 'Regular' })

const signature = Date.now()
let jsonElements: number = 0
let avatarsRequested: number = 0
let cardComonent: ComponentNode
let teamFrame: FrameNode
let teamName: string

/* -------------------------------------------------------------------------
  Card component
  TODO: refactor textboxes
------------------------------------------------------------------------- */
export async function createCardComponent() {
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

  // Create Avatar
  const avatarComponent = figma.createEllipse()
  avatarComponent.name = 'Avatar'
  avatarComponent.resizeWithoutConstraints(40, 40)
  avatarComponent.fills = [{ type: 'SOLID', color: borderColor }]
  avatarComponent.strokes = [{ type: 'SOLID', color: fallbackColor, opacity: 0.12 }]
  avatarComponent.strokeAlign = 'INSIDE'
  avatarComponent.strokeWeight = 1
  cardComponent.appendChild(avatarComponent)

  // Create text frame
  const cardComponentTextFrame = figma.createFrame()
  cardComponentTextFrame.name = 'TextFrame'
  cardComponentTextFrame.resizeWithoutConstraints(200, 74)
  cardComponentTextFrame.layoutMode = 'VERTICAL'
  cardComponent.appendChild(cardComponentTextFrame)

  // Name textbox
  const cardComponentName = figma.createText()
  cardComponentName.name = 'Name'
  cardComponentName.fontName = { family: 'Alliance No.1', style: 'Bold' }
  cardComponentName.lineHeight = { value: 120, unit: 'PERCENT' }
  cardComponentName.fills = [{ type: 'SOLID', color: textColor }]
  cardComponentName.characters = 'Name Surname'
  cardComponentName.fontSize = 16
  cardComponentName.textAlignHorizontal = 'LEFT'
  cardComponentTextFrame.appendChild(cardComponentName)

  // Alias textbox
  const cardComponentAlias = figma.createText()
  cardComponentAlias.name = 'Alias'
  cardComponentAlias.fontName = { family: 'Alliance No.1', style: 'Regular' }
  cardComponentAlias.lineHeight = { value: 120, unit: 'PERCENT' }
  cardComponentAlias.fills = [{ type: 'SOLID', color: textColor }]
  cardComponentAlias.characters = '@Alias'
  cardComponentAlias.fontSize = 12
  cardComponentAlias.textAlignHorizontal = 'LEFT'
  cardComponentTextFrame.appendChild(cardComponentAlias)

  // Create spacer
  const cardComponentSpacer = figma.createFrame()
  cardComponentSpacer.name = 'Spacer'
  cardComponentSpacer.resizeWithoutConstraints(4, 4)
  cardComponentTextFrame.appendChild(cardComponentSpacer)

  // Meta textbox
  const cardComponentMeta = figma.createText()
  cardComponentMeta.name = 'Meta'
  cardComponentMeta.fontName = { family: 'SF Pro Display', style: 'Regular' }
  cardComponentMeta.lineHeight = { value: 120, unit: 'PERCENT' }
  cardComponentMeta.fills = [{ type: 'SOLID', color: secondarytextColor }]
  cardComponentMeta.characters = 'metadata'
  cardComponentMeta.fontSize = 12
  cardComponentMeta.letterSpacing = { value: 0.3, unit: 'PIXELS' }
  cardComponentMeta.textAlignHorizontal = 'LEFT'
  cardComponentTextFrame.appendChild(cardComponentMeta)

  return cardComponent
}

/* -------------------------------------------------------------------------
  Create text box
  TODO: Refactor to use everywhere
------------------------------------------------------------------------- */
export function createTeamTextbox(label: string) {
  const teamTextbox = figma.createText()
  teamTextbox.name = 'Team'
  teamTextbox.fontName = { family: 'Alliance No.1', style: 'Bold' }
  teamTextbox.lineHeight = { value: 120, unit: 'PERCENT' }
  teamTextbox.fills = [{ type: 'SOLID', color: textColor }]
  teamTextbox.characters = label
  teamTextbox.fontSize = 20
  teamTextbox.textAlignHorizontal = 'LEFT'
  teamTextbox.resizeWithoutConstraints(340, 22)
  return teamTextbox
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
  if (jsonElements === 0) {
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
  const nameLayer = textLayers.filter((text) => text.name === 'Name')[0]
  if (nameLayer && name) {
    nameLayer.characters = `${name}`
  }

  // Update Alias
  const aliasLayer = textLayers.filter((text) => text.name === 'Alias')[0]
  if (aliasLayer && alias) {
    aliasLayer.characters = `${alias}`
  }

  // Update meta
  const metaLayer = textLayers.filter((text) => text.name === 'Meta')[0]
  if (metaLayer && meta) {
    metaLayer.characters = `${meta}`
  }

  alias = alias?.replace('@', '')
  if (alias && alias != '') {
    figma.ui.postMessage({ type: 'getAvatarURL', alias, avatarLayer })
    avatarsRequested = avatarsRequested + 1
  }
}

/* -------------------------------------------------------------------------
  Process JSON data
------------------------------------------------------------------------- */
export async function process(key: any, value: any) {
  switch (key) {
    /* ------------------------------------------------------
      Update default config
     ------------------------------------------------------ */
    case 'config':
      if (value.alias && value.alias != config.alias) config.alias = value.alias
      if (value.meta && value.meta != config.meta) config.meta = value.meta
      if (value.ogurl && value.ogurl != config.ogurl) config.ogurl = value.ogurl
      if (value.color) {
        if (value.color.border && value.color.border != config.color.border) config.color.border = value.color.border
        if (value.color.background && value.color.background != config.color.background) config.color.background = value.color.background
        if (value.color.primarytext && value.color.primarytext != config.color.primarytext) config.color.primarytext = value.color.primarytext
        if (value.color.secondarytext && value.color.secondarytext != config.color.secondarytext) config.color.secondarytext = value.color.secondarytext
      }
      break
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
        const teamTextbox = createTeamTextbox(teamFrame.name.replace(`team – ${signature}`, ''))
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
          const sectionBox = createTeamTextbox(`${d.section}`)
          sectionBox.fontSize = 16
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
  jsonElements = jsonElements + 1
}

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

    // Create card component
    cardComonent = await createCardComponent()
    cardComonent.visible = false

    // Parse chart data
    const chartDataObject = JSON.parse(chartData)
    await traverse(chartDataObject)
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
