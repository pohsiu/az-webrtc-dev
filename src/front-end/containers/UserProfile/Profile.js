import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Button from 'material-ui/Button';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import Typography from 'material-ui/Typography';
import bgImg from './StockSnap_3FOSIEZDTW.jpg';
import classNames from 'classnames';
import Avatar from 'material-ui/Avatar';
import Centered from '~/components/Layout/Centered';
import IconButton from 'material-ui/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import deepOrange from 'material-ui/colors/deepOrange';
import SuccessButton from '~/components/Buttons/SuccessButton';
import {
  readFile,
} from '~/utils/imageHelpers';

import {
  FormTextInput,
  FormSelect,
  FormAutocomplete,
} from '~/components/SignInSignUp';

import {
  makeMyUserSelector,
} from '~/containers/App/selectors';

import modelMap from '~/containers/App/modelMap';
const {
  patchUser,
} = modelMap.waitableActions;

const styles = (theme) => ({
  mainContainer: {
    width: '100%',
  },
  // media: {
  //   height: 0,
  //   paddingTop: '56.25%', // 16:9
  // },
  card: {
    width: 345,
  },
  media: {
    position: 'relative',
    height: 150,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  avatar: {
    // margin: 10,
  },
  orangeAvatar: {
    // margin: 10,
    color: '#fff',
    backgroundColor: deepOrange[500],
  },
  absolute: {
    position: 'absolute',
  },
  bigAvatar: {
    width: 96,
    height: 96,
  },

  space0: {
    height: 100,
  },

  space1: {
    height: '50%',
  },

  space2: {
    height: 55,
  },

  space3: {
    height: 20,
  },

  avatarContainer: {
    position: 'relative',
    height: '100%',
  },

  editButton: {
    margin: 'auto',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 8,
  },

  editPhoto: {
    color: theme.palette.common.white,
    margin: 'auto',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },

  input: {
    display: 'none',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    objectFit: 'cover',
  },
});

class Profile extends React.Component {
  constructor(...args){
    super(...args);
    this.state = {
      editing: false,
    };
  }

  startEditing = () => {
    const {
      user = {},
    } = this.props;
    this.setState({
      editing: true,
      name: user.name,
      bio: user.data && user.data.bio,
    });
  };

  cancelEditing = () => {
    this.setState({
      editing: false,
      name: undefined,
      bio: undefined,
      thumbnail: undefined,
      dataURL: undefined,
    });
  };

  submit = () => {
    const {
      patchUser,
      user = {},
    } = this.props;

    let p = Promise.resolve();

    if(user.id != null){
      const patchData = {};
      if(this.state.name){
        patchData.name = this.state.name;
      }
      if(this.state.bio){
        patchData.data = {
          ...user.data,
          bio: this.state.bio,
        };
      }
      if(this.state.thumbnail){
        patchData.picture = this.state.thumbnail;
      }
      p = patchUser(user.id, patchData);
    }
    p.then(() => {
      this.setState({
        editing: false,
        name: undefined,
        bio: undefined,
        thumbnail: undefined,
        dataURL: undefined,
      });
    })
    .catch(e => {
      console.log('e :', e);
    });
  }

  render(){
    const {
      classes,
      user = {},
    } = this.props;

    const bio = user.data && user.data.bio;

    return (
      <React.Fragment>
        <div className={classes.space0} />
        <Centered className={classes.mainContainer}>
          <Card className={classes.card}>
            <CardMedia
              className={classes.media}
              image={bgImg}
              title=""
            >
              <div className={classes.space1} />
              <Centered
                className={classes.avatarContainer}
              >
                <Avatar
                  alt="Adelle Charles"
                  {...{/*src: bgImg*/}}
                  className={classNames(classes.orangeAvatar, classes.bigAvatar)}
                >
                  {this.state.editing && <input
                    accept="image/*"
                    className={classes.input}
                    id="icon-button-file"
                    type="file"
                    onChange={e => {
                      e.target.files[0] &&
                      (readFile(e.target.files[0], {
                        thumbnailInfo: {
                          maxWidth: 512,
                          maxHeight: 512,
                        },
                      })
                      .then(imgInfo => {
                        this.setState(imgInfo);
                        // console.log('imgInfo :', imgInfo);
                      }));
                    }}
                  />}
                  {user.picture && <img src={(this.state.editing && this.state.thumbnail) || user.picture} className={classes.avatarImage}>
                  </img>
                  }
                  {!user.picture && <Typography variant="display1">
                    {(user.name || '').substr(0, 2)}
                  </Typography>
                  }
                  {this.state.editing &&
                    <React.Fragment>
                      <div
                        className={classNames(classes.absolute, classes.bigAvatar)}
                        style={{backgroundColor: 'rgba(0, 0, 0, 0.35)'}}
                      />
                      <label htmlFor="icon-button-file">
                        <IconButton component="span" className={classNames(classes.editPhoto)}>
                          <PhotoCamera />
                        </IconButton>
                      </label>
                    </React.Fragment>}
                </Avatar>
                <Button
                  variant="fab"
                  color={this.state.editing ? 'default' : 'secondary'}
                  aria-label={this.state.editing ? 'cancel' : 'edit'}
                  className={classes.editButton}
                  onClick={this.state.editing ? this.cancelEditing : this.startEditing}
                >
                  {this.state.editing ? (<CloseIcon />) : (<EditIcon />)}
                </Button>
              </Centered>
            </CardMedia>
            <div className={classes.space2} />
            <CardContent>
              {this.state.editing ?
                <React.Fragment>
                  <FormTextInput
                    id={'name'}
                    label={'Name'}
                    onKeyPress={() => {}}
                    value={this.state.editing ? this.state.name : user.name}
                    onChange={e => {
                      this.setState({
                        name: e.target.value,
                      });
                    }}
                    formProps={{
                      style: {
                        width: '100%',
                      },
                    }}
                    fullWidth
                  />
                  <div className={classes.space3} />
                </React.Fragment> :
                <Centered>
                  <Typography gutterBottom variant="headline" component="h2">
                    {user.name}
                  </Typography>
                </Centered>
              }
              {this.state.editing ?
                <FormTextInput
                  id={'bio'}
                  label={'Bio'}
                  onKeyPress={() => {}}
                  value={this.state.editing ? this.state.bio : bio}
                  onChange={e => {
                    this.setState({
                      bio: e.target.value,
                    });
                  }}
                  formProps={{
                    style: {
                      width: '100%',
                    },
                  }}
                  multiline
                  fullWidth
                  rows={1}
                  rowsMax={10}
                /> :
                <Typography component="p">
                  {bio}
                </Typography>
              }
            </CardContent>
            {this.state.editing &&
              <CardActions>
                <SuccessButton
                  size="small"
                  variant="raised"
                  fullWidth
                  color="primary"
                  onClick={this.submit}
                >
                  Save
                </SuccessButton>
              </CardActions>}
          </Card>
        </Centered>
      </React.Fragment>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  user: makeMyUserSelector(),
});

export default compose(
  connect(mapStateToProps, {
    patchUser,
  }),
  withStyles(styles),
)(Profile);

