import Countdown from 'react-countdown';

export const renderer = ({ days, hours, minutes, seconds, completed }) => {

  if (completed) {
    return (
      <div>
        Claim POZ
      </div>
    )
  } else {
    return (
      <div className='mx-1 whitespace-nowrap'>
        {days}d {hours}h:{minutes}m:{seconds}s
      </div>
    );
  }
};

const CountdownComponent = ({ inputTime, setComplete }) => {

  return (
    <Countdown
      date={Date.now() + inputTime}
      renderer={renderer}
      onComplete={() => { setComplete(true) }}
    />
  )
}

export default CountdownComponent;