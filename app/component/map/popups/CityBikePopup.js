import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import MarkerPopupBottom from '../MarkerPopupBottom';
import CityBikeContent from '../../CityBikeContent';
import CityBikeCardContainer from '../../CityBikeCardContainer';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';

class CityBikePopup extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static description = (
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <CityBikePopup context="context object here" station={exampleStation}>
          Im content of a citybike card
        </CityBikePopup>
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'CityBikePopup';

  static propTypes = {
    station: PropTypes.object.isRequired,
    locationPopup: PropTypes.string,
    onSelectLocation: PropTypes.func,
  };

  render() {
    return (
      <div className="card citybike">
        <CityBikeCardContainer
          className="card-padding"
          station={this.props.station}
        >
          <CityBikeContent
            lang={this.context.getStore('PreferencesStore').getLanguage()}
            station={this.props.station}
            type={this.props.station.networks[0]}
          />
        </CityBikeCardContainer>
        {(this.props.locationPopup === 'all' ||
          this.props.locationPopup === 'origindestination') && (
          <MarkerPopupBottom
            location={{
              address: this.props.station.name,
              lat: this.props.station.lat,
              lon: this.props.station.lon,
            }}
            locationPopup={this.props.locationPopup}
            onSelectLocation={this.props.onSelectLocation}
          />
        )}
      </div>
    );
  }
}

export default createFragmentContainer(CityBikePopup, {
  station: graphql`
    fragment CityBikePopup_station on BikeRentalStation {
      stationId
      name
      lat
      lon
      bikesAvailable
      spacesAvailable
      state
      networks
    }
  `,
});
