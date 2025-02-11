import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const ExternalLinkDecoration = ({ className }) => (
  <svg
    viewBox="0 0 40 40"
    className={cx('icon', 'external-link-decoration', className)}
  >
    <use
      className="external-link-icon-outer"
      xlinkHref="#icon-icon_external_link_arrow"
    />
    <use
      className="external-link-icon"
      xlinkHref="#icon-icon_external_link_arrow"
      transform="scale(0.9,0.9)"
      y="0"
      x="4"
    />
  </svg>
);

ExternalLinkDecoration.displayName = 'IconWithCaution';

ExternalLinkDecoration.propTypes = {
  className: PropTypes.string,
};

export default ExternalLinkDecoration;
