import React from 'react';
import monitor from './utils/monitor';

function pad(val: number) { return val > 9 ? val.toString() : "0" + val; }

let intervalId = 0;
const Timer = () => {
  const [seconds, setSeconds] = React.useState("00");
  const [minutes, setMinutes] = React.useState("00");

  const startTimer = () => {
    let sec = 0;
    intervalId = window.setInterval(() => {
      setSeconds(pad(++sec % 60));
      setMinutes(pad(Math.floor(sec / 60)));
    }, 1000);
  }

  const stopTimer = (reset = false) => {
    console.log('reset, ', reset, intervalId);
    if (intervalId) {
      window.clearInterval(intervalId);
      if (reset) {
        setSeconds('00');
        setMinutes('00');
      }
    }
  }

  React.useEffect(() => {
    monitor.on('gameStarted', () => {
      startTimer();
    });

    monitor.on('gameWon', () => {
      stopTimer();
    });
    monitor.on('gameResetted', () => {
      stopTimer(true);
    });
  }, []);

  return (<div style={{
    display: 'inline-block', background: 'white',
    border: '1px solid gray', borderRadius: '5px',
    padding: '2px', marginRight: '10px',
    top: '2px',
    minWidth: '50px',
    position: 'relative'
  }}>
    <span>{minutes}:</span>
    <span>{seconds}</span>
  </div>);
}
export default Timer;