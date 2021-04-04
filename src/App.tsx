import './App.css';
import React from 'react';
import Card from './ImageCard';
import Square from "./Square";
import Timer from "./Timer";
import monitor from "./utils/monitor";
import { shuffleArray } from "./utils/lib";
import logo from "./logo.png";
import { MyCustomSwitch } from "./components/Switch";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

type Position = {
  x: number,
  y: number,
  index: number,
  squareSide: number,
  rotation?: number
};


type ImageData = {
  width: number,
  height: number,
  rows: number,
  columns: number,
  squareSide: number
}

type MyState = {
  imageData: ImageData;
  imageUrl: string,
  shuffledPos: Array<Position>;
  rotatedPos?: Array<Position>;
  hardMode: boolean,
  gameStarted: boolean;
  imageError: boolean;
  positions: Array<Position>,
  scaleView: number
  gameWon: boolean,
  selectedImageType: string,
  correctMoves: number,
  showRules: boolean,
  dialogOpen: boolean
};

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
    backgroundColor: 'lightsalmon',
    color: 'white'
  },
  title: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    right: '5px'
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  // @ts-ignore 
  return <Slide direction="up" ref={ref} {...props} />;
});

const getImageUrl = (imageType) => {
  let imageUrl;
  const isMobile = window.innerWidth <= 400;
  switch (imageType) {
    case 'animal': {
      imageUrl = `https://raw.githubusercontent.com/tukuna30/images/master/camels${isMobile ? '_mobile' : ''}.png`;
      break;
    }
    case 'scenic': {
      imageUrl = `https://raw.githubusercontent.com/tukuna30/images/master/animal${isMobile ? '_mobile' : ''}.png`;
      break;
    }
    case 'nature': {
      imageUrl = `https://raw.githubusercontent.com/tukuna30/images/master/scenic${isMobile ? '_mobile' : ''}.png`;
      break;
    }
    case 'greenery': {
      imageUrl = `https://raw.githubusercontent.com/tukuna30/images/master/garden${isMobile ? '_mobile' : ''}.png`
      break;
    }
    // case 'easy': {
    //   imageUrl = `https://raw.githubusercontent.com/tukuna30/images/master/abcd${isMobile ? '_mobile' : ''}.png`
    // }
  }
  return imageUrl;
}

const App = () => {
  const classes = useStyles();

  const [showRules, setShowRules] = React.useState(false);
  const [selectedImageType, setSelectedImageType] = React.useState('nature');
  const [gameWon, setGameWon] = React.useState(false);
  const [gameStarted, setGameStarted] = React.useState(false);
  const [scaleView, _setScaleView] = React.useState(1);
  const [hardMode, _setHardMode] = React.useState(true);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [rotatedPos, setRotatedPos] = React.useState<Position[]>([]);
  const [imageError, setImageError] = React.useState(false);
  const [_shuffledPos, setShuffledPos] = React.useState<Position[]>([]);
  const [imageData, _setImageData] = React.useState({ width: 0, height: 0, squareSide: 1, rows: 1, columns: 1 });
  const [imageUrl, setImageUrl] = React.useState(getImageUrl('nature'));
  const [correctMoves, setCorrectMoves] = React.useState(0);
  const [dialogOpen, setDialogOpen] = React.useState(true);

  React.useEffect(() => {
    loadImage(imageUrl);
  }, []);

  const handleClose = () => {
    openDialog(false);
  };

  const openDialog = (value) => {
    setDialogOpen(value);
  }

  const setImageData = (width, height) => {
    const obj = getHardPositions(width, height);
    const positions = obj.positions;
    setTimeout(() => {
      suffle(positions);
      _setImageData({ width, height, rows: obj.rows, columns: obj.columns, squareSide: obj.squareSide });
      setPositions(positions as any);
      setImageError(false);
    }, 50);
  }

  const updatePosition = (from, to) => {
    if (!_shuffledPos.length || !gameStarted) {
      return;
    }

    console.log('suffledpos', _shuffledPos);

    const shuffledPos = [..._shuffledPos];
    const temp = shuffledPos[from];
    shuffledPos[from] = shuffledPos[to];
    shuffledPos[to] = temp;
    const status = gameStatus(shuffledPos);
    setShuffledPos(shuffledPos);
    setGameStarted(!status.gameWon);
    setGameWon(status.gameWon);
    setCorrectMoves(status.correctMoves);

    console.log(status, 'status');
    if (status.gameWon) {
      monitor.emit('gameWon', {});
    }
  }

  const updateRotation = (index, value) => {
    if (!hardMode) return;
    const shuffledPos = [..._shuffledPos];
    shuffledPos[index].rotation = value;
    const status = gameStatus(shuffledPos);

    setShuffledPos(shuffledPos);
    setGameStarted(!status.gameWon);
    setGameWon(status.gameWon);
    setCorrectMoves(status.correctMoves);

    if (status.gameWon) {
      monitor.emit('gameWon', {});
    }
  }

  const loadImage = (imageSrc) => {
    const loader = document.getElementById('loader-container');
    loader && loader.classList.remove('hide');

    let image = new Image();
    image.src = imageSrc;
    image.onload = (event) => {
      const obj = getHardPositions(image.width, image.height);
      const positions = obj.positions;
      //this.suffle(positions);
      _setImageData({ width: image.width, height: image.height, rows: obj.rows, columns: obj.columns, squareSide: obj.squareSide });
      setPositions(positions);
      setImageError(false);

      //remove the image from dom
      const existingImage = document.getElementById('hidden-image-container');
      existingImage && document.body.removeChild(existingImage);
      loader && loader.classList.add('hide');
    }

    image.onerror = () => {
      setImageError(true);
      loader && loader.classList.add('hide');
    }

    const div = document.createElement('div');
    div.setAttribute('id', 'hidden-image-container');
    div.setAttribute('style', "display: none")
    const existingImage = document.getElementById('hidden-image-container');
    existingImage && document.body.removeChild(existingImage);

    div.append(image);
    document.body.prepend(div);
  }

  const getHardPositions = (width, height) => {
    const positions: Array<Position> = [];
    const cardSize = 7;
    const totalArea = width * height;
    const squareArea = totalArea / (Math.pow(cardSize, 2));
    const squareSide = Math.floor(Math.sqrt(squareArea));
    let columns = Math.floor(width / squareSide);
    let rows = Math.floor(height / squareSide);
    columns = columns - 1;
    rows = rows - 1;

    Array(rows).fill(0, 0, rows).map((x, i) => i).forEach((y) => {
      return Array(columns).fill(0, 0, columns).map((x, i) => i).forEach((x) => {
        positions.push({ x: -(x + 1) * squareSide, y: -(y + 1) * squareSide, index: (rows * y) + x, squareSide });
      });
    });
    return { positions, rows, columns, squareSide };
  }

  const setHardMode = () => {
    if (gameStarted) return;
    _setHardMode(!hardMode);
  }

  const playAgain = () => {
    startGame();
  }

  const suffle = (_positions?) => {
    let rotatedPos = _positions || positions;
    if (hardMode) {
      rotatedPos = rotatedPos.map((pos) => {
        return { ...pos, rotation: Math.floor(Math.random() * 4) };
      });

      setRotatedPos(rotatedPos);
    }

    const shuffledPos = shuffleArray(rotatedPos.slice());
    setShuffledPos(shuffledPos);
  }

  const startGame = () => {
    if (gameStarted) {
      return;
    }

    suffle([...positions]);
    setGameStarted(true);
    setGameWon(false);

    monitor.emit('gameStarted', null);
  }

  const reset = () => {
    monitor.emit('gameResetted', null);

    setPositions([...positions]);
    //suffle(); only suffle in hard mode 
    setGameStarted(false);
    setGameWon(false);
    _setScaleView(1);
  }

  const gameStatus = (newPositions) => {
    let correctMoves = 0;
    let won = true;

    if (_shuffledPos.length) {
      console.log('rotated', rotatedPos);
      (rotatedPos || positions).forEach((pos, index) => {
        const correctPos = (pos.x === newPositions[index].x &&
          pos.y === newPositions[index].y &&
          newPositions[index].rotation === 0);

        if (correctPos) {
          correctMoves += 1;
        } else {
          won = false;
        }
      });
      return { gameWon: won, correctMoves };
    }

    return { gameWon: false, correctMoves };
  }

  const setScaleView = (sign = '+') => {
    const zoom = sign === '+' ? 10 : -10;
    if (sign === '-' && scaleView < .5 || sign === '+' && scaleView > 1.5) {
      return;
    }
    _setScaleView(scaleView * (100 + zoom) / 100);
  }

  const renderImageSpans = (pos, index) => {
    const xPos = pos.x;
    const yPos = pos.y;
    const squareSide = pos.squareSide;
    const style = { background: `url("${imageUrl}") ${xPos}px ${yPos}px no-repeat`, width: `${squareSide}px`, height: `${squareSide}px`, rotation: pos.rotation || 0 };

    return <Square imageData={imageData} index={index} key={`c${index}`} dropHandler={updatePosition} style={{ width: style.width, height: style.height, border: '1px solid gray' }}>
      <Card updateRotation={updateRotation} gameStarted={gameStarted} style={style} key={index} index={index} className="image" /></Square>;
  }

  const toggleRulesView = () => {
    setShowRules(!showRules)
  }

  const handleImageTypeChange = (event) => {
    if (gameStarted) {
      return;
    }
    const imageType = event.target.value;
    const imageUrl = getImageUrl(imageType);
    loadImage(imageUrl);
    setSelectedImageType(event.target.value);
    setImageUrl(imageUrl);
  }

  if (imageError) {
    return <div>Failed to load image!</div>;
  }

  if (!imageData.width) {
    return null;
  }

  const containterWidth = imageData.squareSide * imageData.columns + 2 * imageData.columns; //`${imageData.width + 12}px`
  const containterHeight = imageData.squareSide * imageData.rows + 2 * imageData.rows; // `${imageData.height + 8}px`
  let imagePositions: Array<Position> = [];

  if (_shuffledPos.length) {
    imagePositions = _shuffledPos;
  } else if (rotatedPos && rotatedPos.length) {
    imagePositions = [...rotatedPos];
  } else {
    imagePositions = [...positions];
  };

  if (!gameStarted) {
    imagePositions = [...positions];
  }

  let tempArr: Array<Position> = [], imgagePositionsMatrix: Array<Array<Position>> = [];
  imagePositions.forEach((item, ind) => {
    tempArr.push(item);
    if (ind % imageData.columns === imageData.columns - 1) {
      imgagePositionsMatrix.push(tempArr);
      tempArr = [];
    }
  });

  return (
    <div className="App">
      <div className={_shuffledPos.length ? 'started' : ''} style={{ background: 'lightsalmon' }}>
        <div className='container'>
          <div className="wave">
            <div></div>
            {/* <label style={{margin: '2px', color: 'white', position: 'absolute', left: 0}}><input checked={hardMode} type="checkbox" style={{marginRight: '10px'}} disabled onClick={this.setHardMode}/>Hard mode enabled (Click on the cards to align properly)</label> */}
            <div className="button-container">
              <select placeholder="Pick image:" style={{ borderRadius: '5px', marginRight: '10px', height: '24px' }} value={selectedImageType} onChange={handleImageTypeChange}>
                <option value="" disabled>Pick image</option>
                <option value="scenic">Scenic</option>
                <option value="animal">Animal</option>
                <option value="nature">Nature</option>
                {/* <option value="easy">Easy</option> */}
                <option selected value="greenery">Greenery</option>
              </select>
              <button onClick={startGame}>Start Game</button>
              <button style={{ marginBottom: '10px' }} onClick={reset}>Reset Game</button>
              <Timer />
              <div className="zoom-buttons">
                <button onClick={() => setScaleView('-')}>-</button>
                <span style={{ color: "black", marginRight: '4px', marginLeft: '3px' }}>Zoom</span>
                <button onClick={() => setScaleView()}>+</button>
              </div>
              <span style={{ marginRight: '10px', color: 'white' }}>Rules</span>
              <MyCustomSwitch style={{ marginLeft: '5px' }} onChange={toggleRulesView} />
              {gameWon && <div style={{ color: 'white', marginLeft: '10px' }}><span>Congratulations!!! You've won.</span>
                <button onClick={playAgain}>Play again</button>
              </div>}
            </div>
          </div>
        </div>
        <div className='mid-section' style={{ paddingLeft: '20px' }}>
          <div style={{ width: containterWidth, height: containterHeight, margin: '20px 0', transform: `scale(${scaleView})`, transformOrigin: 'left top' }} className={`image-container ${(scaleView !== 100) ? 'zoom' : ''}`}>
            {(gameStarted || gameWon) && <div className='progress'>
              <span style={{ width: `${correctMoves / positions.length * 100}%` }} />
            </div>
            }
            {
              imgagePositionsMatrix.map((row, rindex) => {
                return (<div className="grid">
                  <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
                    {
                      row.map((pos, index) => {
                        return renderImageSpans(pos, rindex * imageData.columns + index);
                      })
                    }
                  </div>
                </div>)
              })
            }
          </div>
          {showRules && <div className='rules'>
            <span style={{ textDecoration: 'underline' }}>How to play</span>
            <ul style={{ listStyle: 'none' }}>
              <li>After starting the game, click on the cards to rotate and adjust properly.</li>
              <li>Drag a card and see allowed drop zones.</li>
              <li>Exchange positions by dropping the card.</li>
              <li>Check the progress bar!</li>
              <li>Use zoom +/- feature to increase/reduce image sizes.</li>
            </ul>
          </div>
          }
        </div>
        <div className='container bottom'>
          <div className="wave bottom">
            <div className="button-container bottom">
              <span><a style={{ color: 'white', textDecoration: 'none' }} href="mailto:tukuna.patro@gmail.com?subject=Suggestions">Have any suggestions?</a></span>
              <div>
                <span style={{ color: 'white' }}>Jigsaw game by Tukuna Patro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*
 // @ts-ignore */}
      <Dialog fullWidth open={dialogOpen} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Welcome to JigsawGame
            </Typography>
            <Button autoFocus color="inherit" className={classes.button} onClick={handleClose}>
              <CloseIcon />
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          <ListItem button>
            <ListItemText primary="Play and learn" secondary="Computer programming" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="JavaScript, HTML, CSS" secondary="ReactJS" />
          </ListItem>
        </List>
      </Dialog>
    </div>
  );
}

export default App;
