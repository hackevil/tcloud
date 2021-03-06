import React from 'react'
import ListItem from '../default'
import { DownloadIcon } from '../../../image/svg'

export default class DownloadToolboxItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      disabled: this.props.file.download === null
    }
  }

  handleClick () {
    window.open(this.props.file.download)
  }

  render () {
    return (
      <ListItem
        disabled={this.state.disabled}
        id="download" text="Download"
        icon={DownloadIcon}
        onClick={() => this.handleClick()}/>
    )
  }
}

DownloadToolboxItem.defaultProps = {
  file: {
    name: 'file',
    type: 'file',
    locked: true,
    downloadCount: 0,
    size: 0,
    childs: [],
    url: '/folder',
    download: null
  }
}
