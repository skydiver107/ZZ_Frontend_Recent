import React from 'react';

const cardtext = [
  {
    text: 'Currently locked',
    value: '1500 POZ',
    img: '',
    color: true
  },
  {
    text: 'Next reward cycle',
    value: '04:43 hours',
    img: '',
    color: false
  },
  {
    text: 'Staking end',
    value: '04:30:40 days',
    img: '',
    color: false
  },
  {
    text: 'Maximum',
    value: '10 000 POZ',
    img: '',
    color: false
  },
  {
    text: 'Estimated IPY',
    value: '12.04%',
    img: '',
    color: true
  },
  {
    text: 'Duration',
    value: '14 days',
    img: '',
    color: false
  },
]

const StakeCard = () => {

  return (
    <div className='stake-card-container'>
      <div className='stake-card-wrapper'>
        <div className='flex'>
          <div className='w-2/4 flex justify-content-center'>
            <img style={{width: '64px'}} src='/img/bonding/poztoken64.svg'/>
          </div>
          <div className='w-2/4'>
            <div className='flex justify-content-between'>
             <div>
              <div className='f-OpenSans color25505 font-bold text-sm'>Pozzle IPY%</div>
              <div className='f-Hanson font-bold text-xl'>12.04%</div>
             </div>
             <div>
              <img src='/img/bonding/lock.svg'/>
             </div>
            </div>
            <div className='mt-3'>
              <div className='f-OpenSans color25505 font-bold text-sm'>Rewards Distributed</div>
              <div className='f-Hanson font-bold text-xl'>$46,049,231</div>
            </div>
          </div>
        </div>
        <div className='line'></div>
        <div>
          {cardtext.map((item, idx) => (
            <div key={idx} className='w-full flex justify-content-between'>
              <div className={item.color ? 'color875' : 'color25505'}>{item.text} {item.img ? <img src={item.img}/> : <></>}</div>
              <div>{item.value}</div>
            </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default StakeCard;