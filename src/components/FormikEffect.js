import React from 'react';
import { debounce, isEqual } from 'lodash';
import { connect } from 'formik';

class FormikEffect extends React.Component {
  onChange = this.props.onChange && debounce(this.props.onChange, 300);

  componentDidUpdate(prevProps) {
    const { formik } = this.props;
    const { isValid } = formik;
    if (!this.props.onChange) {
      return;
    }
    const hasChanged = !isEqual(prevProps.formik.values, formik.values);
    const shouldCallback = isValid && hasChanged && this.onChange;

    if (shouldCallback) {
      this.onChange(formik.values, prevProps.formik.values);
    }
  }

  // eslint-disable-next-line
  render() {
    return null;
  }
}

export default connect(FormikEffect);
