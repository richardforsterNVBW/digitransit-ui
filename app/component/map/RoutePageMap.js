/* eslint-disable no-underscore-dangle */
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import MapWithTracking from './MapWithTracking';
import RouteLine from './route/RouteLine';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import { getStartTime } from '../../util/timeUtils';
import withBreakpoint from '../../util/withBreakpoint';
import BackButton from '../BackButton';
import { isActiveDate } from '../../util/patternUtils';
import { mapLayerShape } from '../../store/MapLayerStore';
import { boundWithMinimumArea } from '../../util/geo-utils';

class RoutePageMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trackVehicle: !!this.props.match.params.tripId,
    };
  }

  static propTypes = {
    match: matchShape.isRequired,
    pattern: PropTypes.object.isRequired,
    lat: PropTypes.number,
    lon: PropTypes.number,
    breakpoint: PropTypes.string.isRequired,
    mapLayers: mapLayerShape.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.match.params.tripId !== prevState.tripId) {
      return {
        trackVehicle: !!nextProps.match.params.tripId,
        tripId: nextProps.match.params.tripId,
      };
    }
    return null;
  }

  stopTracking = () => {
    this.setState({ trackVehicle: false });
  };

  render() {
    const { pattern, lat, lon, match, breakpoint, mapLayers } = this.props;
    if (!pattern) {
      return false;
    }
    const { tripId } = match.params;
    const mwtProps = {};
    if (tripId && lat && lon) {
      if (this.state.trackVehicle) {
        mwtProps.lat = lat;
        mwtProps.lon = lon;
        this.lat = lat;
        this.lon = lon;
      } else {
        mwtProps.lat = this.lat;
        mwtProps.lon = this.lon;
      }
      mwtProps.zoom = 16;
    } else {
      if (this.code !== pattern.code || !this.bounds) {
        let filteredPoints;
        if (pattern.geometry) {
          filteredPoints = pattern.geometry.filter(
            point => point.lat !== null && point.lon !== null,
          );
        }
        this.bounds = boundWithMinimumArea(
          (filteredPoints || pattern.stops).map(p => [p.lat, p.lon]),
        );
        this.code = pattern.code;
      }
      mwtProps.bounds = this.bounds;
    }

    let tripStart;
    // BUG ??  tripStar prop is never set
    const leafletObjs = [<RouteLine key="line" pattern={pattern} />];
    if (isActiveDate(pattern)) {
      leafletObjs.push(
        <VehicleMarkerContainer
          key="vehicles"
          direction={pattern.directionId}
          pattern={pattern.code}
          headsign={pattern.headsign}
          tripStart={tripStart}
        />,
      );
    }

    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    return (
      <MapWithTracking
        {...mwtProps}
        className="full"
        leafletObjs={leafletObjs}
        mapLayers={mapLayers}
        onStartNavigation={this.stopTracking}
      >
        {breakpoint !== 'large' && (
          <React.Fragment>
            <BackButton
              icon="icon-icon_arrow-collapse--left"
              iconClassName="arrow-icon"
            />
          </React.Fragment>
        )}
      </MapWithTracking>
    );
  }
}

const RoutePageMapWithVehicles = connectToStores(
  withBreakpoint(RoutePageMap),
  ['RealTimeInformationStore', 'MapLayerStore'],
  ({ getStore }, { trip }) => {
    const mapLayers = getStore('MapLayerStore').getMapLayers({
      notThese: ['stop', 'citybike', 'vehicles'],
    });
    if (trip) {
      const { vehicles } = getStore('RealTimeInformationStore');
      const tripStart = getStartTime(
        trip.stoptimesForDate[0].scheduledDeparture,
      );
      const matchingVehicles = Object.keys(vehicles)
        .map(key => vehicles[key])
        .filter(
          vehicle =>
            vehicle.tripStartTime === undefined ||
            vehicle.tripStartTime === tripStart,
        )
        .filter(
          vehicle =>
            vehicle.tripId === undefined || vehicle.tripId === trip.gtfsId,
        )
        .filter(
          vehicle =>
            vehicle.direction === undefined ||
            vehicle.direction === Number(trip.directionId),
        );

      if (matchingVehicles.length !== 1) {
        // no matching vehicles or cant distinguish between vehicles
        return { mapLayers };
      }
      const selectedVehicle = matchingVehicles[0];
      return {
        lat: selectedVehicle.lat,
        lon: selectedVehicle.long,
        mapLayers,
      };
    }
    return { mapLayers };
  },
);

export default createFragmentContainer(RoutePageMapWithVehicles, {
  pattern: graphql`
    fragment RoutePageMap_pattern on Pattern {
      code
      directionId
      headsign
      geometry {
        lat
        lon
      }
      stops {
        lat
        lon
        name
        gtfsId
        ...StopCardHeaderContainer_stop
      }
      activeDates: trips {
        day: activeDates
      }
      ...RouteLine_pattern
    }
  `,
  trip: graphql`
    fragment RoutePageMap_trip on Trip {
      stoptimesForDate {
        scheduledDeparture
      }
      gtfsId
      directionId
    }
  `,
});
