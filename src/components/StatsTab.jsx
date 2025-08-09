import React from 'react';
import PropTypes from 'prop-types';

function computeLifting(str) {
  if (str === 0) return '100 lbs';
  if (str <= 2) return '200 lbs';
  if (str <= 4) return '500 lbs';
  if (str <= 6) return '1000 lbs';
  if (str <= 8) return '5000 lbs';
  return '10,000 lbs';
}

function computeCarrying(str) {
  if (str === 0) return '50 lbs';
  if (str <= 2) return '100 lbs';
  if (str <= 4) return '250 lbs';
  if (str <= 6) return '500 lbs';
  if (str <= 8) return '2,500 lbs';
  return '5,000 lbs';
}

function computeMovementRate(spd) {
  if (spd === 0) return '20 ft';
  if (spd <= 2) return '25 ft';
  if (spd <= 4) return '30 ft';
  if (spd <= 6) return '40 ft';
  if (spd <= 8) return '60 ft';
  return '80 ft';
}

function computeRecoveryDie(wp) {
  if (wp === 0) return '1d4';
  if (wp <= 2) return '1d6';
  if (wp <= 4) return '1d8';
  if (wp <= 6) return '1d10';
  if (wp <= 8) return '1d12';
  return '1d20';
}

function computeSensesRange(aw) {
  if (aw === 0) return '5 ft';
  if (aw <= 2) return '10 ft';
  if (aw <= 4) return '20 ft';
  if (aw <= 6) return '50 ft';
  if (aw <= 8) return '100 ft';
  return 'Unaffected';
}

export default function StatsTab({ char, stats, remainingPoints, onIncrement, onDecrement }) {
  return (
    <div className="flex space-x-8 mb-6">
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-2">Attributes</h2>
        {stats.map(stat => (
          <div key={stat} className="flex items-center mb-2">
            <span className="w-32 capitalize font-medium">{stat}</span>
            <button onClick={() => onDecrement(stat)} disabled={char[stat]===0} className="px-2 border rounded">-</button>
            <span className="mx-2 w-6 text-center">{char[stat]}</span>
            <button onClick={() => onIncrement(stat)} disabled={char[stat]===3||remainingPoints===0} className="px-2 border rounded">+</button>
          </div>
        ))}
        <p className="mt-2 font-medium">Remaining Points: {remainingPoints}</p>
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-2">Derived Stats</h2>
        <p><strong>Lifting:</strong> {computeLifting(char.strength)}</p>
        <p><strong>Carrying:</strong> {computeCarrying(char.strength)}</p>
        <p><strong>Move:</strong> {computeMovementRate(char.speed)}</p>
        <p><strong>Recovery:</strong> {computeRecoveryDie(char.willpower)}</p>
        <p><strong>Senses:</strong> {computeSensesRange(char.awareness)}</p>
        <br />
        <p><strong>Physical Defense:</strong> {10 + char.strength + char.speed}</p>
        <p><strong>Cognitive Defense:</strong> {10 + char.intellect + char.willpower}</p>
        <p><strong>Spiritual Defense:</strong> {10 + char.awareness + char.presence}</p>
      </div>
    </div>
  );
}

StatsTab.propTypes = {
  char: PropTypes.shape({
    strength: PropTypes.number.isRequired,
    speed: PropTypes.number.isRequired,
    intellect: PropTypes.number.isRequired,
    willpower: PropTypes.number.isRequired,
    awareness: PropTypes.number.isRequired,
    presence: PropTypes.number.isRequired
  }).isRequired,
  stats: PropTypes.arrayOf(PropTypes.string).isRequired,
  remainingPoints: PropTypes.number.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired
};
