import { Button, Container, Inline, render, Text, TextboxMultiline, VerticalSpace } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import { CloseHandler, CreateChartHandler } from './types'
import defaultChartData from './defaultChartData.json'

function Plugin() {
  const [chartData, setChartData] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  /* -------------------------------------------------------------------------
    Loading example data from defaultChartData.json
  ------------------------------------------------------------------------- */
  if (chartData == '') setChartData(JSON.stringify(defaultChartData, null, "\t"))
  
  /* -------------------------------------------------------------------------
    Submit data chart and kick off the drawing process
  ------------------------------------------------------------------------- */
  const handleCreateChartButtonClick = useCallback(
    function () {
      if (chartData !== null) {
        setIsLoading(true)
        emit<CreateChartHandler>('CREATE_CHART', chartData)
      }
    },
    [chartData]
  )
  
  /* -------------------------------------------------------------------------
    Cancel and close
  ------------------------------------------------------------------------- */
  const handleCloseButtonClick = useCallback(
    function () {
      emit<CloseHandler>('CLOSE')
    },
    []
  )

  /* -------------------------------------------------------------------------
    Message management
  ------------------------------------------------------------------------- */
  window.onmessage = async (event) => {
    if (event.data.pluginMessage.type === 'getAvatarURL') {
      const url: string = `https://ogtojsonservice.vercel.app/api?url=${event.data.pluginMessage.config.ogurl}${event.data.pluginMessage.alias}`;
      await fetch(url)
        .then((r) => r.json())
        .then((a) => {
          if (a.ogImage && a.ogImage.url) {
            let ogurl: string = a.ogImage.url
            fetch(ogurl)
              .then((r) => r.arrayBuffer())
              .then((a) => {
                parent.postMessage({ type: "message", pluginMessage: [{ 'layer': event.data.pluginMessage.avatarLayer.id, 'url': url, 'from': 'getAvatarURL', 'img': new Uint8Array(a) }] }, '*')
              })
          } else {
            parent.postMessage({ type: "message", pluginMessage: [{ 'layer': event.data.pluginMessage.avatarLayer.id, 'url': '', 'from': 'getAvatarURL', 'img': '' }] }, '*')
          }
        })
        .catch((err) => {
          parent.postMessage({ type: "message", pluginMessage: [{ 'layer': event.data.pluginMessage.avatarLayer.id, 'url': '', 'from': 'getAvatarURL', 'img': '' }] }, '*')
          console.error({ err })
        });
      }
  }

  return (
    <Container>
      <VerticalSpace space="large" />
      <Text bold>JSON – <a href="https://github.com/mamuso/figma-json-orgchart/" target='_blank'>Learn more</a></Text>
      <VerticalSpace space="small" />
      <TextboxMultiline
        disabled={isLoading === true}
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
          loading={isLoading === true}>
          Create chart
        </Button>
      </Inline>
    </Container>
  )
}

export default render(Plugin)