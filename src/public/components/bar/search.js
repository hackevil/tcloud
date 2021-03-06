import React from 'react'
import $ from 'jquery'
import Notify from '../notification'

import Loading from '../loading'
import TextInput from '../input/text'
import Button from '../button/submit'
import Form from '../form/default'
import DialogWindow from '../dialog/default'
import SearchList from '../list/search'
import SearchListItem from '../list/item/search'

import { SearchIcon } from '../image/svg'
import Color from '../../color.js'

export default class SearchBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      input: '',
      status: 'Search', // search or download,
      loading: false,
      dialogOpen: false,
      searchResults: {
        movie: [],
        tv: []
      },
      mobile: false
    }
  }

  componentWillMount () {
    $(window).on('resize', (event) => this.handleWindowResize())
  }

  componentWillUnmount () {
    $(window).off('resize', (event) => this.handleWindowResize())
  }

  handleWindowResize () {
    this.setState({
      mobile: window.innerWidth <= 580
    })
  }

  componentWillUpdate (nextProps, nextState) {
    nextState.status = this.defineStatus(nextState.input)
  }

  defineStatus (value) {
    const magnet = /magnet:.*/
    const torrent = /https?:\/\/.*/
    const specialMagnet = /tcloud:.*/

    return (magnet.test(value) || torrent.test(value)) || specialMagnet.test(value) ? 'Download' : 'Search'
  }

  submit (e) {
    e.preventDefault()
    this.setState({
      input: ''
    })

    switch (this.state.status.toLowerCase()) {
      case 'download':
        this.download(this.state.input)
        break
      case 'search':
      default:
        this.search(this.state.input)
        break
    }
  }

  search (query) {
    this.setState({
      loading: true
    })

    $.ajax({
      method: 'POST',
      url: '/search/torrent',
      data: { query },
      success: (response) => {
        this.setState({
          loading: false,
          dialogOpen: true,
          searchResults: response
        })
      }
    }).fail((response) => {
      let text = response.responseJSON.err

      this.setState({
        loading: false
      })

      Notify({
        type: 'error',
        title: `No torrent found for ${query}`,
        content: (
          <p>{text}</p>
        )
      })
    })
  }

  download (magnet) {
    this.setState({
      loading: true
    })
    $.ajax({
      method: 'PUT',
      url: '/torrent',
      data: { magnet },
      success: (response) => {
        this.setState({
          loading: false
        })

        Notify({
          type: 'info',
          title: 'Torrent will begin shortly',
          content: (<p>It will appear down here</p>)
        })
      }
    }).fail((response) => {
      let text = response.responseJSON.err

      this.setState({
        loading: false
      })

      Notify({
        type: 'error',
        title: 'Failed to download',
        content: (
          <p>{text}</p>
        )
      })
    })
  }

  selectFromSearch (torrent) {
    this.setState({
      input: torrent.magnet,
      dialogOpen: false
    })
  }

  render () {
    var searchItemsMovie = this.state.searchResults.movie.map((torrent, key) => (
      <SearchListItem
        key={key}
        torrent={torrent}
        onClick={(torrent) => this.selectFromSearch(torrent)}
      />))

    var searchItemsTV = this.state.searchResults.tv.map((torrent, key) => (
      <SearchListItem
        key={key}
        torrent={torrent}
        onClick={(torrent) => this.selectFromSearch(torrent)}
      />))

    const formStyle = Object.assign({}, this.props.style, style.div, this.state.mobile ? style.divMobile : {})

    return (
      <Form style={formStyle} onSubmit={(e) => this.submit(e)} className="search-bar">
        <Loading hidden={!this.state.loading}/>
        <TextInput style={style.input}
          value={this.state.input}
          onChange={ (e) => this.setState({input: e.target.value}) }
          placeholder="Search, Torrent or Magnet"/>
        <Button style={style.button} text={this.state.status} disabled={this.state.input.length <= 0} />
        <DialogWindow
          open={this.state.dialogOpen}
          title="Search results"
          onClose={() => this.setState({dialogOpen: false})}>
          <SearchList id="movie">
            {searchItemsMovie}
          </SearchList>
          <SearchList id="tv">
            {searchItemsTV}
          </SearchList>
        </DialogWindow>
      </Form>
    )
  }
}

const style = {
  div: {
    minWidth: '350px'
  },
  divMobile: {
    float: 'left',
    margin: '0 16px'
  },
  input: {
    div: {
      display: 'inline-flex',
      height: '60%'
    }
  },
  button: {
    lineHeight: '0',
    height: '25px',
    margin: '0 20px 0 5px'
  }
}
