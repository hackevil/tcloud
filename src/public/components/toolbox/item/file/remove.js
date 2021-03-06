import React from 'react'
import $ from 'jquery'

import ListItem from '../default'
import { CrossIcon } from '../../../image/svg'
import Color from '../../../../color'
import DialogWindow from '../../../dialog/default'
import Notify from '../../../notification'
import Loading from '../../../loading'

export default class RemoveToolboxItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      disabled: this.props.file.locked,
      dialogOpen: false,
      loading: false
    }
  }

  handleClick () {
    this.setState({dialogOpen: true})
  }

  handleAccept () {
    this.setState({
      dialogOpen: false,
      loading: true
    })

    $.ajax({
      method: 'DELETE',
      url: this.props.file.url,
      success: (response) => {
        this.setState({
          loading: false
        })

        this.props.onRemove()

        Notify({
          type: 'info',
          title: `The ${this.props.file.type} have been deleted`,
        })
      }
    }).fail((response) => {
      let text = response.responseJSON.err

      this.setState({
        loading: false
      })

      Notify({
        type: 'error',
        title: `Failed to delete ${this.props.file.type}`,
        content: (
          <p>{text}</p>
        )
      })
    })
  }

  render () {
    return (
      <ListItem
        disabled={this.state.disabled}
        id="remove" text="Remove"
        icon={CrossIcon}
        onClick={() => this.handleClick()} >
        <Loading hidden={!this.state.loading}/>
        <DialogWindow
          open={this.state.dialogOpen}
          title={`Deleting ${this.props.file.type}`}
          onAccept={() => this.handleAccept()}
          footer={true}>
          <p><b>"{this.props.file.name}"</b> will be removed <b>forever</b>.</p>
          <h2>Are you sure ?</h2>
        </DialogWindow>
      </ListItem>
    )
  }
}

RemoveToolboxItem.defaultProps = {
  file: {
    name: 'file',
    type: 'file',
    locked: true,
    downloadCount: 0,
    size: 0,
    childs: [],
    url: '/folder',
    download: null
  },
  onRemove: () => {}
}
