import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Box,
  Tab,
  Tabs,
  Typography
} from '@material-ui/core';
import { emit } from '../../../socket'
import EditCustomField from './EditCustomField';
import FieldList from './FieldList';

export const defaultField = {
  label: 'New Field',
  type: 'Text',
  options: [],
  default: '',
  public: false
}

export const types = [
  { label: 'Text', value: 'Text' },
  { label: 'Paragraph', value: 'Paragraph' },
  { label: 'Link', value: 'Link' },
  { label: 'Dropdown', value: 'Select' },
  { label: 'Member', value: 'Member' },
  { label: 'Checkbox', value: 'Checkbox' },
  { label: 'Multiple Choice', value: 'Radio' },
  { label: 'Date', value: 'Date' },
  { label: 'Time', value: 'Time' },
];

const fieldSets = {
  custom_fields: {
    label: 'Gig Fields',
    description: 'Gig fields are only visible to band members'
  },
  custom_public_fields: {
    label: 'Gig Public Fields',
    description: 'Gig public fields will be published to the public calendar and the public email list'
  },
  custom_rehearsal_fields: {
    label: 'Rehearsal Fields',
    description: ''
  }
};

class ProjectSettings extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editField: null,
      type: 'custom_fields'
    };
  }

  saveProject = type => async (values) => {
    const { currentProject } = this.props;
    await emit('patch', 'projects', currentProject._id, {
      [type]: values
    });
    this.setState({ editField: null });
  }

  renderList() {
    const { type } = this.state;
    return <FieldList
      fields={this.props.currentProject[type] || []}
      editField={editField => this.setState({ editField, type })}
      saveProject={this.saveProject(type)}
      saveLabel={fieldSets[type].label}
    />
  }

  renderEdit() {
    const { editField, type } = this.state;
    const field = (this.props.currentProject[type] || [])[editField] || defaultField;
    return <EditCustomField
      field={{
        ...field,
        options: field.options.join(', ')
      }}
      saveField={this.saveField}
      cancel={() => this.setState({ editField: null })}
    />;
  }

  saveField = (field) => {
    const { editField, type } = this.state;
    const fields = [...(this.props.currentProject[type] || [])];
    fields[editField] = {
      ...field,
      options: field.options && field.options.split(',').map(option => option.trim())
    };
    return this.saveProject(type)(fields)
  }

  render() {
    const { editField, type } = this.state;
    return <div className='custom-fields'>
      <Typography variant="body1" gutterBottom>
        You can add additional fields that allow you to store and display additional information about your gigs and rehearsals
      </Typography>
      <Tabs
        value={this.state.type}
        onChange={(event, type) => this.setState({ type })}
      >
        {
          Object.keys(fieldSets).map(key =>
            <Tab
              key={key}
              value={key}
              label={fieldSets[key].label}
            />
          )
        }
      </Tabs>
      <Box pt={3}>
        <Typography variant="body2" gutterBottom>
          {fieldSets[type].description}
        </Typography>
        {
          editField !== null ?
            this.renderEdit() :
            this.renderList()
        }
      </Box>
    </div>
  }
}

const mapStatetoProps = state => ((({ currentProject }) => ({ currentProject }))(state))

export default connect(mapStatetoProps)(ProjectSettings);
