import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Autosuggest from 'react-autosuggest';
import isEqual from 'lodash/isEqual';
import { executeSearch, getAllEndpointLayers } from '../util/searchUtils';
import SuggestionItem from './SuggestionItem';
import { getLabel } from '../util/suggestionUtils';
import { dtLocationShape } from '../util/shapes';

class DTAutosuggest extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    selectedFunction: PropTypes.func,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string,
    autoFocus: PropTypes.bool,
    searchType: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    renderPostInput: PropTypes.node,
    refPoint: dtLocationShape.isRequired,
    layers: PropTypes.array.isRequired,
  };

  static defaultProps = {
    placeholder: '',
    clickFunction: () => {},
    autoFocus: false,
    postInput: null,
    id: 1,
  };

  constructor(props) {
    super(props);

    this.state = {
      doNotShowLinkToStop: !isEqual(props.layers, getAllEndpointLayers()),
      value: props.value,
      suggestions: [],
    };
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.value !== this.state.value) {
      this.setState({ value: nextProps.value });
    }
  };

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  getSuggestionValue = suggestion => {
    const value = getLabel(suggestion.properties, true);
    return value;
  };

  fetchFunction = ({ value }) => {
    executeSearch(
      this.context.getStore,
      this.props.refPoint,
      {
        layers: this.props.layers,
        input: value,
        type: this.props.searchType,
        config: this.context.config,
      },
      result => {
        if (result == null) {
          return;
        }
        const [res1, res2] = result;

        let suggestions = [];
        if (res2 && res2.results) {
          suggestions = suggestions.concat(res2.results);
        }
        if (res1 && res1.results) {
          suggestions = suggestions.concat(res1.results);
        }
        // XXX translates current location
        suggestions = suggestions.map(suggestion => {
          if (suggestion.type === 'CurrentLocation') {
            const translated = { ...suggestion };
            translated.properties.labelId = this.context.intl.formatMessage({
              id: suggestion.properties.labelId,
              defaultMessage: 'Own Location',
            });
            return translated;
          }
          return suggestion;
        });
        this.setState({
          suggestions,
        });
      },
    );
  };

  renderItem = item => (
    <SuggestionItem
      doNotShowLinkToStop={this.state.doNotShowLinkToStop}
      ref={item.name}
      item={item}
      useTransportIconsconfig={
        this.context.config.search.suggestions.useTransportIcons
      }
    />
  );

  render = () => {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: this.context.intl.formatMessage({
        id: this.props.placeholder,
        defaultMessage: 'TODO',
      }),
      value,
      onChange: this.onChange,
      autoFocus: this.props.autoFocus,
      className: `react-autosuggest__input ${this.props.className}`,
    };

    return (
      <Autosuggest
        id={this.props.id}
        shouldRenderSuggestions={() => true}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.fetchFunction}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderItem}
        inputProps={inputProps}
        renderInputComponent={p => (
          <div style={{ position: 'relative', display: 'flex' }}>
            <input {...p} />
            {this.props.renderPostInput}
          </div>
        )}
        onSuggestionSelected={this.props.selectedFunction}
        highlightFirstSuggestion
      />
    );
  };
}

export default DTAutosuggest;
