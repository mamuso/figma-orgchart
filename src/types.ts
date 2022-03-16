import { EventHandler } from '@create-figma-plugin/utilities'

export interface CreateChartHandler extends EventHandler {
  name: 'CREATE_CHART'
  handler: (chartData: string) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}

export type ChartConfig = {
  avatar: boolean
  name: boolean
  alias: boolean
  meta: boolean
  ogurl: string
  color: {
    [key: string]: string
  }
  text: {
    [key: string]: ChartConfigText
  }
}

export type ChartConfigText = {
  family: string
  style: string
  size: number
}
