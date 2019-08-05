import blue from '@material-ui/core/colors/lightBlue';
import pink from '@material-ui/core/colors/pink';

export default {
  palette: {
    primary: { main: blue[900] }, // Purple and green play nicely together.
    secondary: { main: pink[700] }, // This is just green.A700 as hex.
    action: {
      // selected: blue[300]
    },
    background: {
      default: '#fff'
    }
  },
  typography: { useNextVariants: true }
};
