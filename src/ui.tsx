import { Button, Columns, Container, Inline, render, Text, TextboxMultiline, VerticalSpace } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import { CloseHandler, CreateChartHandler } from './types'

function Plugin() {
  // States for 
  const [chartData, setChartData] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Submit the chart data to the plugin
  const handleCreateChartButtonClick = useCallback(
    function () {
      if (chartData !== null) {
        setLoading(true)
        emit<CreateChartHandler>('CREATE_CHART', chartData)
      }
    },
    [chartData]
  )
  
  // Close the plugin
  const handleCloseButtonClick = useCallback(
    function () {
      emit<CloseHandler>('CLOSE')
    },
    []
  )

  // Message management
  window.onmessage = async (event) => {
    if (event.data.pluginMessage.type === 'getAvatarURL') {
      const url: string = `https://ogtojsonservice.vercel.app/api?url=https://github.com/${event.data.pluginMessage.alias}`;
      await fetch(url)
        .then((r) => r.json())
        .then((a) => {
          const ogurl: string = a.ogImage.url
          return fetch(ogurl)
            .then((r) => r.arrayBuffer())
            .then((a) => {
              parent.postMessage({ type: "message", pluginMessage: [{ 'layer': event.data.pluginMessage.avatarLayer.id, 'url': url, 'from': 'getAvatarURL', 'img': new Uint8Array(a)}] }, '*')
            })
        })
        .catch((err) => console.error({ err }));
      }
  }

  return (
    <Container>
      <VerticalSpace space="large" />
      <Text bold>JSON – <a href="https://github.com/mamuso/figma-json-orgchart/" target='_blank'>learn more</a></Text>
      <VerticalSpace space="small" />
      <TextboxMultiline
        disabled={loading === true}
        id="chartData"
        rows={20}
        onValueInput={setChartData}
        value={chartData}
      />
      <VerticalSpace space="medium" />
      <Inline space="extraSmall" style='text-align:right'>
        <Button onClick={handleCloseButtonClick} secondary>
          Close
        </Button>
        <Button onClick={handleCreateChartButtonClick}
          loading={loading === true}>
          Create chart
        </Button>
      </Inline>
    </Container>
  )
}

export default render(Plugin)