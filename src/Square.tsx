import React from 'react';
import monitor from './utils/monitor';

const isMovePossible = (imageData, src, dest) => {
  const rows = imageData.rows, columns = imageData.columns;

  const getMoveablePositions = (i, row, column) => {
    const validXY = [[row - 1, column - 1], [row - 1, column], [row - 1, column + 1], [row, column - 1], [row, column + 1], [row + 1, column - 1], [row + 1, column], [row + 1, column + 1]].filter(item => {
      return (item[0] >= 0 && item[1] >= 0 && item[0] <= rows - 1 && item[1] <= columns - 1)
    });
    return validXY.map(item => {
      return item[0] * columns + item[1];
    });
  }
  const allowedPos = Array(rows * columns).fill(0, 0, rows * columns).map((x, i) => i).reduce((a, i) => {
    a[i] = getMoveablePositions(i, Math.floor(i / columns), i % columns);
    return a;
  }, {});

  const allowedPlaces = allowedPos[src];
  return allowedPlaces && allowedPlaces.includes(dest);
}

const Square = ({ imageData, index, dropHandler, style, children }) => {
  const [highLight, setHighLight] = React.useState(false);
  const [currentDragIndex, setCurrentDragIndex] = React.useState(-1);

  React.useEffect(() => {
    monitor.on('dragInProgress', (event) => {
      setCurrentDragIndex(event.target.dataset.index);
      if (isMovePossible(imageData, event.target.dataset.index, index)) {
        setHighLight(true);
      }
    });

    monitor.on('dropFinish', (data) => {
      setCurrentDragIndex(-1);
      setHighLight(false);
    });

  }, []);


  const onDrop = (evt) => {
    monitor.emit('dropFinish', evt);
    setCurrentDragIndex(-1);
    setHighLight(false);

    if (isMovePossible(imageData, currentDragIndex, index)) {
      dropHandler(currentDragIndex, index);
    }
  }

  const onDragOver = (e) => {
    e.preventDefault();
  }

  const onDragEnd = (e) => {
    e.preventDefault();
    setHighLight(false);
  }

  const onDragEnter = (e) => {
    e.preventDefault();
  }

  const onDragLeave = (e) => {
    e.preventDefault();
    setHighLight(false);

    if (isMovePossible(imageData, e.target.dataset.index, index)) {
      setHighLight(false);
    }
  }

  const border = highLight ? '1px solid green' : '1px solid gray';
  const zoom = highLight ? '95%' : '100%';
  let classNames = currentDragIndex == index ? 'current-drag' : '';
  if (highLight) {
    classNames = `highlight ${classNames}`;
  }

  return (
    <div style={{ ...style, border }}
      className={classNames}
      // index={this.props.index}
      onDragOver={(e) => onDragOver(e)}
      onDrop={(e) => onDrop(e)}
      onDragEnd={(e) => onDragEnd(e)}
      onDragLeave={(e) => onDragLeave(e)}>
      {children}
    </div>
  );
}

export default Square;