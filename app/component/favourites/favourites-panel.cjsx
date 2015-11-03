React                           = require 'react'
Relay                           = require 'react-relay'
NoFavouritesPanel               = require './no-favourites-panel'
FavouriteStopCardListContainer  = require './favourite-stop-card-list-container'
FavouriteRouteListContainer     = require './favourite-route-list-container'
queries                         = require '../../queries'

class FavouritesPanel extends React.Component

 constructor: ->
    super
    @state = {
      "useSpinner": true
    }


  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  getFavouriteStopContainer: (ids) =>
    <Relay.RootContainer
      key="fav-stops"
      Component={FavouriteStopCardListContainer}
      route={new queries.FavouriteStopListContainerRoute
        ids: ids
      }
      renderLoading={=> if(@state.useSpinner == true) then <div className="spinner-loader"/> else null}
      }
    />

  getFavouriteRouteListContainer: (ids) =>
    <Relay.RootContainer
      key="fav-routes"
      Component={FavouriteRouteListContainer}
      route={new queries.FavouriteRouteRowRoute
        ids: ids
      }
      renderLoading={=> if(@state.useSpinner == true) then <div className="spinner-loader"/> else null}
      }
    />

  componentDidMount: ->
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onChange
    @setState({"useSpinner": false})

  componentWillUnmount: ->
    @context.getStore('FavouriteRoutesStore').removeChangeListener @onChange
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onChange

  onChange: (id) =>
    @forceUpdate()

  render: ->
    FavouriteStopsStore = @context.getStore 'FavouriteStopsStore'
    FavouriteRoutesStore = @context.getStore 'FavouriteRoutesStore'

    if FavouriteStopsStore.getStops().concat(FavouriteRoutesStore.getRoutes()).length == 0
      <NoFavouritesPanel/>
    else
      <div>
        {@getFavouriteStopContainer FavouriteStopsStore.getStops()}
        {@getFavouriteRouteListContainer FavouriteRoutesStore.getRoutes()}
      </div>




module.exports = FavouritesPanel
