import { Button, Container, Inline, render, Text, TextboxMultiline, VerticalSpace } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import { CloseHandler, CreateChartHandler } from './types'
import defaultChartData from "./defaultChartData.yml"

function Plugin() {
  const [chartData, setChartData] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  /* -------------------------------------------------------------------------
  Loading example data from defaultChartData.json
  ------------------------------------------------------------------------- */
// if (chartData == '') setChartData(JSON.stringify(defaultChartData, null, "\t"))
  if (chartData == '') setChartData(defaultChartData)

  /* -------------------------------------------------------------------------
  Submit data chart and kick off the drawing process
  ------------------------------------------------------------------------- */
  const handleCreateChartButtonClick = useCallback(
    function () {
      if (chartData !== null) {
        setIsLoading(true)
        emit<CreateChartHandler>('CREATE_CHART', chartData)
      }
    }, [chartData]
  )

  /* -------------------------------------------------------------------------
  Cancel and close
  ------------------------------------------------------------------------- */
  const handleCloseButtonClick = useCallback(
    function () {
      emit<CloseHandler>('CLOSE')
    }, []
  )

  /* -------------------------------------------------------------------------
  Message management
  ------------------------------------------------------------------------- */
  window.onmessage = async (event) => {
    if (event.data.pluginMessage.type === 'getAvatarURL') {
      if (event.data.pluginMessage.avatar) {
        fetchAvatar(event.data.pluginMessage.avatarLayer.id, event.data.pluginMessage.avatar, event.data.pluginMessage.avatar)
      } else {
        const url: string = `https://ogtojsonservice.vercel.app/api?url=${event.data.pluginMessage.config.ogurl}${event.data.pluginMessage.alias}`;
        fetch(url)
          .then((r) => r.json())
          .then((a) => {
            if (a.ogImage && a.ogImage.url) {
              let ogurl: string = a.ogImage.url
              fetchAvatar(event.data.pluginMessage.avatarLayer.id, url, ogurl)
            } else {
              postMessage(event.data.pluginMessage.avatarLayer.id, '', [])
            }
          })
          .catch((err) => {
            postMessage(event.data.pluginMessage.avatarLayer.id, '', [])
            console.error({ err })
          });
      }
    }
  }

  const fetchAvatar = async (layer: string, url: string, ogurl: string) => {
    fetch(ogurl)
      .then((r) => r.arrayBuffer())
      .then((a) => {
        postMessage(layer, url, new Uint8Array(a))
      })
      .catch((err) => {
        postMessage(layer, '', [])
        console.error({ err })
      });
  }

  const postMessage = (layer: string, url: string, img: ArrayLike<number> | ArrayBufferLike) => {
    parent.postMessage({ type: "message", pluginMessage: [{ 'layer': layer, 'url': url, 'from': 'getAvatarURL', 'img': img }] }, '*')
  }

  return (
    <Container>
      <VerticalSpace space="large" />
      <Text bold>Orgchart JSON or YAML – <a href="https://github.com/mamuso/figma-orgchart/" target='_blank'>Learn more</a></Text>
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
