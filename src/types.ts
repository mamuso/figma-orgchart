import { EventHandler } from '@create-figma-plugin/utilities'

export interface CreateChartHandler extends EventHandler {
  name: 'CREATE_CHART'
  handler: (chartData: string) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}
