import React from 'react';
import monitor from "./utils/monitor";
type CardProps = {
  gameStarted: boolean,
  updateRotation: (a: number, b: number) => void,
  style: any,
  index: number,
};

const Card = ({ style, index, className, gameStarted, updateRotation }) => {
  const onDragStart = (e) => {
    e.dataTransfer.setData('id', 'card'); // without this on Firefox drag and drop fails
    if (!gameStarted) return;
    monitor.emit('dragInProgress', e);
  }

  const rotateImage = () => {
    if (!gameStarted) return;
    let rotation = style.rotation;
    rotation += 1;
    updateRotation(index, rotation % 4)
  };

  return (<div onClick={rotateImage} style={{ ...style, transform: `rotate(${style.rotation * 90}deg)` }} data-index={index} key={index} className={className}
    onDragStart={(e) => onDragStart(e)}
    draggable
  >
    <div className='overlay' />
  </div>);
}
export default Card;